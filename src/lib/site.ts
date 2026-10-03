/**
 * The deployed origin — one source for four consumers (agent-surface.md §4): Astro's `site`
 * option (canonical links, sitemap), the `site` field of `/llms-manifest.json`, the absolute
 * links of `/llms.txt`, and the `Sitemap:` line of `/robots.txt` (delivery.md §3.4).
 *
 * The value is the `docs.<apex>` subdomain delivery.md §3.1 fixes: apex = `oribos.dev`, the
 * umbrella ruling of 2026-10-03 (oribos-website SPEC §5, carried alongside the balsats →
 * oribos rename) over the apex #29 had landed — the landing shape is unchanged, only the
 * constant moved; oribos-website's domain research had covered a different candidate set, so
 * it is the ruling's account (§9 of that report), not its basis. #29 landed it as the
 * one-line switch it was scoped to be — canonical, sitemap, manifest, the llms index and
 * robots.txt all follow this constant, so nothing else in the repository names a host. The
 * DNS record and the certificate are still the human half, now behind the hosting move of
 * #46 (Cloudflare paths suspended; Tencent Cloud is the target).
 *
 * `string | undefined` is the shape the consumers keep supporting, not a state this file is
 * still in: the site may run on the platform's temporary domain with no canonical at all
 * (delivery.md §3.4), which is exactly the `undefined` branch the renderers are unit-tested
 * against. The DNS record and the certificate for this host are the other half of #29 — the
 * human half — and do not live in this repository (delivery.md §13.4).
 */
export const site: string | undefined = 'https://docs.oribos.dev';

/** Starlight `title` (brand-visual.md §3.1 logo slot) — also the H1 of `/llms.txt` (§3). */
export const siteTitle = 'Oribos';

/** Starlight `description` — the first sentence of the `/llms.txt` summary (§3). */
export const siteDescription = 'Documentation for Oribos, a lightweight TypeScript agent framework.';
