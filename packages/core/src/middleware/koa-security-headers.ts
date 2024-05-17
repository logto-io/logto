import { type IncomingMessage, type ServerResponse } from 'node:http';
import { promisify } from 'node:util';

import { conditionalArray } from '@silverhand/essentials';
import helmet, { type HelmetOptions } from 'helmet';
import type { MiddlewareType } from 'koa';

import { EnvSet, AdminApps, getTenantEndpoint } from '#src/env-set/index.js';

/**
 * Apply security headers to the response using helmet
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
  const { isProduction, isCloud, urlSet, adminUrlSet, cloudUrlSet } = EnvSet.values;

  const tenantEndpointOrigin = getTenantEndpoint(tenantId, EnvSet.values).origin;
  // Logto Cloud uses cloud service to serve the admin console; while Logto OSS uses a fixed path under the admin URL set.
  const adminOrigins = isCloud ? cloudUrlSet.origins : adminUrlSet.origins;
  const coreOrigins = urlSet.origins;
  const developmentOrigins = conditionalArray(!isProduction && 'ws:');

  // We use react-monaco-editor for code editing in the admin console. It loads the monaco editor asynchronously from a CDN.
  // Allow the CDN src in the CSP.
  // Allow blob: for monaco editor to load worker scripts
  const monacoEditorCDNSource = [
    'https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs/',
    'blob:',
  ];

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
    crossOriginOpenerPolicy: false, // Allow cross origin opener, as some apps rely on popup window for the sign-in flow
    crossOriginEmbedderPolicy: { policy: 'credentialless' },
    dnsPrefetchControl: false,
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
  };

  // @ts-expect-error: helmet typings has lots of {A?: T, B?: never} | {A?: never, B?: T} options definitions. Optional settings type can not inferred correctly.
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
      directives: {
        'upgrade-insecure-requests': null,
        imgSrc: ["'self'", 'data:', 'https:'],
        // Non-production environment allow "unsafe-eval" and "unsafe-inline" for debugging purpose
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          ...conditionalArray(!isProduction && "'unsafe-eval'"),
        ],
        connectSrc: ["'self'", tenantEndpointOrigin, ...developmentOrigins],
        // WARNING: high risk Need to allow self hosted terms of use page loaded in an iframe
        frameSrc: ["'self'", 'https:'],
        // Alow loaded by console preview iframe
        frameAncestors: ["'self'", ...adminOrigins],
      },
    },
  };

  // @ts-expect-error: helmet typings has lots of {A?: T, B?: never} | {A?: never, B?: T} options definitions. Optional settings type can not inferred correctly.
  const consoleSecurityHeaderSettings: HelmetOptions = {
    ...basicSecurityHeaderSettings,
    // Guarded by CSP header bellow
    frameguard: false,
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'upgrade-insecure-requests': null,
        imgSrc: ["'self'", 'data:', 'https:'],
        // Non-production environment allow "unsafe-eval" and "unsafe-inline" for debugging purpose
        scriptSrc: [
          "'self'",
          ...conditionalArray(!isProduction && ["'unsafe-eval'", "'unsafe-inline'"]),
          ...monacoEditorCDNSource,
        ],
        connectSrc: ["'self'", ...adminOrigins, ...coreOrigins, ...developmentOrigins],
        // Allow Main Flow origin loaded in preview iframe
        frameSrc: ["'self'", ...adminOrigins, ...coreOrigins],
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
