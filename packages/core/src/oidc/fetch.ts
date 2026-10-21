import { cond } from '@silverhand/essentials';

import { EnvSet } from '#src/env-set/index.js';
import { getUndiciGlobalDispatcher, ssrfProtectedFetch } from '#src/utils/outbound-request.js';

/**
 * Self-hosted opt-out of the SSRF-protecting dispatcher oidc-provider injects since v9, for
 * deployments that must reach trusted RPs on private networks. `fetch` resolves `init.dispatcher`
 * before one carried by a `Request` input, so the global dispatcher has to be passed explicitly;
 * where it is unavailable, the provider has none of its own either.
 *
 * @see https://github.com/logto-io/node-oidc-provider/blob/513c523c0e68ee6112da8c871cce86204a136163/lib/helpers/fetch_request.js
 */
const fetchWithoutSsrfDispatcher: typeof fetch = async (input, init) =>
  // eslint-disable-next-line no-restricted-syntax -- The `dispatcher` key is an undici extension absent from `RequestInit`
  fetch(input, { ...init, dispatcher: getUndiciGlobalDispatcher() } as RequestInit);

/** The provider's built-in guard has no hook for `SSRF_ALLOWED_ADDRESSES`. */
const fetchWithAllowlistedDispatcher: typeof fetch = ssrfProtectedFetch;

/**
 * Keep oidc-provider's native fetch implementation whenever the protection is enabled and no
 * allowlist applies, so future upstream fetch hardening is inherited automatically. Override it
 * only for the self-hosted opt-out and for the allowlist, which upstream cannot honor.
 */
export const getProviderFetchConfig = () => {
  const { isSsrfProtectionEnabled, ssrfAllowedAddresses } = EnvSet.values;

  if (!isSsrfProtectionEnabled) {
    return { fetch: fetchWithoutSsrfDispatcher };
  }

  return cond(ssrfAllowedAddresses.length > 0 && { fetch: fetchWithAllowlistedDispatcher });
};

export default fetchWithoutSsrfDispatcher;
