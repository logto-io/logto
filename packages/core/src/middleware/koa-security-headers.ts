import type { MiddlewareType } from 'koa';
import compose from 'koa-compose';
import helmet from 'koa-helmet';

export default function koaSecurityHeaders<StateT, ContextT, ResponseBodyT>(): MiddlewareType<
  StateT,
  ContextT,
  ResponseBodyT
> {
  return compose([
    // Expect-ct: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#expect-ct  not recommended
    // helmet.expectCt(),

    // X-Powered-By: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#x-powered-by
    helmet.hidePoweredBy(),

    // Strict-Transport-Security: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#strict-transport-security-hsts
    helmet.hsts(),

    // X-Download-Options
    helmet.ieNoOpen(),

    // X-Content-Type-Options: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#x-content-type-options
    helmet.noSniff(),

    // X-Permitted-Cross-Domain-Policies
    helmet.permittedCrossDomainPolicies(),

    // Referrer-Policy https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#referrer-policy
    // @ts-expect-error broken type definition, koaHelmet types definitions remain 6.* for now broken
    helmet.referrerPolicy({
      policy: 'strict-origin-when-cross-origin',
    }),

    // X-XSS-Protection https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#x-xss-protection
    helmet.xssFilter(),

    // TODO X-Frame-Options: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#x-frame-options
    // Need to load preview and terms of uses in iframe. Use a Content Security Policy (CSP) header to guard per app instead.
    // helmet.frameguard(),

    /* eslint-disable @typescript-eslint/no-unsafe-call */
    // cross-Origin-Opener-Policy: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#cross-origin-opener-policy-coop
    // @ts-expect-error koaHelmet types definitions remain 6.* for now
    helmet.crossOriginOpenerPolicy(),

    // Cross-Origin-Resource-Policy: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#cross-origin-resource-policy-corp
    // @ts-expect-error koaHelmet types definitions remain 6.* for now
    helmet.crossOriginResourcePolicy(),
    /* eslint-enable @typescript-eslint/no-unsafe-call */
  ]);
}
