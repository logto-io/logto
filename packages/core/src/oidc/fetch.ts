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

/**
 * Temporary workaround for OpenAI clients. The client metadata documents of ChatGPT and Codex are
 * all served from chatgpt.com, and chatgpt.com rejects requests from the platform's shared egress
 * addresses outright, so CIMD sign-in with those clients fails before the document is even read.
 * Until OpenAI stops blocking them, Cloud can send these fetches through a relay on a dedicated
 * address. The relay below and the `OPENAI_CIMD_RELAY_ORIGIN` setting go away together once the
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
  (relayOrigin: string): typeof fetch =>
  async (input, init) => {
    const url = new URL(input instanceof Request ? input.url : input);

    if (url.origin !== chatGptOrigin || !openAiCimdDocumentPath.test(url.pathname)) {
      return fetch(input, init);
    }

    /**
     * Concatenated onto the relay origin rather than resolved against it as a base: a pathname
     * starting with `//` would otherwise be read as a network-path reference and replace the relay
     * host with path content.
     */
    const relayed = new URL(`${relayOrigin}${url.pathname}${url.search}`);

    return fetch(input instanceof Request ? new Request(relayed, input) : relayed, init);
  };

/**
 * The `fetch` for oidc-provider's outgoing requests, or `undefined` to keep the provider's native
 * implementation so future upstream fetch hardening is inherited automatically.
 *
 * The overrides never coexist: the first two are self-hosted opt-outs, while the relay is only
 * read in Cloud, where the protection is always on with no allowlist.
 */
export const getOidcProviderFetch = (): Optional<typeof fetch> => {
  const { isSsrfProtectionEnabled, ssrfAllowedAddresses, openAiCimdRelayOrigin } = EnvSet.values;

  if (!isSsrfProtectionEnabled) {
    return fetchWithoutSsrfDispatcher;
  }

  if (ssrfAllowedAddresses.length > 0) {
    return fetchWithAllowlistedDispatcher;
  }

  return cond(openAiCimdRelayOrigin && createFetchWithOpenAiCimdRelay(openAiCimdRelayOrigin));
};

export default fetchWithoutSsrfDispatcher;
