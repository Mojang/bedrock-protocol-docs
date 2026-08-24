import { copyFile, readFile, readdir, rm, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
    MinecraftRelease,
    ProtocolChangelogGenerator,
} from '@minecraft/api-docs-generator';
import type {
    ProtocolReleaseMetadata,
    ProtocolReleaseSnapshot,
} from '@minecraft/api-docs-generator';
import matter from 'gray-matter';

import { isRecord, parseProtocolManifest } from './protocol-manifest.mts';

interface Guide {
    order: number;
    path: string;
    section: string;
    sectionOrder: number;
    title: string;
}

interface GuideSection {
    guides: Array<Pick<Guide, 'order' | 'path' | 'title'>>;
    order: number;
    title: string;
}

interface LegacyChangelog {
    date: string | undefined;
    identifier: string;
    path: string;
    title: string;
}

interface ProtocolSnapshot extends ProtocolReleaseSnapshot {
    preview: boolean;
}

const repositoryRoot = path.resolve(import.meta.dirname, '..');
const manifestPath = path.join(repositoryRoot, '.cache', 'protocol-releases', 'manifest.json');
const dataDirectory = path.join(repositoryRoot, 'tools', 'protocol-docs-generator', 'src', 'data');
const releasesDirectory = path.join(dataDirectory, 'releases');
const guidesNavigationPath = path.join(dataDirectory, 'guides.json');
const legacyChangelogsNavigationPath = path.join(dataDirectory, 'legacy-changelogs.json');
const additionalDocsDirectory = path.join(repositoryRoot, 'additional_docs');
const guidesPagesDirectory = path.join(repositoryRoot, 'tools', 'protocol-docs-generator', 'src', 'pages', 'guides');
const guidesAssetsDirectory = path.join(repositoryRoot, 'tools', 'protocol-docs-generator', 'src', 'assets', 'guides');
const legacyChangelogsDirectory = path.join(repositoryRoot, 'legacy_changelogs');
const legacyChangelogsPagesDirectory = path.join(repositoryRoot, 'tools', 'protocol-docs-generator', 'src', 'pages', 'changelog', 'legacy', 'entries');
const legacyChangelogsAssetsDirectory = path.join(repositoryRoot, 'tools', 'protocol-docs-generator', 'src', 'assets', 'legacy-changelogs');

const slugify = (value: string): string => value
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

const guideSlug = (relativePath: string): string => {
    const parsed = path.posix.parse(relativePath.replaceAll('\\', '/'));
    return [...parsed.dir.split('/').filter(Boolean), parsed.name].map(slugify).join('-');
};

const legacyChangelogSlug = (relativePath: string): string => {
    const parsed = path.posix.parse(relativePath.replaceAll('\\', '/'));
    const name = parsed.name.replace(/^change-?log/i, 'changelog');
    return [...parsed.dir.split('/').filter(Boolean), name].map(slugify).join('-');
};
const legacyAssetName = (relativePath: string): string => {
    const extension = path.posix.extname(relativePath).toLowerCase();
    return `${guideSlug(relativePath)}${extension}`;
};

