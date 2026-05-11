import { type IncomingMessage, type ServerResponse } from 'node:http';
import { promisify } from 'node:util';

import type { CustomUiCsp } from '@logto/schemas';
import { conditionalArray } from '@silverhand/essentials';
import helmet, { type HelmetOptions } from 'helmet';
import type { MiddlewareType } from 'koa';

import { EnvSet, AdminApps, UserApps, getTenantEndpoint } from '#src/env-set/index.js';
import type Queries from '#src/tenants/Queries.js';

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

const getOssServerOrigins = (): string[] => {
  try {
    const { origin } = new URL(process.env.LOGTO_OSS_SURVEY_ENDPOINT ?? '');
    return [origin];
  } catch {
    return [];
  }
};

type SecurityHeaderSettings = {
  readonly basicSecurityHeaderSettings: HelmetOptions;
  readonly consoleSecurityHeaderSettings: HelmetOptions;
  readonly accountCenterSecurityHeaderSettings: HelmetOptions;
  readonly defaultExperienceSecurityHeaderSettings: HelmetOptions;
  readonly getExperienceSecurityHeaderSettings: (customUiCsp?: CustomUiCsp) => HelmetOptions;
};

const appendCustomSources = (sources: string[], customSources: string[] = []) => [
  ...new Set([...sources, ...customSources]),
];

const createSecurityHeaderSettings = (tenantId: string): SecurityHeaderSettings => {
  const { isProduction, isCloud, isDevFeaturesEnabled, urlSet, adminUrlSet, cloudUrlSet } =
    EnvSet.values;

  const tenantEndpointOrigin = getTenantEndpoint(tenantId, EnvSet.values).origin;
  // Logto Cloud uses cloud service to serve the admin console; while Logto OSS uses a fixed path under the admin URL set.
  const adminOrigins = isCloud ? cloudUrlSet.origins : adminUrlSet.origins;
  const coreOrigins = urlSet.origins;
  const developmentOrigins = isProduction
    ? []
    : [
        'ws:',
        ...['6001', '6002', '6003'].flatMap((port) => [
          `ws://localhost:${port}`,
          `http://localhost:${port}`,
        ]),
        // Benefit local dev.
        'http://localhost:3000', // From local dev docs/website etc.
        'http://localhost:3002', // From local dev console.
        'http://localhost:5173', // From local website
        'http://localhost:5174', // From local blog
      ];
  const logtoOrigin = 'https://*.logto.io';
  /** Google Sign-In (GSI) origin for Google One Tap. */
  const gsiOrigin = 'https://accounts.google.com/gsi/';

  // Parse the OSS survey endpoint origin for CSP connect-src allowlisting.
  const ossSurveyOrigins = getOssServerOrigins();

  /**
   * Temporary hardcoded tenant-level `connect-src` allowlist for BYO-UI customers.
   * Keep it until Custom UI CSP is generally available and customers have migrated.
   */
  const customTenantConnectSourceAllowlist = conditionalArray(
    !isDevFeaturesEnabled && [
      // LaunchDarkly — A/B testing SDK (flag eval, streaming, events).
      'https://*.launchdarkly.com',
    ]
  );

  // We have the following use cases:
  //
  // - We use `react-monaco-editor` for code editing in the admin console. It loads the monaco
  // editor asynchronously from jsDelivr.
  //
  // Allow the CDN src in the CSP.
  // Allow blob: for monaco editor to load worker scripts
  const cdnSources = ['https://cdn.jsdelivr.net/', 'blob:'];

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
    // Google One Tap iframe request does not respond the proper CORP header (it uses `same-site` instead of `cross-origin`)
    // and we cannot add the `crossorigin` attribute to the iframe, so the only solution is to disable the COEP header here.
    // TODO: Re-enable COEP header when Google One Tap supports CORP header.
    // Security scan note: ZAP rule 90004 is ignored in .zap/rules.conf for this intentional exception.
    crossOriginEmbedderPolicy: false,
    dnsPrefetchControl: false,
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
  };

  const experienceScriptSource = [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-hashes'",
    `${gsiOrigin}client`,
    // Some of our users may use the Cloudflare Web Analytics service. We need to allow it to
    // load its scripts.
    'https://static.cloudflareinsights.com/',
    // Cloudflare Turnstile
    'https://challenges.cloudflare.com/turnstile/v0/api.js',
    // Google Recaptcha Enterprise
    'https://www.google.com/recaptcha/enterprise.js',
    'https://recaptcha.net/recaptcha/enterprise.js',
    // Google Recaptcha static resources
    'https://www.gstatic.com/recaptcha/',
    'https://www.gstatic.cn/recaptcha/',
    // Allow "unsafe-eval" for debugging purpose in non-production environment
    ...conditionalArray(!isProduction && "'unsafe-eval'"),
  ];

  const experienceConnectSource = [
    "'self'",
    gsiOrigin,
    tenantEndpointOrigin,
    // Allow reCAPTCHA API calls
    'https://www.google.com/recaptcha/',
    'https://recaptcha.net/recaptcha/',
    'https://www.gstatic.com/recaptcha/',
    'https://www.gstatic.cn/recaptcha/',
    ...customTenantConnectSourceAllowlist,
    ...developmentOrigins,
  ];

  const getExperienceSecurityHeaderSettings = (customUiCsp: CustomUiCsp = {}) => {
    // @ts-expect-error: helmet typings has lots of {A?: T, B?: never} | {A?: never, B?: T} options definitions. Optional settings type can not inferred correctly.
    const settings: HelmetOptions = {
      ...basicSecurityHeaderSettings,
      // Guarded by CSP header below
      frameguard: false,
      // Allow being loaded by console preview iframe
      crossOriginResourcePolicy: {
        policy: 'cross-origin',
      },
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'upgrade-insecure-requests': null,
          imgSrc: ["'self'", 'data:', 'https:'],
          scriptSrc: appendCustomSources(experienceScriptSource, customUiCsp.scriptSrc),
          scriptSrcAttr: ["'unsafe-inline'"],
          connectSrc: appendCustomSources(experienceConnectSource, customUiCsp.connectSrc),
          // WARNING (high risk): Need to allow self-hosted terms of use page loaded in an iframe
          frameSrc: ["'self'", 'https:', gsiOrigin],
          // Allow being loaded by console preview iframe
          frameAncestors: ["'self'", ...adminOrigins],
          defaultSrc: ["'self'", gsiOrigin],
        },
      },
    };

    return settings;
  };
  const defaultExperienceSecurityHeaderSettings = getExperienceSecurityHeaderSettings();

  // @ts-expect-error: helmet typings has lots of {A?: T, B?: never} | {A?: never, B?: T} options definitions. Optional settings type can not inferred correctly.
  const accountCenterSecurityHeaderSettings: HelmetOptions = {
    ...basicSecurityHeaderSettings,
    // Guarded by CSP header below
    frameguard: false,
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'upgrade-insecure-requests': null,
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: [
          "'self'",
          // Some of our users may use the Cloudflare Web Analytics service. We need to allow it to load its scripts.
          'https://static.cloudflareinsights.com/',
          ...conditionalArray(!isProduction && ["'unsafe-eval'"]),
        ],
        connectSrc: ["'self'", tenantEndpointOrigin, ...developmentOrigins],
        frameSrc: ["'self'"],
      },
    },
  };

  // @ts-expect-error: helmet typings has lots of {A?: T, B?: never} | {A?: never, B?: T} options definitions. Optional settings type can not inferred correctly.
  const consoleSecurityHeaderSettings: HelmetOptions = {
    ...basicSecurityHeaderSettings,
    // Guarded by CSP header below
    frameguard: false,
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'upgrade-insecure-requests': null,
        imgSrc: ["'self'", 'data:', 'https:'],
        // Allow "unsafe-eval" and "unsafe-inline" for debugging purpose in non-production environment
        scriptSrc: [
          "'self'",
          ...conditionalArray(!isProduction && ["'unsafe-eval'", "'unsafe-inline'"]),
          ...cdnSources,
        ],
        connectSrc: [
          "'self'",
          logtoOrigin,
          ...adminOrigins,
          ...coreOrigins,
          ...ossSurveyOrigins,
          ...developmentOrigins,
        ],
        frameSrc: ["'self'", ...adminOrigins, ...coreOrigins],
      },
    },
  };

  return {
    basicSecurityHeaderSettings,
    consoleSecurityHeaderSettings,
    accountCenterSecurityHeaderSettings,
    defaultExperienceSecurityHeaderSettings,
    getExperienceSecurityHeaderSettings,
  };
};

