export type ProtocolTypeCategory = 'array' | 'enum' | 'object' | 'scalar' | 'union' | 'other';

export interface ProtocolVariant {
    index: number;
    target?: string;
    title: string;
    type: string;
}

export interface ProtocolField {
    children?: ProtocolField[];
    description: string;
    enumValues?: string[];
    name: string;
    optional: boolean;
    ordinal?: number;
    serialization: string[];
    target?: string;
    type: string;
    variants?: ProtocolVariant[];
    wireSize: string;
    wireSizeBytes: number;
}

export interface ProtocolUse {
    packetId?: number;
    packetSlug: string;
    packetTitle: string;
    path: string[];
}

export interface ProtocolWireFormat {
    serialization: string[];
    type: string;
}

export interface ProtocolType {
    category: ProtocolTypeCategory;
    description: string;
    enumValues: string[];
    fields: ProtocolField[];
    slug: string;
    title: string;
    uses: ProtocolUse[];
    serialization: string[];
    wireFormats: ProtocolWireFormat[];
}

export interface ProtocolPacket {
    description: string;
    details: string;
    fields: ProtocolField[];
    id: number;
    slug: string;
    title: string;
}

export interface ProtocolPrimitive {
    category: 'Boolean' | 'Floating point' | 'Signed integer' | 'Text' | 'Unsigned integer';
    encoding: string;
    size: string;
    slug: string;
    title: string;
}

export interface ProtocolChangeItem {
    changes: ProtocolChange[];
    packetId: number;
    previousPacketId?: number;
    slug: string;
    title: string;
}

export interface ProtocolChange {
    addedType?: ProtocolTypeChangeContext;
    changedType?: ProtocolTypeChangeContext;
    fieldAdded?: ProtocolFieldAdded;
    fieldEnumValueAdded?: ProtocolFieldEnumValueChange;
    fieldEnumValueOrdinalChanged?: ProtocolFieldEnumValueOrdinalChange;
    fieldEnumValueRemoved?: ProtocolFieldEnumValueChange;
    fieldOptionalChanged?: ProtocolFieldOptionalChange;
    fieldOrdinalChanged?: ProtocolFieldOrdinalChange;
    fieldRemoved?: ProtocolFieldRemoved;
    fieldSerializationOptionAdded?: ProtocolFieldSerializationOptionChange;
    fieldSerializationOptionRemoved?: ProtocolFieldSerializationOptionChange;
    fieldTypeChanged?: ProtocolFieldTypeChange;
    fieldVariantsChanged?: ProtocolFieldVariantsChange;
    removedType?: ProtocolTypeChangeContext;
    typeAdded?: ProtocolTypeAddedOrRemoved;
    typeCategoryChanged?: ProtocolTypeCategoryChange;
    typeEnumValueAdded?: ProtocolTypeEnumValueChange;
    typeEnumValueOrdinalChanged?: ProtocolTypeEnumValueOrdinalChange;
    typeEnumValueRemoved?: ProtocolTypeEnumValueChange;
    typeRemoved?: ProtocolTypeAddedOrRemoved;
    typeSerializationOptionAdded?: ProtocolTypeSerializationOptionChange;
    typeSerializationOptionRemoved?: ProtocolTypeSerializationOptionChange;
}

export interface ProtocolFieldChangeContext {
    path: string;
    target?: string;
}

export interface ProtocolFieldAdded extends ProtocolFieldChangeContext {
    type: string;
}

export interface ProtocolFieldEnumValueChange extends ProtocolFieldChangeContext {
    ordinal: number;
    value: string;
}

export interface ProtocolFieldEnumValueOrdinalChange
    extends ProtocolTypeEnumValueOrdinalChange,
        ProtocolFieldChangeContext {}

export interface ProtocolFieldOrdinalChange extends ProtocolFieldChangeContext {
    ordinal?: number;
    ordinalAssigned: boolean;
    previousOrdinal?: number;
    previousOrdinalAssigned: boolean;
}

export interface ProtocolFieldRemoved extends ProtocolFieldChangeContext {
    type: string;
}

export interface ProtocolFieldOptionalChange extends ProtocolFieldChangeContext {
    optional: boolean;
}

export interface ProtocolFieldSerializationOptionChange extends ProtocolFieldChangeContext {
    option: string;
}

export interface ProtocolFieldTypeChange extends ProtocolFieldChangeContext {
    previousTarget?: string;
    previousType: string;
    type: string;
}

export interface ProtocolFieldVariantsChange extends ProtocolFieldChangeContext {}

export interface ProtocolTypeAddedOrRemoved {
    category: ProtocolTypeCategory;
}

export interface ProtocolTypeCategoryChange {
    category: ProtocolTypeCategory;
    previousCategory: ProtocolTypeCategory;
}

export interface ProtocolTypeChangeContext {
    slug?: string;
    title: string;
}

export interface ProtocolTypeEnumValueChange {
    ordinal: number;
    value: string;
}

export interface ProtocolTypeEnumValueOrdinalChange {
    ordinal: number;
    previousOrdinal: number;
    value: string;
}

export interface ProtocolTypeSerializationOptionChange {
    option: string;
}

export interface ProtocolChangeSet {
    added: ProtocolChangeItem[];
    changed: ProtocolChangeItem[];
    removed: ProtocolChangeItem[];
}

export interface ProtocolChangelogRelease {
    minecraftVersion: string;
    packets: ProtocolChangeSet;
    previousProtocolVersion: string;
    previousVersion: string;
    protocolVersion: string;
    releaseDate: string;
    totalChanges: number;
    versionDidChange: boolean;
    version: string;
}

export interface ProtocolChangelog {
    preview: ProtocolChangelogRelease[];
    stable: ProtocolChangelogRelease[];
}

export interface ProtocolReleaseMetadata {
    minecraftVersion: string;
    packets: ProtocolPacket[];
    primitives: ProtocolPrimitive[];
    protocolVersion: string;
    types: ProtocolType[];
}

export interface ProtocolMetadata extends ProtocolReleaseMetadata {
    changelog: ProtocolChangelog;
}

export interface ProtocolVersion {
    minecraftVersion: string;
    name: string;
    packetSlugs: string[];
    preview: boolean;
    protocolVersion: string;
    releaseDate: string;
    tag: string;
    typeSlugs: string[];
    url: string;
    version: string;
}

export interface ProtocolVersionManifest {
    latest: string;
    releases: ProtocolVersion[];
}
