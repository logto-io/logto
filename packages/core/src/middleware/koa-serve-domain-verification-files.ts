import { domainVerificationFilePathGuard } from '@logto/schemas';
import type { MiddlewareType } from 'koa';

import type Queries from '#src/tenants/Queries.js';

const allowedMethods = new Set(['GET', 'HEAD']);

export default function koaServeDomainVerificationFiles(
  customDomain: string,
  queries: Queries
): MiddlewareType {
  const { hostname } = new URL(customDomain);

  return async (ctx, next) => {
    // Preserve any Logto route that has already handled the request.
    if (
      ctx.status !== 404 ||
      ctx.body !== undefined ||
      !allowedMethods.has(ctx.method) ||
      !domainVerificationFilePathGuard.safeParse(ctx.path).success
    ) {
      return next();
    }

    const domain = await queries.domains.findDomain(hostname);
    const verificationFile = domain?.verificationFiles.find(({ path }) => path === ctx.path);

    if (!verificationFile) {
      return next();
    }

    ctx.status = 200;
    ctx.type = verificationFile.contentType;
    ctx.length = Buffer.byteLength(verificationFile.content);
    ctx.set('Cache-Control', 'no-store');
    ctx.set('Content-Security-Policy', "default-src 'none'; sandbox");
    ctx.set('X-Content-Type-Options', 'nosniff');

    if (ctx.method === 'GET') {
      ctx.body = verificationFile.content;
    }
  };
}
