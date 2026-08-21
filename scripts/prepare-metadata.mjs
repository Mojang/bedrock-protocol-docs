import { createWriteStream } from 'node:fs';
import { mkdir, mkdtemp, readFile, readdir, rm, copyFile, writeFile } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import process from 'node:process';

import semver from 'semver';
import * as tar from 'tar';

const repositoryRoot = path.resolve(import.meta.dirname, '..');
const cacheRoot = path.join(repositoryRoot, '.cache');
const releasesRoot = path.join(cacheRoot, 'protocol-releases');
const inputRoot = path.join(cacheRoot, 'protocol-input', 'json_schemas', 'protocol');
const repository = process.env.GITHUB_REPOSITORY ?? 'Mojang/bedrock-protocol-docs';
const token = process.env.GITHUB_TOKEN;

const requestHeaders = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'bedrock-protocol-docs-generator',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

const walkJsonFiles = async directory => {
    const files = [];
    for (const entry of await readdir(directory, { withFileTypes: true })) {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) files.push(...(await walkJsonFiles(entryPath)));
        else if (entry.isFile() && entry.name.endsWith('.json') && entry.name !== '__protocoldoc.json') files.push(entryPath);
    }
    return files;
};

const readSchemaMetadata = async schemaDirectory => {
    for (const schemaPath of await walkJsonFiles(schemaDirectory)) {
        const schema = JSON.parse(await readFile(schemaPath, 'utf8'));
        if (schema && !Array.isArray(schema) && schema['x-minecraft-version'] && schema['x-protocol-version']) {
            return {
                minecraftVersion: schema['x-minecraft-version'],
                protocolVersion: String(schema['x-protocol-version']),
            };
        }
    }
    throw new Error(`No versioned protocol schemas were found in ${schemaDirectory}.`);
};

const copySchemas = async (sourceDirectory, destinationDirectory) => {
    const schemaPaths = await walkJsonFiles(sourceDirectory);
    await mkdir(destinationDirectory, { recursive: true });
    for (const schemaPath of schemaPaths) {
        const relativePath = path.relative(sourceDirectory, schemaPath);
        const destinationPath = path.join(destinationDirectory, relativePath);
        await mkdir(path.dirname(destinationPath), { recursive: true });
        await copyFile(schemaPath, destinationPath);
    }
};

const fetchReleases = async () => {
    const releases = [];
    for (let page = 1; ; page += 1) {
        const response = await fetch(`https://api.github.com/repos/${repository}/releases?per_page=100&page=${page}`, {
            headers: requestHeaders,
        });
        if (!response.ok) throw new Error(`GitHub releases request failed with ${response.status}: ${await response.text()}`);
        const pageReleases = await response.json();
        releases.push(...pageReleases.filter(release => !release.draft));
        if (pageReleases.length < 100) return releases;
    }
};

const download = async (url, destination) => {
    const response = await fetch(url, { headers: requestHeaders, redirect: 'follow' });
    if (!response.ok || !response.body) throw new Error(`Download failed with ${response.status}: ${url}`);
    await pipeline(response.body, createWriteStream(destination));
};

const findJsonDirectory = async directory => {
    const candidates = [];
    const visit = async current => {
        for (const entry of await readdir(current, { withFileTypes: true })) {
            if (!entry.isDirectory()) continue;
            const entryPath = path.join(current, entry.name);
            if (entry.name === 'json') candidates.push(entryPath);
            else await visit(entryPath);
        }
    };
    await visit(directory);
    for (const candidate of candidates) {
        if ((await walkJsonFiles(candidate)).length > 0) return candidate;
    }
    throw new Error(`The release archive did not contain a protocol json directory.`);
};

const stageRelease = async release => {
    const temporaryDirectory = await mkdtemp(path.join(tmpdir(), 'bedrock-protocol-docs-'));
    try {
        const archivePath = path.join(temporaryDirectory, 'release.tgz');
        const extractionPath = path.join(temporaryDirectory, 'source');
        await mkdir(extractionPath);
        await download(release.tarball_url, archivePath);
        await tar.x({ cwd: extractionPath, file: archivePath });
        const sourceDirectory = await findJsonDirectory(extractionPath);
        const schemaMetadata = await readSchemaMetadata(sourceDirectory);
        const normalizedTag = release.tag_name.replace(/^release[/-]/i, '').replace(/^v/, '');
        const version = semver.valid(normalizedTag) ?? schemaMetadata.minecraftVersion;
        if (!semver.valid(version)) throw new Error(`Release '${release.tag_name}' does not resolve to a semantic version.`);
        const schemaDirectory = path.join(releasesRoot, String(release.id), 'json_schemas', 'protocol');
        await copySchemas(sourceDirectory, schemaDirectory);
        return {
            minecraftVersion: schemaMetadata.minecraftVersion,
            name: release.name || release.tag_name,
            preview: release.prerelease,
            protocolVersion: schemaMetadata.protocolVersion,
            releaseDate: (release.published_at ?? release.created_at).slice(0, 10),
            schemaDirectory: path.relative(repositoryRoot, schemaDirectory).split(path.sep).join('/'),
            tag: release.tag_name,
            url: release.html_url,
            version,
        };
    } finally {
        await rm(temporaryDirectory, { force: true, recursive: true });
    }
};

await rm(cacheRoot, { force: true, recursive: true });
await mkdir(releasesRoot, { recursive: true });

const githubReleases = await fetchReleases();
const releases = [];
if (githubReleases.length > 0) {
    for (const [index, release] of githubReleases.entries()) {
        console.log(`Downloading release ${index + 1}/${githubReleases.length}: ${release.tag_name}`);
        releases.push(await stageRelease(release));
    }
} else {
    const sourceDirectory = path.join(repositoryRoot, 'json');
    const schemaMetadata = await readSchemaMetadata(sourceDirectory);
    const schemaDirectory = path.join(releasesRoot, 'current', 'json_schemas', 'protocol');
    await copySchemas(sourceDirectory, schemaDirectory);
    releases.push({
        minecraftVersion: schemaMetadata.minecraftVersion,
        name: 'Current checkout',
        preview: false,
        protocolVersion: schemaMetadata.protocolVersion,
        releaseDate: '',
        schemaDirectory: path.relative(repositoryRoot, schemaDirectory).split(path.sep).join('/'),
        tag: '',
        url: `https://github.com/${repository}`,
        version: schemaMetadata.minecraftVersion,
    });
    console.log('No GitHub releases found; staged the current checkout.');
}

releases.sort((left, right) => semver.rcompare(left.version, right.version));
const duplicateVersion = releases.find((release, index) => releases.findIndex(candidate => candidate.version === release.version) !== index);
if (duplicateVersion) throw new Error(`Multiple GitHub releases resolve to version '${duplicateVersion.version}'.`);

const latestSchemaDirectory = path.resolve(repositoryRoot, releases[0].schemaDirectory);
await copySchemas(latestSchemaDirectory, inputRoot);
await writeFile(
    path.join(releasesRoot, 'manifest.json'),
    `${JSON.stringify({ generatedAt: new Date().toISOString(), repository, releases }, undefined, 2)}\n`,
    'utf8'
);
console.log(`Prepared ${releases.length} protocol release${releases.length === 1 ? '' : 's'}; latest is ${releases[0].version}.`);
