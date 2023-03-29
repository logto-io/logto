import type { MiddlewareType } from 'koa';
import helmet from 'koa-helmet';

/**
 * Apply security headers to the response using koa-helmet
 * @see https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html for recommended headers
 * @see https://helmetjs.github.io/ for more details
 * @returns koa middleware
 */

export default function koaSecurityHeaders<StateT, ContextT, ResponseBodyT>(): MiddlewareType<
  StateT,
  ContextT,
  ResponseBodyT
> {
  /**
   * Applied rules:
   * - crossOriginOpenerPolicy: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#cross-origin-opener-policy-coop
   * - hidePoweredBy: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#x-powered-by
   * - hsts: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#strict-transport-security-hsts
   * - ieNoOpen: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#x-download-options
   * - noSniff: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#x-content-type-options
   * - permittedCrossDomainPolicies: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#x-permitted-cross-domain-policies
   * - referrerPolicy: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#referrer-policy
   * - xssFilter: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#x-xss-protection
   * - originAgentCluster: https://whatpr.org/html/6214/origin.html#origin-keyed-agent-clusters
   */

  return helmet({
    contentSecurityPolicy: false, // Will be set exclusively by the app
    expectCt: false, // Not recommended, will be deprecated by modern browsers
    dnsPrefetchControl: false,
    frameguard: false, // TODO  Will be set exclusively by the app
    crossOriginResourcePolicy: false, // TODO  Will be set exclusively by the app
    crossOriginEmbedderPolicy: false, // TODO Will be set exclusively by the app
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
  });
}
