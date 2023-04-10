import type { IncomingMessage, ServerResponse } from 'node:http';
import { promisify } from 'node:util';

import type { NextFunction, HttpContext, RequestContext } from '@withtyped/server';
import helmet, { type HelmetOptions } from 'helmet';

import { EnvSet } from '#src/env-set/index.js';

/**
 * Apply security headers to the response using helmet
 * @see https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html for recommended headers
 * @see https://helmetjs.github.io/ for more details
 * @returns middleware
 */

const helmetPromise = async (
  settings: HelmetOptions,
  request: IncomingMessage,
  response: ServerResponse
) =>
  promisify((callback) => {
    helmet(settings)(request, response, (error) => {
      // Make TS happy
      callback(error, null);
    });
  })();

export default function withSecurityHeaders<InputContext extends RequestContext>() {
  const {
    global: { adminUrlSet, cloudUrlSet, urlSet },
    isProduction,
  } = EnvSet;

  const adminOrigins = adminUrlSet.origins;
  const cloudOrigins = cloudUrlSet.origins;
  const urlSetOrigins = urlSet.origins;
  const developmentOrigins = isProduction ? [] : ['ws:'];

  return async (
    context: InputContext,
    next: NextFunction<InputContext>,
    { response, request }: HttpContext
  ) => {
    const requestPath = context.request.url.pathname;

    /**
     * Default Applied rules:
     * - crossOriginOpenerPolicy: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#cross-origin-opener-policy-coop
     * - crossOriginResourcePolicy: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#cross-origin-resource-policy-corp
     * - crossOriginEmbedderPolicy: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#cross-origin-embedder-policy-coep
     * - hidePoweredBy: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#x-powered-by
     * - hsts: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#strict-transport-security-hsts
     * - ieNoOpen: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#x-download-options
     * - noSniff: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#x-content-type-options
     * - permittedCrossDomainPolicies: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#x-permitted-cross-domain-policies
     * - referrerPolicy: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#referrer-policy
     * - xssFilter: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#x-xss-protection
     * - originAgentCluster: https://whatpr.org/html/6214/origin.html#origin-keyed-agent-clusters
     * - frameguard: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#x-frame-options
     */

    const basicSecurityHeaderSettings: HelmetOptions = {
      contentSecurityPolicy: false, // Exclusively set for console app only
      expectCt: false, // Not recommended, will be deprecated by modern browsers
      dnsPrefetchControl: false,
      referrerPolicy: {
        policy: 'strict-origin-when-cross-origin',
      },
    };

    if (requestPath.startsWith('/api')) {
      // FrameOptions: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#x-frame-options

      await helmetPromise(basicSecurityHeaderSettings, request, response);

      return next(context);
    }

    // For cloud console
    // ContentSecurityPolicy: https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html
    await helmetPromise(
      {
        ...basicSecurityHeaderSettings,
        frameguard: false,
        contentSecurityPolicy: {
          useDefaults: true,
          // Temporary set to report only to avoid breaking the app
          reportOnly: true,
          directives: {
            'upgrade-insecure-requests': null,
            imgSrc: ["'self'", 'data:', 'https:'],
            scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
            connectSrc: [
              "'self'",
              ...adminOrigins,
              ...cloudOrigins,
              ...urlSetOrigins,
              ...developmentOrigins,
            ],
            frameSrc: ["'self'", ...urlSetOrigins],
          },
        },
      },
      request,
      response
    );

    return next(context);
  };
}
