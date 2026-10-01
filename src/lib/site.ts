/**
 * The deployed origin — one source for four consumers (agent-surface.md §4): Astro's `site`
 * option (canonical links, sitemap), the `site` field of `/llms-manifest.json`, the absolute
 * links of `/llms.txt`, and the `Sitemap:` line of `/robots.txt` (delivery.md §3.4).
 *
 * The value is the `docs.<apex>` subdomain that delivery.md §3.1 rules for and balsa-website's
 * domain research picked (`balsajs.dev`, recommendation order in §3.1). #29 landed it as the
 * one-line switch it was scoped to be — canonical, sitemap, manifest, the llms index and
 * robots.txt all follow this constant, so nothing else in the repository names a host.
 *
 * `string | undefined` is the shape the consumers keep supporting, not a state this file is
 * still in: the site may run on the platform's temporary domain with no canonical at all
 * (delivery.md §3.4), which is exactly the `undefined` branch the renderers are unit-tested
 * against. The DNS record and the certificate for this host are the other half of #29 and do
 * not live in this repository (delivery.md §13.4).
 */
export const site: string | undefined = 'https://docs.balsajs.dev';

/** Starlight `title` (brand-visual.md §3.1 logo slot) — also the H1 of `/llms.txt` (§3). */
export const siteTitle = 'Balsa';

/** Starlight `description` — the first sentence of the `/llms.txt` summary (§3). */
export const siteDescription = 'Documentation for Balsa, a lightweight TypeScript agent framework.';