export const koaExperienceSecurityHeaders = <StateT, ContextT, ResponseBodyT>(
  tenantId: string,
  queries: Queries,
  mountedApps: string[] = []
): MiddlewareType<StateT, ContextT, ResponseBodyT> => {
  const { defaultExperienceSecurityHeaderSettings, getExperienceSecurityHeaderSettings } =
    createSecurityHeaderSettings(tenantId);

  return async (ctx, next) => {
    if (mountedApps.some((app) => app !== '' && ctx.request.path.startsWith(`/${app}`))) {
      return next();
    }

    const { req, res } = ctx;
    const { customUiAssets, customUiCsp } =
      await queries.signInExperiences.findDefaultSignInExperience();

    await helmetPromise(
      customUiAssets
        ? getExperienceSecurityHeaderSettings(customUiCsp)
        : defaultExperienceSecurityHeaderSettings,
      req,
      res
    );

    return next();
  };
};

export default function koaSecurityHeaders<StateT, ContextT, ResponseBodyT>(
  mountedApps: string[],
  tenantId: string
): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  const {
    basicSecurityHeaderSettings,
    consoleSecurityHeaderSettings,
    accountCenterSecurityHeaderSettings,
    defaultExperienceSecurityHeaderSettings,
  } = createSecurityHeaderSettings(tenantId);

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

    if (requestPath.startsWith(`/${UserApps.AccountCenter}`)) {
      await helmetPromise(accountCenterSecurityHeaderSettings, req, res);

      return next();
    }

    // Route has been handled by one of the other mounted apps
    if (mountedApps.some((app) => app !== '' && requestPath.startsWith(`/${app}`))) {
      await helmetPromise(basicSecurityHeaderSettings, req, res);

      return next();
    }

    // Experience
    await helmetPromise(defaultExperienceSecurityHeaderSettings, req, res);

    return next();
  };
}
