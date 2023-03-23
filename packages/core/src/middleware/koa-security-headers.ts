import type { MiddlewareType } from 'koa';
import compose from 'koa-compose';
import helmet from 'koa-helmet';

import { EnvSet } from '#src/env-set/index.js';

export default function koaSecurityHeaders<StateT, ContextT, ResponseBodyT>(): MiddlewareType<
  StateT,
  ContextT,
  ResponseBodyT
> {
  const { isProduction, endpoint, adminUrlSet } = EnvSet.values;

  const adminUrls = adminUrlSet.deduplicated().map((url) => url.origin);

  return compose([
    helmet.expectCt(), // Expect-CT
    helmet.hidePoweredBy(), // X-Powered-By
    helmet.hsts(), // Strict-Transport-Security
    helmet.ieNoOpen(), // X-Download-Options
    helmet.noSniff(), // X-Content-Type-Options
    helmet.permittedCrossDomainPolicies(), // X-Permitted-Cross-Domain-Policies
    helmet.referrerPolicy(), // Referrer-Policy
    helmet.xssFilter(), // X-XSS-Protection

    /* eslint-disable @typescript-eslint/no-unsafe-call */
    // @ts-expect-error koaHelmet types definitions remain 6.* for now
    helmet.crossOriginOpenerPolicy(), // Sets "Cross-Origin-Opener-Policy: same-origin"
    // @ts-expect-error koaHelmet types definitions remain 6.* for now
    helmet.crossOriginResourcePolicy(), // Sets "Cross-Origin-Resource-Policy: same-site"
    /* eslint-enable @typescript-eslint/no-unsafe-call */
  ]);
}
