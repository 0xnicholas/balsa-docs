/**
 * The deployed origin — one source for two consumers (agent-surface.md §4):
 * Astro's `site` option (canonical links, sitemap) and the `site` field of
 * `/llms-manifest.json`. The `/llms.txt` links are absolute whenever it is set and
 * root-relative while it is not.
 *
 * `undefined` is the current, deliberate state: the platform host (#27) and the real
 * domain (#29) have not landed, and delivery.md §3.4 allows the site to run on the
 * temporary platform domain meanwhile. #29 is the one-line switch (`site` / canonical /
 * sitemap / manifest together) — set it here and nothing else moves.
 */
export const site: string | undefined = undefined;

/** Starlight `title` (brand-visual.md §3.1 logo slot) — also the H1 of `/llms.txt` (§3). */
export const siteTitle = 'Balsa';

/** Starlight `description` — the first sentence of the `/llms.txt` summary (§3). */
export const siteDescription = 'Documentation for Balsa, a lightweight TypeScript agent framework.';
