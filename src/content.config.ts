// PROTOTYPE (#16) — frontmatter contract from docs/spec/ia.md §4 / stack.md §5,
// wired to prove the schema mechanism works. The real field table lands with the site.
import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			extend: z.object({
				/** `@balsa/*` subpaths this page documents; checked against package exports later. */
				packages: z.array(z.string()).default([]),
				project: z.string().default('balsa'),
				subtype: z.enum(['walkthrough', 'migration']).optional(),
				/** Manual sidebar position within a family (ia.md §4). */
				order: z.number().optional(),
				/** Source-material pointer: upstream file + framework commit. */
				source: z.string().optional(),
			}),
		}),
	}),
};
