---
title: Docs for agents
description: Machine-readable entry points to this documentation, and how to use them.
packages: []
order: 1
source: balsa-docs/docs/spec/agent-surface.md
---

This documentation is readable by tools that are not browsers.

## Entry points

| Path | Contents |
| --- | --- |
| `/llms.txt` | Index of every page with title and description |
| `/llms-manifest.json` | Package to page mapping |
| `<route>.md` | The raw Markdown for any page |

## Usage

Point a coding agent at `/llms.txt`, then fetch the pages it selects as `.md`. Nothing is
JS-rendered, so no browser is required.
