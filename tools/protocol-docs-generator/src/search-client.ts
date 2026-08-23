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

export interface SearchMatch {
    entry: SearchEntry;
    matchingMembers: SearchMember[];
    rank: number;
}

const normalizeSearchText = (value: string) =>
    value
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/[^a-zA-Z0-9]+/g, ' ')
        .trim()
        .toLowerCase();

const matchRank = (value: string, query: string, baseRank: number) => {
    const normalizedValue = normalizeSearchText(value);
    if (normalizedValue === query) return baseRank;
    if (normalizedValue.startsWith(query)) return baseRank + 1;
    if (normalizedValue.split(' ').includes(query)) return baseRank + 2;
    if (normalizedValue.includes(query)) return baseRank + 3;
    const compactValue = normalizedValue.replaceAll(' ', '');
    const compactQuery = query.replaceAll(' ', '');
    if (compactValue === compactQuery) return baseRank;
    if (compactValue.startsWith(compactQuery)) return baseRank + 1;
    if (compactValue.includes(compactQuery)) return baseRank + 3;
    return Number.POSITIVE_INFINITY;
};

export const searchEntries = (
    entries: SearchEntry[],
    rawQuery: string,
    includedKinds?: ReadonlySet<string>
): SearchMatch[] => {
    const query = normalizeSearchText(rawQuery);
    if (!query) return [];

    return entries
        .filter(entry => !includedKinds || includedKinds.has(entry.kind))
        .map(entry => {
            const matchingMembers = (entry.members ?? []).filter(member =>
                Number.isFinite(Math.min(matchRank(member.path, query, 10), matchRank(member.type, query, 14)))
            );
            const memberRank = matchingMembers.reduce(
                (rank, member) => Math.min(
                    rank,
                    matchRank(member.path, query, 10),
                    matchRank(member.type, query, 14)
                ),
                Number.POSITIVE_INFINITY
            );
            return {
                entry,
                matchingMembers,
                rank: Math.min(
                    matchRank(entry.title, query, 0),
                    memberRank,
                    matchRank(entry.description, query, 20),
                    matchRank(entry.kind, query, 30)
                ),
            };
        })
        .filter(match => Number.isFinite(match.rank))
        .sort(
            (left, right) =>
                left.rank - right.rank ||
                left.entry.title.length - right.entry.title.length ||
                left.entry.title.localeCompare(right.entry.title)
        );
};