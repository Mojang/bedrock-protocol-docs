import versionsJson from './data/versions.json';
import type { ProtocolField, ProtocolReleaseMetadata, ProtocolVersionManifest } from './types';

const releaseModules = import.meta.glob<ProtocolReleaseMetadata>('./data/releases/*.json', {
    eager: true,
    import: 'default',
});

export const versionManifest = versionsJson as ProtocolVersionManifest;
export const portalGeneratedAt = new Date();
const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');

const enumAsValue = (serialization: string[]) => serialization.includes('Enum-as-Value');

const normalizeEnumWireFormats = (metadata: ProtocolReleaseMetadata): ProtocolReleaseMetadata => {
    const types = metadata.types.map(type => ({
        ...type,
        wireFormats: type.category === 'enum'
            ? type.wireFormats.map(format => enumAsValue(format.serialization) ? format : { ...format, type: 'string' })
            : type.wireFormats,
    }));
    const typesBySlug = new Map(types.map(type => [type.slug, type]));
    const normalizeFields = (fields: ProtocolField[]): ProtocolField[] => fields.map(field => {
        const target = field.target ? typesBySlug.get(field.target) : undefined;
        const isStringEnum = (target?.category === 'enum' || field.enumValues?.length)
            && !enumAsValue([...field.serialization, ...(target?.serialization ?? [])]);
        return {
            ...field,
            children: field.children ? normalizeFields(field.children) : undefined,
            ...(isStringEnum ? { type: 'string', wireSize: 'variable', wireSizeBytes: 8 } : {}),
        };
    });
    const packets = metadata.packets.map(packet => ({ ...packet, fields: normalizeFields(packet.fields) }));
    const serializationByUse = new Map<string, string[]>();
    const useKey = (packetSlug: string, path: string[]) => `${packetSlug}\0${path.join('\0')}`;
    const visitFields = (packetSlug: string, fields: ProtocolField[], path: string[], ancestors: Set<string>): void => {
        for (const field of fields) {
            const fieldPath = [...path, field.name];
            if (field.target) {
                const target = typesBySlug.get(field.target);
                if (target) {
                    const usePath = [...fieldPath, target.title];
                    serializationByUse.set(useKey(packetSlug, usePath), field.serialization);
                    if (!ancestors.has(field.target)) {
                        visitFields(packetSlug, target.fields, usePath, new Set(ancestors).add(field.target));
                    }
                }
            }
            visitFields(packetSlug, field.children ?? [], fieldPath, ancestors);
            for (const variant of field.variants ?? []) {
                if (!variant.target) continue;
                const target = typesBySlug.get(variant.target);
                if (!target) continue;
                const usePath = [...fieldPath, variant.title, target.title];
                serializationByUse.set(useKey(packetSlug, usePath), []);
                if (!ancestors.has(variant.target)) {
                    visitFields(packetSlug, target.fields, usePath, new Set(ancestors).add(variant.target));
                }
            }
        }
    };
    for (const packet of packets) visitFields(packet.slug, packet.fields, [], new Set());

    return {
        ...metadata,
        packets,
        types: types.map(type => ({
            ...type,
            fields: normalizeFields(type.fields),
            uses: type.uses.map(use => ({
                ...use,
                serialization: serializationByUse.get(useKey(use.packetSlug, use.path)) ?? [],
            })),
        })),
    };
};

const metadataByVersion = new Map(
    Object.entries(releaseModules).map(([filePath, metadata]) => [
        filePath
            .split('/')
            .at(-1)
            ?.replace(/\.json$/, ''),
        normalizeEnumWireFormats(metadata),
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
