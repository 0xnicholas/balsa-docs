---
title: Installation
description: Install the Balsa packages and verify your runtime setup.
packages:
  - '@balsa/core'
order: 1
source: balsa-framework/README.md
---

Balsa ships as a small set of packages. Most projects need one of them.

```sh
pnpm add @balsa/core
```

## Requirements

| Requirement | Version |
| --- | --- |
| Node.js | >= 22.12.0 |
| TypeScript | >= 5.6 (7.x supported) |

## Verify the install

```ts
import { version } from '@balsa/core';

console.log(version);
```

<Aside type="tip">
	Runtime versions below the minimum fail at import time with a clear message rather than at
	the first model call.
</Aside>

## Next steps

Continue with the [quickstart](/docs/get-started/quickstart/) to build a working agent.
