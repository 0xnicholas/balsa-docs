/**
 * The head link advertising every page's Markdown twin (agent-surface.md §5.2):
 * `<link rel="alternate" type="text/markdown" href="<route>.md">` — the discovery mechanism
 * llmstxt.org defines, and the one piece `starlight-dot-md` does not provide. It serves the
 * twins but injects no link to them, so the site injects it (§2, verified in #11's research).
 *
 * Starlight route middleware is the smallest place that can do this per page (§12.2): it runs
 * after the route data is built and before the page renders, so the tag is part of the static
 * HTML of every page — no component override, and the override registry stays empty
 * (brand-visual.md §4, ADR-0003). Wired as `routeMiddleware` in astro.config.mjs.
 */
import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import { twinPath } from './agent-surface.ts';

export const onRequest = defineRouteMiddleware((context) => {
	context.locals.starlightRoute.head.push({
		tag: 'link',
		attrs: { rel: 'alternate', type: 'text/markdown', href: twinPath(context.url.pathname) },
	});
});
