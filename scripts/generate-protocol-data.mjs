import { readFile, readdir, rm, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
    MinecraftRelease,
    ProtocolChangelogGenerator,
} from '@minecraft/api-docs-generator';

const repositoryRoot = path.resolve(import.meta.dirname, '..');
const manifestPath = path.join(repositoryRoot, '.cache', 'protocol-releases', 'manifest.json');
const dataDirectory = path.join(repositoryRoot, 'tools', 'protocol-docs-generator', 'src', 'data');
const releasesDirectory = path.join(dataDirectory, 'releases');

const readProtocolSchemas = async schemaDirectory => {
    const schemas = {};
    const visit = async directory => {
        for (const entry of await readdir(directory, { withFileTypes: true })) {
            const entryPath = path.join(directory, entry.name);
            if (entry.isDirectory()) await visit(entryPath);
            else if (entry.isFile() && entry.name.endsWith('.json')) {
                schemas[path.resolve(entryPath)] = JSON.parse(await readFile(entryPath, 'utf8'));
            }
        }
    };
    await visit(schemaDirectory);
    return schemas;
};

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const snapshots = [];
for (const entry of manifest.releases) {
    const schemas = await readProtocolSchemas(path.resolve(repositoryRoot, entry.schemaDirectory));
    if (Object.keys(schemas).length === 0) continue;
    const release = new MinecraftRelease(entry.minecraftVersion);
    release.protocol_schemas = schemas;
    snapshots.push({ release, releaseDate: entry.releaseDate, version: entry.version });
}
if (snapshots.length === 0) throw new Error(`No protocol releases were found in '${manifestPath}'.`);

const changelogGenerator = new ProtocolChangelogGenerator();
const entriesByVersion = new Map(manifest.releases.map(entry => [entry.version, entry]));
const releases = snapshots.map(snapshot => ({
    entry: entriesByVersion.get(snapshot.version),
    metadata: changelogGenerator.generateReleaseMetadata(snapshot.release),
    releaseDate: snapshot.releaseDate,
    version: snapshot.version,
}));
const protocol = {
    ...releases[0].metadata,
    changelog: changelogGenerator.generateChangelogs(snapshots),
};
const versions = {
    latest: releases[0].version,
    releases: releases.map(release => ({
        minecraftVersion: release.metadata.minecraftVersion,
        name: release.entry?.name ?? release.version,
        packetSlugs: release.metadata.packets.map(packet => packet.slug),
        preview: release.entry?.preview ?? false,
        protocolVersion: release.metadata.protocolVersion,
        releaseDate: release.releaseDate,
        tag: release.entry?.tag ?? '',
        typeSlugs: release.metadata.types.map(type => type.slug),
        url: release.entry?.url ?? '',
        version: release.version,
    })),
};

await rm(releasesDirectory, { force: true, recursive: true });
await mkdir(releasesDirectory, { recursive: true });
await writeFile(path.join(dataDirectory, 'protocol.json'), `${JSON.stringify(protocol, undefined, 2)}\n`, 'utf8');
await writeFile(path.join(dataDirectory, 'versions.json'), `${JSON.stringify(versions, undefined, 2)}\n`, 'utf8');
await Promise.all(
    releases.map(release =>
        writeFile(
            path.join(releasesDirectory, `${release.version}.json`),
            `${JSON.stringify(release.metadata, undefined, 2)}\n`,
            'utf8'
        )
    )
);
console.log(`Generated Astro data for ${releases.length} protocol release${releases.length === 1 ? '' : 's'}.`);