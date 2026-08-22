import type { ProtocolField, ProtocolReleaseMetadata } from './types';
import { getVersionPrefix } from './data';

export interface SearchMember {
    path: string;
    type: string;
}

export interface SearchEntry {
    description: string;
    href: string;
    id?: number;
    kind: string;
    members?: SearchMember[];
    title: string;
}

const collectMembers = (fields: ProtocolField[], parentPath: string[] = []): SearchMember[] =>
    fields.flatMap(field => {
        const path = [...parentPath, field.name];
        return [
            { path: path.join(' › '), type: field.type },
            ...(field.enumValues ?? []).map(value => ({ path: [...path, value].join(' › '), type: 'enum value' })),
            ...(field.variants ?? []).map(variant => ({
                path: [...path, variant.title].join(' › '),
                type: variant.type,
            })),
            ...collectMembers(field.children ?? [], path),
        ];
    });

export const createSearchIndex = (metadata: ProtocolReleaseMetadata, version: string): SearchEntry[] => {
    const versionPrefix = getVersionPrefix(version);
    return [
        ...metadata.packets.map(packet => ({
            description: packet.description,
            href: `${versionPrefix}/packets/${packet.slug}/`,
            id: packet.id,
            kind: 'Packet',
            members: collectMembers(packet.fields),
            title: packet.title,
        })),
        ...metadata.types.map(type => ({
            description: type.description,
            href: `${versionPrefix}/types/${type.slug}/`,
            kind: type.category,
            members: [
                ...type.enumValues.map(value => ({ path: value, type: 'enum value' })),
                ...collectMembers(type.fields),
            ],
            title: type.title,
        })),
    ];
};
