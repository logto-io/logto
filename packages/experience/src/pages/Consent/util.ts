/**
 * We need to hide the query params and path from the redirectUri for security reasons when displaying it to the user.
 *
 * if the redirectUri is a http url, we should return the origin
 * Otherwise return the original uri. e.g. native schema io.logto://callback
 */
export const getRedirectUriOrigin = (redirectUri: string) => {
  const url = new URL(redirectUri);

  // If the redirectUri is a http url, we should return the origin
  if (url.protocol.startsWith('http')) {
    return url.origin;
  }

  // Otherwise return the original uri. e.g. native schema io.logto://callback
  return redirectUri;
};

/**
 * The host of a client identifier URL, e.g. `client.example.com` for
 * `https://client.example.com/oauth/metadata.json`.
 *
 * The path is dropped: whoever controls the host controls every path under it, so the path carries
 * no identity of its own — and it is where the identifier's length comes from. A non-default port
 * is kept, as it belongs to the origin the document is served from.
 */
export const getClientIdentifierHost = (clientIdentifier: string) => new URL(clientIdentifier).host;
