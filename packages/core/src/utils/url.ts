import path from 'path';

export const appendPath = (url: URL | string, ...pathnames: string[]): URL =>
  new URL(path.join(new URL(url).pathname, ...pathnames), url);
