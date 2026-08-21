import { copyFile, readFile, readdir, rm, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
    MinecraftRelease,
    ProtocolChangelogGenerator,
} from '@minecraft/api-docs-generator';
import matter from 'gray-matter';

const repositoryRoot = path.resolve(import.meta.dirname, '..');
const manifestPath = path.join(repositoryRoot, '.cache', 'protocol-releases', 'manifest.json');
const dataDirectory = path.join(repositoryRoot, 'tools', 'protocol-docs-generator', 'src', 'data');
const releasesDirectory = path.join(dataDirectory, 'releases');
const guidesNavigationPath = path.join(dataDirectory, 'guides.json');
const additionalDocsDirectory = path.join(repositoryRoot, 'additional_docs');
const guidesPagesDirectory = path.join(repositoryRoot, 'tools', 'protocol-docs-generator', 'src', 'pages', 'guides');
const guidesAssetsDirectory = path.join(repositoryRoot, 'tools', 'protocol-docs-generator', 'src', 'assets', 'guides');

const slugify = value => value
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

const guideSlug = relativePath => {
    const parsed = path.posix.parse(relativePath.replaceAll('\\', '/'));
    return [...parsed.dir.split('/').filter(Boolean), parsed.name].map(slugify).join('-');
};

const humanize = value => value
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const demoteHeadings = markdown => {
    let fenceMarker;
    return markdown.split('\n').map(line => {
        const fence = line.match(/^\s*(`{3,}|~{3,})/);
        if (fence) {
            if (!fenceMarker) fenceMarker = fence[1][0];
            else if (fence[1][0] === fenceMarker) fenceMarker = undefined;
            return line;
        }
        return fenceMarker ? line : line.replace(/^(#{1,5}) /, '#$1 ');
    }).join('\n');
};

const relativeGuideUrl = (currentSlug, targetPath) => {
    const targetSlug = guideSlug(targetPath);
    return `${path.posix.relative(`guides/${currentSlug}`, `guides/${targetSlug}`) || '.'}/`;
};

const rewriteGuideLinks = (markdown, relativePath, metadata) => {
    const currentSlug = guideSlug(relativePath);
    const currentDirectory = path.posix.dirname(relativePath.replaceAll('\\', '/'));
    const packetSlugs = new Map(metadata.packets.map(packet => [packet.title, packet.slug]));
    const typeSlugs = new Map(metadata.types.map(type => [type.title, type.slug]));

    return markdown.replace(/(!?\[[^\]]*\]\()([^\s)]+)([^)]*\))/g, (match, prefix, href, suffix) => {
        if (!href.startsWith('.')) return match;

        const targetPath = path.posix.normalize(path.posix.join(currentDirectory, decodeURI(href)));
        if (targetPath.endsWith('.md') || targetPath.endsWith('.properties')) {
            return `${prefix}${relativeGuideUrl(currentSlug, targetPath)}${suffix}`;
        }
        if (/(^|\/)html\/[^/]+\.html$/.test(targetPath)) {
            const documentName = path.posix.basename(targetPath, '.html');
            let target = 'latest/';
            if (packetSlugs.has(documentName)) target += `packets/${packetSlugs.get(documentName)}/`;
            else if (typeSlugs.has(documentName)) target += `types/${typeSlugs.get(documentName)}/`;
            else if (documentName === 'enums') target += 'types/';
            const relativeUrl = path.posix.relative(`guides/${currentSlug}`, target) || '.';
            return `${prefix}${relativeUrl}/${suffix}`;
        }
        if (targetPath.endsWith('.svg')) {
            const assetName = `${slugify(path.posix.basename(targetPath, '.svg'))}.svg`;
            return `${prefix}../../assets/guides/${assetName}${suffix}`;
        }
        return match;
    });
};

const generateGuides = async metadata => {
    await rm(guidesPagesDirectory, { force: true, recursive: true });
    await rm(guidesAssetsDirectory, { force: true, recursive: true });
    await mkdir(guidesPagesDirectory, { recursive: true });
    await mkdir(guidesAssetsDirectory, { recursive: true });
    const guides = [];

    const visit = async directory => {
        for (const entry of await readdir(directory, { withFileTypes: true })) {
            const entryPath = path.join(directory, entry.name);
            if (entry.isDirectory()) {
                await visit(entryPath);
                continue;
            }
            if (!entry.isFile()) continue;

            const relativePath = path.relative(additionalDocsDirectory, entryPath).replaceAll('\\', '/');
            if (relativePath === 'README.md') continue;
            if (entry.name.endsWith('.svg')) {
                await copyFile(entryPath, path.join(guidesAssetsDirectory, `${slugify(path.parse(entry.name).name)}.svg`));
                continue;
            }
            if (!entry.name.endsWith('.md')) continue;

            const slug = guideSlug(relativePath);
            const source = await readFile(entryPath, 'utf8');
            const { content, data } = matter(source);
            const heading = content.match(/^#\s+(.+)$/m)?.[1].trim();
            const guideDirectory = path.posix.dirname(relativePath);
            const title = typeof data.title === 'string' ? data.title : heading ?? humanize(path.parse(entry.name).name);
            const section = typeof data.section === 'string'
                ? data.section
                : guideDirectory === '.' ? 'Other' : humanize(guideDirectory.split('/')[0]);
            const order = Number.isFinite(data.order) ? data.order : Number.POSITIVE_INFINITY;
            const sectionOrder = Number.isFinite(data.sectionOrder) ? data.sectionOrder : Number.POSITIVE_INFINITY;
            const sourceBody = content.replace(/^# .+\r?\n+/, '');
            const markdown = rewriteGuideLinks(demoteHeadings(sourceBody), relativePath, metadata);
            const frontmatter = `---\nlayout: ../../layouts/GuideLayout.astro\ntitle: ${JSON.stringify(title)}\n---\n\n`;
            await writeFile(path.join(guidesPagesDirectory, `${slug}.md`), `${frontmatter}${markdown}`, 'utf8');
            guides.push({ order, path: `/guides/${slug}/`, section, sectionOrder, title });
        }
    };
    await visit(additionalDocsDirectory);

    const sectionsByTitle = new Map();
    for (const guide of guides) {
        const section = sectionsByTitle.get(guide.section) ?? {
            guides: [],
            order: guide.sectionOrder,
            title: guide.section,
        };
        section.order = Math.min(section.order, guide.sectionOrder);
        section.guides.push({ order: guide.order, path: guide.path, title: guide.title });
        sectionsByTitle.set(guide.section, section);
    }
    const navigation = [...sectionsByTitle.values()]
        .sort((left, right) => left.order - right.order || left.title.localeCompare(right.title))
        .map(section => ({
            title: section.title,
            guides: section.guides
                .sort((left, right) => left.order - right.order || left.title.localeCompare(right.title))
                .map(({ order, ...guide }) => guide),
        }));
    await writeFile(guidesNavigationPath, `${JSON.stringify(navigation, undefined, 2)}\n`, 'utf8');
};

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
await generateGuides(releases[0].metadata);
console.log(`Generated Astro data for ${releases.length} protocol release${releases.length === 1 ? '' : 's'}.`);