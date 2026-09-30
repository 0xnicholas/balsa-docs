import { defineCollection } from 'astro:content';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';
import { frontmatterFields } from './lib/frontmatter.ts';

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		// Starlight's fields plus the project field table (ia.md §4 / stack.md §5).
		// A violation fails the build; it is not a warning — see `pnpm verify`.
		schema: docsSchema({ extend: frontmatterFields }),
	}),
	// Reserved for the zh UI strings (stack.md §1.3: i18n is a first-class citizen, English
	// first). `src/content/i18n/en.json` is the empty English override set; it also keeps
	// Starlight's UI-translation lookup (`getCollection('i18n')`) from warning on every build.
	i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
};
