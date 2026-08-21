# Minecraft Protocol Docs

This Astro app renders versioned Minecraft protocol schema metadata prepared by the repository-level scripts.

```sh
npm install
npm run dev
```

Run these commands from the repository root. The development server is required because the static site uses root-relative routes and fetches its search index over HTTP; opening `dist/index.html` directly does not provide those web-server semantics.

For a production build, run:

```sh
npm run build
```

The build output is written to `tools/protocol-docs-generator/dist/`. The normalized metadata consumed by the site is in `src/data/`.