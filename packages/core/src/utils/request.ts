import type { IncomingHttpHeaders } from 'http';

export const noCache = (headers: IncomingHttpHeaders): boolean =>
  headers['cache-control']?.split(',').some((value) => value.trim().toLowerCase() === 'no-cache') ??
  false;
