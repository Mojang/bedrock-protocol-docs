import type { APIRoute, GetStaticPaths } from 'astro';

import { getProtocolMetadata, versionManifest } from '../../data';
import { createSearchIndex } from '../../search';

export const getStaticPaths = (() =>
    versionManifest.releases.map(release => ({
        params: { version: release.version },
        props: { version: release.version },
    }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) => {
    const version = props.version as string;
    return new Response(JSON.stringify(createSearchIndex(getProtocolMetadata(version), version)), {
        headers: {
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Content-Type': 'application/json; charset=utf-8',
        },
    });
};
