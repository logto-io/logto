import { assert } from '@silverhand/essentials';

const decodeHtmlAttribute = (value: string) =>
  value
    .replaceAll('&quot;', '"')
    .replaceAll('&#34;', '"')
    .replaceAll('&apos;', "'")
    .replaceAll('&#39;', "'")
    .replaceAll('&amp;', '&');

const getHtmlAttribute = (html: string, attribute: string) =>
  new RegExp(`\\b${attribute}=(["'])(.*?)\\1`, 'i').exec(html)?.[2];

export const getSignInCallbackContext = (signInSession: unknown) => {
  if (typeof signInSession !== 'object' || signInSession === null) {
    return {};
  }

  return {
    redirectUri:
      'redirectUri' in signInSession && typeof signInSession.redirectUri === 'string'
        ? signInSession.redirectUri
        : undefined,
    state:
      'state' in signInSession && typeof signInSession.state === 'string'
        ? signInSession.state
        : undefined,
  };
};

export const getSubmittingCallbackUri = (
  html: string,
  redirectUri?: string,
  fallbackState?: string
) => {
  const form = /<form\b[^>]*>/i.exec(html)?.[0];
  assert(form, new Error('Missing callback form'));
  const action = getHtmlAttribute(form, 'action');
  assert(action, new Error('Missing callback form action'));
  const actionUrl = new URL(decodeHtmlAttribute(action));
  const callbackUrl = new URL(redirectUri ?? actionUrl);
  const callbackParameters = new URLSearchParams([
    ...callbackUrl.searchParams,
    ...actionUrl.searchParams,
  ]);

  for (const [input] of html.matchAll(/<input\b[^>]*>/gi)) {
    const name = getHtmlAttribute(input, 'name');
    const value = getHtmlAttribute(input, 'value');

    if (name && value) {
      callbackParameters.set(decodeHtmlAttribute(name), decodeHtmlAttribute(value));
    }
  }
  if (fallbackState && !callbackParameters.has('state')) {
    callbackParameters.set('state', fallbackState);
  }
  const search = callbackParameters.toString();

  return `${callbackUrl.origin}${callbackUrl.pathname}${search && `?${search}`}${callbackUrl.hash}`;
};
