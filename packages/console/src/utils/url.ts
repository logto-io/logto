export const buildUrl = (path: string, searchParameters: Record<string, string>) =>
  `${path}?${new URLSearchParams(searchParameters).toString()}`;

export const formatSearchKeyword = (keyword: string) => `%${keyword}%`;

/** If the current pathname is `/callback` or ends with `-callback`, we consider it as a callback page. */
export const isInCallback = () =>
  ['/callback', '-callback'].some((path) => window.location.pathname.endsWith(path));

/** If the current pathname is a callback page and the pathname only has one level. */
export const isInFirstLevelCallback = () =>
  window.location.pathname.split('/').length === 1 && isInCallback();
