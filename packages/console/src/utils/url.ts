import { trySafe } from '@silverhand/essentials';

export const buildUrl = (path: string, searchParameters: Record<string, string>) =>
  `${path}?${new URLSearchParams(searchParameters).toString()}`;

export const formatSearchKeyword = (keyword: string) => `%${keyword}%`;

/** If the current pathname is `/callback` or ends with `-callback`, we consider it as a callback page. */
export const isInCallback = () =>
  ['/callback', '-callback'].some((path) => window.location.pathname.endsWith(path));

export const isAbsoluteUrl = (url?: string) => Boolean(trySafe(() => url && new URL(url)));

export const dropLeadingSlash = (path: string) => path.replace(/^\/+/, '');
