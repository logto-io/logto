/**
 * @fileoverview Fetch overrides specific to oidc-provider.
 *
 * The pinned provider calls `fetch(url, options)` with a URL string and its SSRF dispatcher in
 * `options.dispatcher`; the overrides below rely on that convention. Recheck it when upgrading.
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
 * Temporary: chatgpt.com rejects requests from the platform's shared egress addresses, so Cloud
 * fetches the OpenAI client metadata documents through a relay on a dedicated address until the
 * block is lifted. Only those documents are rewritten; other requests to chatgpt.com stay direct.
 */
const chatGptOrigin = 'https://chatgpt.com';
const openAiCimdDocumentPath = /^\/oauth\/(?:codex\/)?(?:[^/]+\/)?client\.json$/;

const relayOpenAiCimdDocument = (input: Parameters<typeof fetch>[0], relayHost: string) => {
  const url = typeof input === 'string' ? new URL(input) : undefined;

  if (!url || url.origin !== chatGptOrigin || !openAiCimdDocumentPath.test(url.pathname)) {
    return input;
  }

  const relayed = new URL(url);
  // eslint-disable-next-line @silverhand/fp/no-mutation
  relayed.host = relayHost;

  return relayed;
};

const getFetchWithDispatcherPolicy = (): typeof fetch => {
  const { isSsrfProtectionEnabled, ssrfAllowedAddresses } = EnvSet.values;

  if (!isSsrfProtectionEnabled) {
    return fetchWithoutSsrfDispatcher;
  }

  if (ssrfAllowedAddresses.length > 0) {
    return fetchWithAllowlistedDispatcher;
  }

  /**
   * Same as the provider's own default, which also resolves the global `fetch` per call, so a
   * `fetch` replaced after initialization (test stubs, instrumentation) is still honored.
   */
  return async (input, init) => fetch(input, init);
};

/**
 * The relay is composed over the dispatcher policy rather than ordered before it, so neither
 * depends on how the other is configured. Today they never meet anyway: CIMD is off under the
 * opt-out and the allowlist (see `isCimdEffectivelyEnabled`).
 */
export const getOidcProviderFetch = (): typeof fetch => {
  const { openAiCimdRelayHost } = EnvSet.values;
  const fetchWithDispatcherPolicy = getFetchWithDispatcherPolicy();

  if (!openAiCimdRelayHost) {
    return fetchWithDispatcherPolicy;
  }

  return async (input, init) =>
    fetchWithDispatcherPolicy(relayOpenAiCimdDocument(input, openAiCimdRelayHost), init);
};

export default fetchWithoutSsrfDispatcher;
