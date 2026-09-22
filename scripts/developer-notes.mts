import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

import MarkdownIt from 'markdown-it';

export interface DeveloperNote {
    path: string;
    markdown: string;
}

export interface DeveloperNoteContext {
    path: string;
    version: string;
}

export const preprocessDeveloperNote = (markdown: string, _context: DeveloperNoteContext): string | null =>
    markdown
        .replace(/\bADO:\d+\b/g, '')
        .replace(/^[\t ]*#+[^\r\n]*Network Protocol[^\r\n]*(?:\r?\n|$)/gim, '')
        .replace(/Network Protocol/gi, '');

const markdownRenderer = new MarkdownIt({ html: false });

// Published release notes can contain duplicated MD heading markers.
markdownRenderer.core.ruler.before('inline', 'normalize_heading_markers', state => {
    for (const [index, token] of state.tokens.entries()) {
        const content = state.tokens[index + 1];
        if (token.type === 'heading_open' && token.markup.startsWith('#') && content?.type === 'inline') {
            content.content = content.content.replace(/^(?:#{1,6}[\t ]+)+(?=\S)/, '');
        }
    }
});

export const hasDeveloperNoteHeading = (markdown: string): boolean =>
    markdownRenderer.parse(markdown, {}).some(token => token.type === 'heading_open');

export const renderDeveloperNote = (markdown: string): string => {
    const tokens = markdownRenderer.parse(markdown, {});
    for (const token of tokens) {
        if (token.type === 'heading_open' || token.type === 'heading_close') {
            token.tag = `h${Math.min(6, Number(token.tag.slice(1)) + 3)}`;
        }
    }
    return markdownRenderer.renderer.render(tokens, markdownRenderer.options, {}).trim();
};

export const readDeveloperNotes = async (directory: string): Promise<DeveloperNote[]> => {
    const notes: DeveloperNote[] = [];
    const visit = async (current: string): Promise<void> => {
        const entries = await readdir(current, { withFileTypes: true });
        for (const entry of entries) {
            const entryPath = path.join(current, entry.name);
            if (entry.isDirectory()) await visit(entryPath);
            else if (entry.isFile() && /\.md$/i.test(entry.name)) {
                notes.push({
                    path: path.relative(directory, entryPath).split(path.sep).join('/'),
                    markdown: await readFile(entryPath, 'utf8'),
                });
            }
        }
    };
    try {
        await visit(directory);
    } catch (error) {
        if (!(error instanceof Error) || !('code' in error) || error.code !== 'ENOENT' || !('path' in error) || error.path !== directory) throw error;
    }
    return notes.sort((left, right) => left.path.localeCompare(right.path));
};

export const getAddedDeveloperNotes = (
    current: DeveloperNote[],
    previous: DeveloperNote[],
    version: string,
    preprocess: typeof preprocessDeveloperNote = preprocessDeveloperNote,
): DeveloperNote[] => {
    const previousPaths = new Set(previous.map(note => note.path));
    return current.filter(note => !previousPaths.has(note.path)).flatMap(note => {
        const markdown = preprocess(note.markdown, { path: note.path, version })?.trim();
        return markdown ? [{ path: note.path, markdown }] : [];
    });
};