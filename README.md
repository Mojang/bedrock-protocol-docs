# Minecraft: Bedrock Edition Network Protocol Documentation

This repository publishes the packet, type, and enum schemas for the Minecraft: Bedrock Edition network protocol. The protocol can change between releases.

Browse the generated documentation at [mojang.github.io/bedrock-protocol-docs](https://mojang.github.io/bedrock-protocol-docs/).

The website is assembled from the metadata found in the repository's GitHub Releases.

## Repository layout

- `json/` contains the protocol schemas for the current checkout. Each schema carries its Minecraft and protocol versions in `x-minecraft-version` and `x-protocol-version`; there is no separately maintained current-version value in this README.
- `additional_docs/` contains the source Markdown and assets for the guides section.
- `legacy_changelogs/` contains changelogs that predate the generated release history.
- `scripts/` prepares release metadata and generates the data and pages consumed by the site.
- `tools/protocol-docs-generator/` contains the Astro application that renders the documentation.

## Build locally

Use Node.js 24 or newer and npm 11 or newer. From the repository root:

```sh
npm ci
npm run dev
```

The preparation step calls the GitHub API and downloads release archives. Set `GITHUB_TOKEN` when necessary to authenticate those requests or avoid the unauthenticated API rate limit.

Other useful commands are:

```sh
npm run check
npm run build
```

## Deployment

The [Pages workflow](.github/workflows/pages.yml) runs for pushes to `main`, version tags matching `v*`, release changes, and manual dispatches.
