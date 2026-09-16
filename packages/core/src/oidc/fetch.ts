/**
 * @fileoverview Fetch overrides specific to oidc-provider.
 *
 * The pinned provider calls `fetch(url, options)`, passing a URL string and supplying its SSRF
 * dispatcher through `options.dispatcher`. The opt-out and relay paths rely on this convention and
 * are not general-purpose fetch replacements.
 *
 * Recheck this assumption when upgrading oidc-provider.
 *
 * @see https://github.com/logto-io/node-oidc-provider/blob/513c523c0e68ee6112da8c871cce86204a136163/lib/helpers/fetch_request.js
 */

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

/**
 * Temporary workaround for OpenAI clients. The client metadata documents of ChatGPT and Codex are
 * all served from chatgpt.com, and chatgpt.com rejects requests from the platform's shared egress
 * addresses outright, so CIMD sign-in with those clients fails before the document is even read.
 * Until OpenAI stops blocking them, Cloud can send these fetches through a relay on a dedicated
 * address. The relay below and the `OPENAI_CIMD_RELAY_HOST` setting go away together once the
 * block is lifted.
 */
const chatGptOrigin = 'https://chatgpt.com';

/**
 * The client metadata documents of ChatGPT (`/oauth/client.json`, `/oauth/<id>/client.json`) and
 * Codex (`/oauth/codex/client.json`, `/oauth/codex/<id>/client.json`). Only these go through the
 * relay; any other request to chatgpt.com is left alone.
 */
const openAiCimdDocumentPath = /^\/oauth\/(?:codex\/)?(?:[^/]+\/)?client\.json$/;

/**
 * Fetches the OpenAI client metadata documents from the relay instead of chatgpt.com, keeping
 * path and query. The request options pass through untouched, so the dispatcher and timeout the
 * provider set for chatgpt.com apply to the relay as well.
 */
const createFetchWithOpenAiCimdRelay =
  (relayHost: string): typeof fetch =>
  async (input, init) => {
    const url = typeof input === 'string' ? new URL(input) : undefined;

    if (!url || url.origin !== chatGptOrigin || !openAiCimdDocumentPath.test(url.pathname)) {
      return fetch(input, init);
    }

    const relayed = new URL(url);
    // eslint-disable-next-line @silverhand/fp/no-mutation
    relayed.host = relayHost;

    return fetch(relayed, init);
  };

/**
 * The `fetch` for oidc-provider's outgoing requests. The overrides never coexist: the first two
 * are self-hosted opt-outs, while the relay is only read in Cloud, where the protection is always
 * on with no allowlist. The fallback is what the pinned provider does on its own.
 */
export const getOidcProviderFetch = (): typeof fetch => {
  const { isSsrfProtectionEnabled, ssrfAllowedAddresses, openAiCimdRelayHost } = EnvSet.values;

  if (!isSsrfProtectionEnabled) {
    return fetchWithoutSsrfDispatcher;
  }

  if (ssrfAllowedAddresses.length > 0) {
    return fetchWithAllowlistedDispatcher;
  }

  if (openAiCimdRelayHost) {
    return createFetchWithOpenAiCimdRelay(openAiCimdRelayHost);
  }

  /**
   * A wrapper rather than the bare `fetch`: it resolves the global on every call, exactly like the
   * provider's own default, so a `fetch` replaced after initialization (test stubs, instrumentation)
   * is still honored.
   */
  return async (input, init) => fetch(input, init);
};

export default fetchWithoutSsrfDispatcher;
