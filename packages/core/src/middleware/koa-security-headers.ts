import { type IncomingMessage, type ServerResponse } from 'node:http';
import { promisify } from 'node:util';

import { defaultTenantId } from '@logto/schemas';
import helmet, { type HelmetOptions } from 'helmet';
import type { MiddlewareType } from 'koa';

import { EnvSet, AdminApps, getTenantEndpoint } from '#src/env-set/index.js';

/**
 * Apply security headers to the response using koa-helmet
 * @see https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html for recommended headers
 * @see https://helmetjs.github.io/ for more details
 * @returns koa middleware
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

export default function koaSecurityHeaders<StateT, ContextT, ResponseBodyT>(
  mountedApps: string[],
  tenantId: string
): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  const { isProduction, isCloud, isMultiTenancy, adminUrlSet, cloudUrlSet } = EnvSet.values;

  const adminOrigins = adminUrlSet.origins;
  const cloudOrigins = isCloud ? cloudUrlSet.origins : [];
  const tenantEndpointOrigin = getTenantEndpoint(
    isMultiTenancy ? tenantId : defaultTenantId,
    EnvSet.values
  ).origin;
  const developmentOrigins = isProduction ? [] : ['ws:'];

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
   */

  const basicSecurityHeaderSettings: HelmetOptions = {
    contentSecurityPolicy: false, // Exclusively set per app
    expectCt: false, // Not recommended, will be deprecated by modern browsers
    dnsPrefetchControl: false,
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
  };

  const mainFlowUiSecurityHeaderSettings: HelmetOptions = {
    ...basicSecurityHeaderSettings,
    // WARNING: high risk Need to allow self hosted terms of use page loaded in an iframe
    frameguard: false,
    // Alow loaded by console preview iframe
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },
    contentSecurityPolicy: {
      useDefaults: true,
      // Temporary set to report only to avoid breaking the app
      reportOnly: true,
      directives: {
        'upgrade-insecure-requests': null,
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
        connectSrc: ["'self'", ...adminOrigins, ...cloudOrigins, ...developmentOrigins],
        // WARNING: high risk Need to allow self hosted terms of use page loaded in an iframe
        frameSrc: ["'self'", 'https:'],
        // Alow loaded by console preview iframe
        frameAncestors: ["'self'", ...adminOrigins, ...cloudOrigins],
      },
    },
  };

  const consoleSecurityHeaderSettings: HelmetOptions = {
    ...basicSecurityHeaderSettings,
    // Guarded by CSP header bellow
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
          tenantEndpointOrigin,
          ...adminOrigins,
          ...cloudOrigins,
          ...developmentOrigins,
        ],
        // Allow Main Flow origin loaded in preview iframe
        frameSrc: ["'self'", tenantEndpointOrigin],
      },
    },
  };

  return async (ctx, next) => {
    const { request, req, res } = ctx;
    const requestPath = request.path;

    // Admin Console
    if (
      requestPath.startsWith(`/${AdminApps.Console}`) ||
      requestPath.startsWith(`/${AdminApps.Welcome}`)
    ) {
      await helmetPromise(consoleSecurityHeaderSettings, req, res);

      return next();
    }

    // Route has been handled by one of mounted apps
    if (mountedApps.some((app) => app !== '' && requestPath.startsWith(`/${app}`))) {
      await helmetPromise(basicSecurityHeaderSettings, req, res);

      return next();
    }

    // Main flow UI
    await helmetPromise(mainFlowUiSecurityHeaderSettings, req, res);

    return next();
  };
}
