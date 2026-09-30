/**
 * Shared narrow type guards for the repo gates (#18). Kept tiny on purpose: the gates
 * read untrusted JSON (the ledger) and loosely-typed frontmatter, and both need the same
 * "plain object, not null, not array" test.
 */

/** True for a plain object — not null, not an array. */
export const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);
