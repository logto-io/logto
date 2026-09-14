import { cond, type Optional } from '@silverhand/essentials';

import { EnvSet } from '#src/env-set/index.js';
import { ssrfProtectedFetch } from '#src/utils/outbound-request.js';

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
 * Replaces oidc-provider's dispatcher with ours, which applies the same special-use address check
 * plus `SSRF_ALLOWED_ADDRESSES`. Needed because the provider's built-in guard hardcodes its check
 * and has no hook for the allowlist, so a listed address would stay unreachable here while being
 * reachable everywhere else.
 */
const fetchWithAllowlistedDispatcher: typeof fetch = async (input, init) => {
  // eslint-disable-next-line no-restricted-syntax -- The `dispatcher` key is an undici extension absent from `RequestInit`
  const { dispatcher, ...safeInit } = (init ?? {}) as RequestInit & { dispatcher?: unknown };
  return ssrfProtectedFetch(input, safeInit);
};

/** Every OpenAI client metadata document, for ChatGPT and Codex alike, is served from here. */
const chatGptOrigin = 'https://chatgpt.com';

/**
 * Sends requests to chatgpt.com through the relay instead, keeping path and query. The request
 * options pass through untouched, so the dispatcher and timeout the provider set for chatgpt.com
 * apply to the relay as well.
 */
const withOpenAiCimdRelay =
  (relayUrl: string, baseFetch: typeof fetch): typeof fetch =>
  async (input, init) => {
    const url = new URL(input instanceof Request ? input.url : input);

    return baseFetch(
      url.origin === chatGptOrigin ? new URL(`${url.pathname}${url.search}`, relayUrl) : input,
      init
    );
  };

/**
 * Keep oidc-provider's native fetch implementation whenever the protection is enabled and no
 * allowlist applies, so future upstream fetch hardening is inherited automatically. Override it
 * only for the self-hosted opt-out and for the allowlist, which upstream cannot honor.
 */
const getBaseFetch = (): Optional<typeof fetch> => {
  const { isSsrfProtectionEnabled, ssrfAllowedAddresses } = EnvSet.values;

  if (!isSsrfProtectionEnabled) {
    return fetchWithoutSsrfDispatcher;
  }

  return cond(ssrfAllowedAddresses.length > 0 && fetchWithAllowlistedDispatcher);
};

export const getProviderFetchConfig = () => {
  const { openAiCimdRelayUrl } = EnvSet.values;
  const baseFetch = getBaseFetch();

  if (openAiCimdRelayUrl) {
    return {
      fetch: withOpenAiCimdRelay(
        openAiCimdRelayUrl,
        baseFetch ?? (async (input, init) => fetch(input, init))
      ),
    };
  }

  return cond(baseFetch && { fetch: baseFetch });
};

export default fetchWithoutSsrfDispatcher;
