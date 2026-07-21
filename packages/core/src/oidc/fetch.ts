import { EnvSet } from '#src/env-set/index.js';

/**
 * The opt-out `fetch` implementation for the provider's outgoing requests (backchannel logout,
 * client `jwks_uri`, `sector_identifier_uri`, ...).
 *
 * Since v9, oidc-provider injects an SSRF-protecting undici dispatcher into these requests that
 * destroys connections resolving to special-use addresses such as loopback and private ranges.
 *
 * Self-hosted deployments can explicitly disable that protection when they must reach trusted RPs
 * on private networks. In that case, this function drops the dispatcher to keep those requests
 * unrestricted.
 */
const fetchWithoutSsrfDispatcher: typeof fetch = async (input, init) => {
  // eslint-disable-next-line no-restricted-syntax -- The `dispatcher` key is an undici extension absent from `RequestInit`
  const { dispatcher, ...safeInit } = (init ?? {}) as RequestInit & { dispatcher?: unknown };
  return fetch(input, safeInit);
};

/**
 * Keep oidc-provider's native fetch implementation whenever SSRF protection is enabled so future
 * upstream fetch hardening is inherited automatically. Only override it for the self-hosted opt-out.
 */
export const getProviderFetchConfig = () =>
  EnvSet.values.isOidcProviderSsrfProtectionEnabled
    ? undefined
    : { fetch: fetchWithoutSsrfDispatcher };

export default fetchWithoutSsrfDispatcher;
