// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { defineConfig } from 'astro/config';

export default defineConfig({
    base: process.env.BASE_PATH,
    markdown: {
        shikiConfig: {
            themes: {
                dark: 'github-dark',
                light: 'github-light',
            },
            defaultColor: false,
        },
    },
    output: 'static',
    trailingSlash: 'always',
});
