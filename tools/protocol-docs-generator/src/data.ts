import versionsJson from './data/versions.json';
import type { ProtocolReleaseMetadata, ProtocolVersionManifest } from './types';

const releaseModules = import.meta.glob<ProtocolReleaseMetadata>('./data/releases/*.json', {
    eager: true,
    import: 'default',
});

export const versionManifest = versionsJson as ProtocolVersionManifest;
export const portalGeneratedAt = new Date();
const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');

const metadataByVersion = new Map(
    Object.entries(releaseModules).map(([filePath, metadata]) => [
        filePath
            .split('/')
            .at(-1)
            ?.replace(/\.json$/, ''),
        metadata,
    ])
);

export const getProtocolMetadata = (version: string): ProtocolReleaseMetadata => {
    const resolvedVersion = version === 'latest' ? versionManifest.latest : version;
    const metadata = metadataByVersion.get(resolvedVersion);
    if (!metadata) throw new Error(`Protocol metadata is unavailable for '${version}'.`);
    return metadata;
};

export const getVersionPaths = () => [
    { params: { version: 'latest' }, props: { version: 'latest' } },
    ...versionManifest.releases.map(release => ({
        params: { version: release.version },
        props: { version: release.version },
    })),
];

export const withBase = (pathname: string) => `${baseUrl}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;

export const getVersionPrefix = (version: string) => withBase(`/${version}`);
