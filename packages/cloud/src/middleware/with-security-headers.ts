import type { NextFunction, HttpContext, RequestContext } from '@withtyped/server';

import { EnvSet } from '#src/env-set/index.js';

export default function withSecurityHeaders<InputContext extends RequestContext>() {
  const {
    global: { adminUrlSet, cloudUrlSet, urlSet },
  } = EnvSet;

  const adminOrigins = adminUrlSet.origins;
  const cloudOrigins = cloudUrlSet.origins;
  const urlSetOrigins = urlSet.origins;

  return async (
    context: InputContext,
    next: NextFunction<InputContext>,
    { response }: HttpContext
  ) => {
    const requestPath = context.request.url.pathname;

    // CrossOriginOpenerPolicy: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#cross-origin-opener-policy-coop
    response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    // CrossOriginResourcePolicy: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#cross-origin-resource-policy-corp
    response.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

    // CrossOriginEmbedderPolicy: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#cross-origin-embedder-policy-coep
    response.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');

    // Hsts: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#strict-transport-security-hsts
    response.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

    // NoSniff: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#x-content-type-options
    response.setHeader('X-Content-Type-Options', 'nosniff');

    // IeNoOpen: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#x-download-options
    response.setHeader('X-Download-Options', 'noopen');

    // PermittedCrossDomainPolicies: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#x-permitted-cross-domain-policies
    response.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

    // ReferrerPolicy: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#referrer-policy
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // XssFilter: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#x-xss-protection
    response.setHeader('X-XSS-Protection', '0');

    // OriginAgentCluster: https://whatpr.org/html/6214/origin.html#origin-keyed-agent-clusters
    response.setHeader('Origin-Agent-Cluster', '?1');

    if (requestPath.startsWith('/api')) {
      // FrameOptions: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#x-frame-options
      response.setHeader('X-Frame-Options', 'DENY');

      return next(context);
    }

    // For cloud console
    // ContentSecurityPolicy: https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html
    response.setHeader(
      'Content-Security-Policy-Report-Only',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "script-src-attr 'none'",
        "style-src 'self' 'unsafe-inline' https:",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        `connect-src 'self' ${adminOrigins.join(' ')} ${cloudOrigins.join(
          ' '
        )} ${urlSetOrigins.join(' ')} ws:`,
        `frame-src 'self' ${urlSetOrigins.join(' ')}`,
        "worker-src 'self'",
        "child-src 'self'",
        "object-src 'none'",
        "form-action 'self'",
        "manifest-src 'self'",
        "frame-ancestors 'self'",
        'block-all-mixed-content',
      ].join(';')
    );

    return next(context);
  };
}
