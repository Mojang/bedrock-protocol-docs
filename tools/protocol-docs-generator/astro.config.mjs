// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { defineConfig } from 'astro/config';

export default defineConfig({
    base: process.env.BASE_PATH,
    output: 'static',
    trailingSlash: 'always',
});