const humanize = (value: string): string => value
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const demoteHeadings = (markdown: string): string => {
    let fenceMarker: string | undefined;
    return markdown.split('\n').map(line => {
        const fence = line.match(/^\s*(`{3,}|~{3,})/);
        if (fence) {
            const marker = fence[1]?.[0];
            if (!marker) return line;
            if (!fenceMarker) fenceMarker = marker;
            else if (marker === fenceMarker) fenceMarker = undefined;
            return line;
        }
        return fenceMarker ? line : line.replace(/^(#{1,5}) /, '#$1 ');
    }).join('\n');
};

const relativeGuideUrl = (currentSlug: string, targetPath: string): string => {
    const targetSlug = guideSlug(targetPath);
    return `${path.posix.relative(`guides/${currentSlug}`, `guides/${targetSlug}`) || '.'}/`;
};

const rewriteGuideLinks = (markdown: string, relativePath: string, metadata: ProtocolReleaseMetadata): string => {
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

const generateGuides = async (metadata: ProtocolReleaseMetadata): Promise<void> => {
    await rm(guidesPagesDirectory, { force: true, recursive: true });
    await rm(guidesAssetsDirectory, { force: true, recursive: true });
    await mkdir(guidesPagesDirectory, { recursive: true });
    await mkdir(guidesAssetsDirectory, { recursive: true });
    const guides: Guide[] = [];

    const visit = async (directory: string): Promise<void> => {
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
            const { content, data: rawData } = matter(source);
            const data = isRecord(rawData) ? rawData : {};
            const heading = content.match(/^#\s+(.+)$/m)?.[1]?.trim();
            const guideDirectory = path.posix.dirname(relativePath);
            const title = typeof data.title === 'string' ? data.title : heading ?? humanize(path.parse(entry.name).name);
            const section = typeof data.section === 'string'
                ? data.section
                : guideDirectory === '.' ? 'Other' : humanize(guideDirectory.split('/')[0] ?? guideDirectory);
            const order = typeof data.order === 'number' && Number.isFinite(data.order) ? data.order : Number.POSITIVE_INFINITY;
            const sectionOrder = typeof data.sectionOrder === 'number' && Number.isFinite(data.sectionOrder)
                ? data.sectionOrder
                : Number.POSITIVE_INFINITY;
            const sourceBody = content.replace(/^# .+\r?\n+/, '');
            const markdown = rewriteGuideLinks(demoteHeadings(sourceBody), relativePath, metadata);
            const frontmatter = `---\nlayout: ../../layouts/GuideLayout.astro\ntitle: ${JSON.stringify(title)}\n---\n\n`;
            await writeFile(path.join(guidesPagesDirectory, `${slug}.md`), `${frontmatter}${markdown}`, 'utf8');
            guides.push({ order, path: `/guides/${slug}/`, section, sectionOrder, title });
        }
    };
    await visit(additionalDocsDirectory);

    const sectionsByTitle = new Map<string, GuideSection>();
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

const parseLegacyDate = (value: unknown, filename: string): string | undefined => {
    const dateValue = value instanceof Date ? value.toISOString().slice(0, 10) : String(value ?? '');
    const sourceMatch = dateValue.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
    const filenameMatch = filename.match(/(?:changelog)_(?:\d+)_(\d{1,2})_(\d{1,2})_(\d{2,4})/i);
    const match = sourceMatch ?? filenameMatch;
    if (!match) return undefined;

    const [, firstValue, secondValue, yearValue] = match;
    if (!firstValue || !secondValue || !yearValue) return undefined;
    const year = Number(yearValue) < 100 ? 2000 + Number(yearValue) : Number(yearValue);
    const first = Number(firstValue);
    const second = Number(secondValue);
    const month = first > 12 ? second : first;
    const day = first > 12 ? first : second;
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return undefined;
    return date.toISOString().slice(0, 10);
};

const rewriteLegacyLinks = (markdown: string, relativePath: string): string => {
    const currentDirectory = path.posix.dirname(relativePath);
    return markdown.replace(/(!?\[[^\]]*\]\()([^\s)]+)([^)]*\))/g, (match, prefix, href, suffix) => {
        if (!href.startsWith('.')) return match;
        const targetPath = path.posix.normalize(path.posix.join(currentDirectory, decodeURI(href)));
        if (targetPath.toLowerCase().endsWith('.md')) {
            return `${prefix}../${legacyChangelogSlug(targetPath)}/${suffix}`;
        }
        if (/\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(targetPath)) {
            return `${prefix}../../../assets/legacy-changelogs/${legacyAssetName(targetPath)}${suffix}`;
        }
        return match;
    });
};

const generateLegacyChangelogs = async () => {
    await rm(legacyChangelogsPagesDirectory, { force: true, recursive: true });
    await rm(legacyChangelogsAssetsDirectory, { force: true, recursive: true });
    await mkdir(legacyChangelogsPagesDirectory, { recursive: true });
    await mkdir(legacyChangelogsAssetsDirectory, { recursive: true });
    const changelogs: LegacyChangelog[] = [];

    const visit = async (directory: string): Promise<void> => {
        for (const entry of await readdir(directory, { withFileTypes: true })) {
            const entryPath = path.join(directory, entry.name);
            if (entry.isDirectory()) {
                await visit(entryPath);
                continue;
            }
            if (!entry.isFile()) continue;

            const relativePath = path.relative(legacyChangelogsDirectory, entryPath).replaceAll('\\', '/');
            if (/\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(entry.name)) {
                await copyFile(entryPath, path.join(legacyChangelogsAssetsDirectory, legacyAssetName(relativePath)));
                continue;
            }
            if (!entry.name.toLowerCase().endsWith('.md')) continue;

            const source = await readFile(entryPath, 'utf8');
            const { content, data: rawData } = matter(source);
            const data = isRecord(rawData) ? rawData : {};
            const heading = content.match(/^#\s+(.+)$/m)?.[1]?.trim();
            const identifier = path.parse(entry.name).name.match(/^changelog_(\d+)/i)?.[1];
            const protocolVersion = content.match(/Network Protocol Version\s+(\d+)/i)?.[1];
            const date = parseLegacyDate(data.date ?? heading, path.parse(entry.name).name);
            const slug = legacyChangelogSlug(relativePath);
            const title = typeof data.title === 'string'
                ? data.title
                : protocolVersion ? `Protocol ${protocolVersion} changelog` : identifier ? `Build ${identifier} changelog` : heading ?? humanize(path.parse(entry.name).name);
            const sourceBody = heading ? content.replace(/^# .+\r?\n+/, '') : content;
            const markdown = rewriteLegacyLinks(demoteHeadings(sourceBody), relativePath);
            const frontmatter = `---\nlayout: ../../../../layouts/GuideLayout.astro\ntitle: ${JSON.stringify(title)}\n---\n\n`;
            await writeFile(path.join(legacyChangelogsPagesDirectory, `${slug}.md`), `${frontmatter}${markdown}`, 'utf8');
            changelogs.push({
                date,
                identifier: protocolVersion ?? identifier ?? '',
                path: `/changelog/legacy/entries/${slug}/`,
                title,
            });
        }
    };
    await visit(legacyChangelogsDirectory);

    changelogs.sort((left, right) =>
        String(right.date ?? '').localeCompare(String(left.date ?? '')) ||
        Number(right.identifier) - Number(left.identifier) ||
        left.title.localeCompare(right.title)
    );
    const navigation = Object.entries(Object.groupBy(changelogs, changelog => changelog.date?.slice(0, 4) ?? 'Undated'))
        .sort(([leftYear], [rightYear]) => {
            if (leftYear === 'Undated') return 1;
            if (rightYear === 'Undated') return -1;
            return Number(rightYear) - Number(leftYear);
        })
        .map(([year, entries]) => ({
            title: year,
            changelogs: (entries ?? []).map(changelog => ({
                date: changelog.date ?? null,
                path: changelog.path,
                title: changelog.title,
            })),
        }));
    await writeFile(legacyChangelogsNavigationPath, `${JSON.stringify(navigation, undefined, 2)}\n`, 'utf8');
};

const readProtocolSchemas = async (schemaDirectory: string): Promise<MinecraftRelease['protocol_schemas']> => {
    const schemas: MinecraftRelease['protocol_schemas'] = {};
    const visit = async (directory: string): Promise<void> => {
        for (const entry of await readdir(directory, { withFileTypes: true })) {
            const entryPath = path.join(directory, entry.name);
            if (entry.isDirectory()) await visit(entryPath);
            else if (entry.isFile() && entry.name.endsWith('.json')) {
                const schema: unknown = JSON.parse(await readFile(entryPath, 'utf8'));
                if (!isRecord(schema)) throw new TypeError(`Protocol schema '${entryPath}' must be an object.`);
                schemas[path.resolve(entryPath)] = schema as MinecraftRelease['protocol_schemas'][string];
            }
        }
    };
    await visit(schemaDirectory);
    return schemas;
};

const manifest = parseProtocolManifest(JSON.parse(await readFile(manifestPath, 'utf8')));
const snapshots: ProtocolSnapshot[] = [];
for (const entry of manifest.releases) {
    const schemas = await readProtocolSchemas(path.resolve(repositoryRoot, entry.schemaDirectory));
    if (Object.keys(schemas).length === 0) continue;
    const release = new MinecraftRelease(entry.minecraftVersion);
    release.protocol_schemas = schemas;
    snapshots.push({ preview: entry.preview ?? false, release, releaseDate: entry.releaseDate, version: entry.version });
}
if (snapshots.length === 0) throw new Error(`No protocol releases were found in '${manifestPath}'.`);

const changelogGenerator = new ProtocolChangelogGenerator();
const stableSnapshots = snapshots.filter(snapshot => !snapshot.preview);
const previewSnapshots = snapshots.filter(snapshot => snapshot.preview);
const entriesByVersion = new Map(manifest.releases.map(entry => [entry.version, entry]));
const withPacketDescriptions = (metadata: ProtocolReleaseMetadata): ProtocolReleaseMetadata => ({
    ...metadata,
    packets: metadata.packets.map(packet => ({
        ...packet,
        description: packet.description || packet.details,
        details: packet.description ? packet.details : '',
    })),
});
const releases = snapshots.map(snapshot => ({
    entry: entriesByVersion.get(snapshot.version),
    metadata: withPacketDescriptions(changelogGenerator.generateReleaseMetadata(snapshot.release)),
    releaseDate: snapshot.releaseDate,
    version: snapshot.version,
}));
const latestRelease = releases[0];
if (!latestRelease) throw new Error(`No generated protocol releases were found in '${manifestPath}'.`);
const protocol = {
    ...latestRelease.metadata,
    changelog: {
        preview: changelogGenerator.generateChangelogs(previewSnapshots),
        stable: changelogGenerator.generateChangelogs(stableSnapshots),
    },
};
const versions = {
    latest: latestRelease.version,
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
await generateGuides(latestRelease.metadata);
await generateLegacyChangelogs();
console.log(`Generated Astro data for ${releases.length} protocol release${releases.length === 1 ? '' : 's'}.`);