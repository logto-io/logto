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
