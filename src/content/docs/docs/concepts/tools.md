---
title: Tools
description: Typed functions an agent may call, and how arguments are validated.
packages:
  - '@balsa/core'
order: 2
source: balsa-framework/docs/architecture/tools.md
---

A tool declares an input schema and a `run` function. Arguments are validated before the model
call is allowed to proceed.

```ts
export const runTests = tool({
	description: 'Run the test suite for a package',
	input: z.object({ package: z.string(), watch: z.boolean().default(false) }),
	async run({ package: name, watch }) {
		return await execa('pnpm', ['--filter', name, 'test', ...(watch ? ['--watch'] : [])]);
	},
});
```

<Aside type="danger">
	Tool output is model input. Never return secrets or unredacted environment values.
</Aside>
