/**
 * @file Recognize the error a social connector lets through when its request to the provider failed
 * at the transport level, whichever HTTP client the connector uses (`got` or `ky`).
 */

/** The slice of a `got` `RequestError` this module reads. */
type GotRequestErrorLike = Error & {
  code: string;
  options: { method: string; url?: URL | string };
};

/**
 * Duck-typed check for a `got` `RequestError`. Connectors ship their own copy of `got`, so an
 * `instanceof` check against core's copy would silently miss the errors thrown from a connector.
 */
const isGotRequestError = (error: unknown): error is GotRequestErrorLike =>
  error instanceof Error &&
  'code' in error &&
  typeof error.code === 'string' &&
  'options' in error &&
  typeof error.options === 'object' &&
  error.options !== null &&
  'method' in error.options &&
  typeof error.options.method === 'string';

/**
 * The `got` errors that did receive and read a response: `HTTPError` (the connectors handle it
 * themselves) and `ParseError` (an invalid body, not an unreachable provider). Every other
 * `RequestError` is a transport failure, including the ones that carry a partial `response`
 * (`ReadError`, a timeout firing mid-download).
 */
const gotResponseErrorCodes = new Set(['ERR_NON_2XX_3XX_RESPONSE', 'ERR_BODY_PARSE_FAILURE']);

/** Duck-typed check for a `ky` `TimeoutError`: no `code`, but the `Request` it timed out on. */
const isKyTimeoutError = (error: unknown): error is Error & { request: { url?: string } } =>
  error instanceof Error &&
  error.name === 'TimeoutError' &&
  'request' in error &&
  typeof error.request === 'object' &&
  error.request !== null;

/**
 * Duck-typed check for the `fetch` failure `ky` lets through: a `TypeError('fetch failed')` whose
 * `cause` carries the network code (`ENOTFOUND`, `ECONNREFUSED`, `UND_ERR_CONNECT_TIMEOUT`…).
 */
const isFetchFailure = (error: unknown): error is TypeError & { cause: { code: string } } =>
  error instanceof TypeError &&
  'cause' in error &&
  typeof error.cause === 'object' &&
  error.cause !== null &&
  'code' in error.cause &&
  typeof error.cause.code === 'string';

/** Origin and pathname only: the query string of a token exchange can carry the client secret. */
const toSafeUrl = (url: URL | string | undefined): string | undefined => {
  if (url === undefined) {
    return undefined;
  }

  try {
    const { origin, pathname } = new URL(String(url));
    return origin + pathname;
  } catch {
    return undefined;
  }
};

type TransportFailure = { code: string; method?: string; url?: string };

/**
 * Describe the error a connector let through when its request to the provider failed at the
 * transport level, whichever HTTP client the connector uses (`got` or `ky`); `undefined` for any
 * other error.
 */
export const describeTransportFailure = (error: unknown): TransportFailure | undefined => {
  if (isGotRequestError(error)) {
    return gotResponseErrorCodes.has(error.code)
      ? undefined
      : { code: error.code, method: error.options.method, url: toSafeUrl(error.options.url) };
  }

  if (isKyTimeoutError(error)) {
    return { code: 'ETIMEDOUT', url: toSafeUrl(error.request.url) };
  }

  if (isFetchFailure(error)) {
    return { code: error.cause.code };
  }

  return undefined;
};
