# Anti Cheat Documentation

This directory contains implementation details that are not obvious from the protocol schemas. Markdown files are discovered recursively and added to the Guides navigation during generation. This README is the only Markdown file that is not rendered as a guide.

A document's first-level folder becomes its section, and its first heading becomes its title. Root-level documents without an explicit section appear under **Other**. Optional frontmatter can override the inferred values and control ordering:

```yaml
---
title: Configuring anti-cheat
section: Configuration
sectionOrder: 1
order: 1
---
```

Relative links to other Markdown documents and local SVG images are rewritten for the generated Astro routes.
