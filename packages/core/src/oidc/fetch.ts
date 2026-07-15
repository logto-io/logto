/**
 * The `fetch` implementation for the provider's outgoing requests (backchannel logout, client
 * `jwks_uri`, `sector_identifier_uri`, ...).
 *
 * Since v9, oidc-provider injects an SSRF-protecting undici dispatcher into these requests that
 * destroys connections resolving to special-use addresses such as loopback and private ranges,
 * while self-hosted Logto deployments commonly reach RPs on private networks — drop the
 * dispatcher so outgoing requests stay unrestricted as before. Revisit if we want the hardening
 * for cloud.
 */
const fetchWithoutSsrfDispatcher: typeof fetch = async (input, init) => {
  // eslint-disable-next-line no-restricted-syntax -- The `dispatcher` key is an undici extension absent from `RequestInit`
  const { dispatcher, ...safeInit } = (init ?? {}) as RequestInit & { dispatcher?: unknown };
  return fetch(input, safeInit);
};

export default fetchWithoutSsrfDispatcher;
