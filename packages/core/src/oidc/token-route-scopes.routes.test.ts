import { getProviderConfiguration } from '#src/oidc/oidc-provider-internals.js';
import { MockTenant } from '#src/test-utils/tenant.js';

import initOidc from './init.js';
import { consentAuthorizationRoutes, isConsentAuthorizationRoute } from './token-route-scopes.js';

describe('consentAuthorizationRoutes allowlist', () => {
  /**
   * Full `configuration.routes` keys defined by `oidc-provider`. Pinning this list ensures an
   * upstream `oidc-provider` upgrade cannot silently introduce a new route without an explicit
   * classification into consent/authorization vs. isolated token mode.
   */
  const pinnedConfigurationRouteKeys = [
    'authorization',
    'backchannel_authentication',
    'challenge',
    'code_verification',
    'credential',
    'device_authorization',
    'end_session',
    'introspection',
    'jwks',
    'pushed_authorization_request',
    'registration',
    'revocation',
    'token',
    'userinfo',
  ];

  /**
   * Complete set of `ctx.oidc.route` names mounted by `oidc-provider` (including sub-routes not
   * listed as top-level keys in `configuration.routes`, such as `resume`, `device_resume`,
   * `discovery`, `end_session_confirm`, `end_session_success`, dynamic registration, and dev
   * interaction routes).
   */
  const expectedConsentAuthRoutes = [
    'authorization',
    'code_verification',
    'device_resume',
    'resume',
  ];

  const expectedIsolatedRoutes = [
    // Routes that invoke `getResourceServerInfo` via `checkResource` or token grants:
    'token',
    // `pushed_authorization_request` (enabled by default) and `device_authorization` also call
    // `getResourceServerInfo` via `checkResource`, solely to validate resource indicators without
    // persisting resource scopes — falling into isolated mode there is harmless.
    'pushed_authorization_request',
    'device_authorization',
    'backchannel_authentication',
    // Remaining oidc-provider endpoints (fail closed into isolated mode by default):
    'abort',
    'challenge',
    'client',
    'client_delete',
    'client_update',
    'credential',
    'discovery',
    'end_session',
    'end_session_confirm',
    'end_session_success',
    'interaction',
    'introspection',
    'jwks',
    'openid_credential_issuer',
    'registration',
    'revocation',
    'submit',
    'userinfo',
  ];

  it('should pin the full oidc-provider configuration.routes list', () => {
    const tenant = new MockTenant();
    const provider = initOidc(
      tenant.id,
      tenant.envSet,
      tenant.queries,
      tenant.libraries,
      tenant.logtoConfigs,
      tenant.subscription
    );
    const { routes } = getProviderConfiguration(provider);

    expect(Object.keys(routes).slice().sort()).toEqual(pinnedConfigurationRouteKeys);

    // Every configuration route key must be accounted for in either the allowlist or isolated set.
    const classifiedRoutes = new Set([...expectedConsentAuthRoutes, ...expectedIsolatedRoutes]);
    for (const route of Object.keys(routes)) {
      expect(classifiedRoutes.has(route)).toBe(true);
    }

    // Verify the active mounted routes (including sub-routes like `resume` and `device_resume`)
    // exist on the provider router.
    const activeMountedRoutes = [
      'authorization',
      'resume',
      'code_verification',
      'device_resume',
      'pushed_authorization_request',
      'device_authorization',
      'token',
      'userinfo',
      'jwks',
      'discovery',
      'revocation',
      'introspection',
      'end_session',
      'end_session_confirm',
      'end_session_success',
    ];
    // `Provider#pathFor` is a runtime method on oidc-provider missing from `@types/oidc-provider`.
    const pathFor: unknown = Reflect.get(provider, 'pathFor');
    expect(typeof pathFor).toBe('function');
    for (const route of activeMountedRoutes) {
      expect(() =>
        (pathFor as (name: string, options?: Record<string, string>) => string).call(
          provider,
          route,
          { uid: 'uid' }
        )
      ).not.toThrow();
    }
  });

  it('should allow only the four consent/authorization routes and fail closed for all others', () => {
    expect([...consentAuthorizationRoutes].slice().sort()).toEqual(expectedConsentAuthRoutes);

    for (const route of expectedConsentAuthRoutes) {
      expect(isConsentAuthorizationRoute(route)).toBe(true);
    }

    for (const route of expectedIsolatedRoutes) {
      expect(isConsentAuthorizationRoute(route)).toBe(false);
    }

    expect(isConsentAuthorizationRoute()).toBe(false);
    expect(isConsentAuthorizationRoute('')).toBe(false);
    expect(isConsentAuthorizationRoute('unknown_future_route')).toBe(false);
  });
});
