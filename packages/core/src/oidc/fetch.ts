import { EnvSet } from '#src/env-set/index.js';

/**
 * The `fetch` implementation for the provider's outgoing requests (backchannel logout, client
 * `jwks_uri`, `sector_identifier_uri`, ...).
 *
 * Since v9, oidc-provider injects an SSRF-protecting undici dispatcher into these requests that
 * destroys connections resolving to special-use addresses such as loopback and private ranges.
 *
 * Self-hosted Logto deployments commonly reach RPs on private networks, so the dispatcher is
 * dropped there to keep outgoing requests unrestricted as before. In Cloud, these requests have
 * no legitimate private-network targets, so the dispatcher is kept to stop tenant-controlled
 * URIs (e.g. `backchannelLogoutUri`) from reaching internal infrastructure.
 */
const fetchWithoutSsrfDispatcher: typeof fetch = async (input, init) => {
  // eslint-disable-next-line no-restricted-syntax -- The `dispatcher` key is an undici extension absent from `RequestInit`
  const { dispatcher, ...safeInit } = (init ?? {}) as RequestInit & { dispatcher?: unknown };
  return fetch(input, safeInit);
};

const providerFetch: typeof fetch = async (input, init) =>
  EnvSet.values.isCloud ? fetch(input, init) : fetchWithoutSsrfDispatcher(input, init);

export default providerFetch;
