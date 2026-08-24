export interface ProtocolReleaseEntry {
    minecraftVersion: string;
    name: string;
    preview: boolean;
    protocolVersion: string;
    releaseDate: string;
    schemaDirectory: string;
    tag: string;
    url: string;
    version: string;
}

export interface ProtocolManifest {
    generatedAt: string;
    repository: string;
    releases: ProtocolReleaseEntry[];
}

export const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const readString = (record: Record<string, unknown>, property: string): string => {
    const value = record[property];
    if (typeof value !== 'string') throw new TypeError(`Manifest property '${property}' must be a string.`);
    return value;
};

const parseRelease = (value: unknown, index: number): ProtocolReleaseEntry => {
    if (!isRecord(value)) throw new TypeError(`Manifest release ${index} must be an object.`);
    if (typeof value.preview !== 'boolean') {
        throw new TypeError(`Manifest release ${index} property 'preview' must be a boolean.`);
    }

    return {
        minecraftVersion: readString(value, 'minecraftVersion'),
        name: readString(value, 'name'),
        preview: value.preview,
        protocolVersion: readString(value, 'protocolVersion'),
        releaseDate: readString(value, 'releaseDate'),
        schemaDirectory: readString(value, 'schemaDirectory'),
        tag: readString(value, 'tag'),
        url: readString(value, 'url'),
        version: readString(value, 'version'),
    };
};

export const parseProtocolManifest = (value: unknown): ProtocolManifest => {
    if (!isRecord(value)) throw new TypeError('Protocol manifest must be an object.');
    if (!Array.isArray(value.releases)) throw new TypeError("Manifest property 'releases' must be an array.");

    return {
        generatedAt: readString(value, 'generatedAt'),
        repository: readString(value, 'repository'),
        releases: value.releases.map(parseRelease),
    };
};