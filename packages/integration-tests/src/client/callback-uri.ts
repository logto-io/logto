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

export const getSubmittingCallbackUri = (html: string, redirectUri?: string) => {
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
  const search = callbackParameters.toString();

  return `${callbackUrl.origin}${callbackUrl.pathname}${search && `?${search}`}${callbackUrl.hash}`;
};
