import { trySafe } from '@silverhand/essentials';

/**
 * @remarks
 * `URLSearchParams` can handle cases where the value is an array, but its type definition does not accept parameters like `{ [key: string]: string[] }`.
 *
 * @example
 * ```ts
 * buildUrl(applicationsEndpoint, [
 *   ['types', ApplicationType.Traditional],
 *   ['types', ApplicationType.SPA],
 *   ['types', ApplicationType.SAML],
 * ]);
 * ```
 */
export const buildUrl = (
  path: string,
  searchParameters: ConstructorParameters<typeof URLSearchParams>[0]
) => `${path}?${new URLSearchParams(searchParameters).toString()}`;

export const formatSearchKeyword = (keyword: string) => `%${keyword}%`;

/** If the current pathname is `/callback` or ends with `-callback`, we consider it as a callback page. */
export const isInCallback = () =>
  ['/callback', '-callback'].some((path) => window.location.pathname.endsWith(path));

export const isAbsoluteUrl = (url?: string) => Boolean(trySafe(() => url && new URL(url)));

export const dropLeadingSlash = (path: string) => path.replace(/^\/+/, '');

export const applyDomain = (url: string, domain?: string) => {
  if (!domain || !isAbsoluteUrl(url)) {
    return url;
  }
  return url.replace(new URL(url).host, domain);
};
