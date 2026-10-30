/**
 * @file Reduce the errors that carry an outbound `got` request to what is safe to log, export or
 * return.
 *
 * `got` attaches the full request `Options` to its `RequestError` as an **enumerable** property
 * (`request` and `response` are not), and `Options.toJSON()` returns its internals: headers
 * (`Authorization`), basic-auth credentials (also embedded in the serialized URL), form and JSON
 * bodies, query string. Several connectors wrap such an error as the `data` of a `ConnectorError`
 * (`new ConnectorError(ConnectorErrorCodes.General, error)`), which stringifies it into its
 * `message`; the connector error handler then builds a `RequestError` whose `data` and
 * `errorDescription` carry it, and `RequestError.toBody()` returns `data` to the client.
 */

/** The slice of a `got` `RequestError` this module reads. */
type GotRequestErrorLike = Error & {
  code: string;
  options: { method: string; url?: URL | string };
};

/**
 * Duck-typed check for a `got` `RequestError` (and its subclasses: `TimeoutError`, `HTTPError`…).
 * Connectors ship their own copy of `got`, so an `instanceof` check against core's copy would
 * silently miss the errors thrown from a connector package.
 */
export const isGotRequestError = (error: unknown): error is GotRequestErrorLike =>
  error instanceof Error &&
  'code' in error &&
  typeof error.code === 'string' &&
  'options' in error &&
  typeof error.options === 'object' &&
  error.options !== null &&
  'method' in error.options &&
  typeof error.options.method === 'string';

/**
 * An error that carries a `got` `RequestError` as its `data`: `ConnectorError` when a connector
 * wraps the failed request (`new ConnectorError(ConnectorErrorCodes.General, error)`), and the
 * `RequestError` the connector error handler builds from it. Both serialize `data` into their
 * `message`, so the message itself has to be rebuilt.
 */
type WrappedGotRequestError = Error & { code?: unknown; data: GotRequestErrorLike };

const isWrappedGotRequestError = (error: unknown): error is WrappedGotRequestError =>
  error instanceof Error && 'data' in error && isGotRequestError(error.data);

/**
 * Origin and pathname only. Several connectors send their token exchange through the query string
 * (`client_secret`, `code`, `fb_exchange_token`…), and a URL can also carry basic credentials.
 */
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

/** The stack frames of an error, without its first line (`${name}: ${message}`). */
const stackFramesOf = (stack: string | undefined): string => {
  if (stack === undefined) {
    return '';
  }

  const index = stack.indexOf('\n    at ');
  return index === -1 ? '' : stack.slice(index);
};

type SafeErrorInput = {
  name: string;
  stack?: string;
  code?: string;
  method?: string;
  url?: string;
  data?: Error;
};

/**
 * What remains of an error once reduced to what is safe to print or export: name, message, code,
 * the method and URL of the failed request, the stack frames. The stack is rebuilt because its
 * first line repeats the original message.
 */
class SafeError extends Error {
  code?: string;
  method?: string;
  url?: string;
  data?: Error;

  constructor(message: string, { name, stack, code, method, url, data }: SafeErrorInput) {
    super(message);
    this.name = name;
    this.stack = `${name}: ${message}${stackFramesOf(stack)}`;
    this.code = code;
    this.method = method;
    this.url = url;
    this.data = data;
  }
}

/**
 * Keep the diagnostic value of a `got` error (name, code, message, method, URL, stack) and drop
 * its `options`.
 */
const toSafeGotRequestError = (error: GotRequestErrorLike): SafeError =>
  new SafeError(error.message, {
    name: error.name,
    stack: error.stack,
    code: error.code,
    method: error.options.method,
    url: toSafeUrl(error.options.url),
  });

/**
 * Reduce an error to what is safe to print or export.
 *
 * `got` attaches the full request `Options` to its `RequestError` as an **enumerable** property
 * (`request` and `response` are not), so `console.error(error)` dumps the request: the form body
 * of a social connector's token exchange (`code=…&client_id=…&client_secret=…`), the
 * `Authorization` header or the basic-auth password of an email connector, the query string of
 * the connectors that exchange their code through it. One network timeout towards the provider
 * was enough to print the connector's secret in plain text in the production logs.
 *
 * The same request options travel inside the errors that wrap a `got` error as `data`
 * (`ConnectorError`, then the `RequestError` built from it): `JSON.stringify(data)` lands in their
 * `message`, and Application Insights serializes every property of what it receives.
 */
export const sanitizeError = (error: unknown): unknown => {
  if (isGotRequestError(error)) {
    return toSafeGotRequestError(error);
  }

  if (isWrappedGotRequestError(error)) {
    const data = toSafeGotRequestError(error.data);
    const code = typeof error.code === 'string' ? error.code : undefined;
    // `ConnectorError` does not set its `name`
    const name = error.name === 'Error' ? error.constructor.name : error.name;

    // Read as `${name}: ${message}` once stringified: the connector code, then the network code
    return new SafeError(`${code ? `(${code}) ` : ''}[${data.code}] ${data.message}`, {
      name,
      stack: error.stack,
      code,
      data,
    });
  }

  return error;
};

/**
 * What a `got` error carried as the `data` of a connector error may become: its name, code and
 * message, under the `errorDescription` key the connector error handler reads. Nothing of the
 * request itself, which can carry the connector's secret and an admin-configured endpoint.
 */
export const toSafeConnectorErrorData = (data: unknown): unknown =>
  isGotRequestError(data)
    ? { name: data.name, code: data.code, errorDescription: data.message }
    : data;
