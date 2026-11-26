import { ManagementApiScope, PredefinedScope } from '@logto/schemas';
import { has } from '@silverhand/essentials';
import type { MiddlewareType } from 'koa';
import type Router from 'koa-router';
import type { IMiddleware } from 'koa-router';

import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';

import { type WithAuthContext } from './koa-auth/index.js';

/** Scope identifier accepted in Management API route permission policies. */
type ManagementApiScopeName = ManagementApiScope | PredefinedScope.All;

/**
 * A single alternative within an `anyOf` policy: either a single scope or a non-empty AND tuple
 * of scopes that must all be present on the token.
 */
type ManagementApiPermissionAlternative =
  | ManagementApiScopeName
  | readonly [ManagementApiScopeName, ...ManagementApiScopeName[]];

/**
 * Static permission policy declared on a Management API route.
 *
 * - A single scope (e.g. `ManagementApiScope.ReadUsers`)
 * - An `anyOf` (OR) object where each alternative is a single scope or an AND tuple, allowing
 *   narrower scopes to be introduced in later phases without breaking existing callers.
 */
export type ManagementApiPermissionPolicy =
  | ManagementApiScopeName
  | Readonly<{
      anyOf: readonly [ManagementApiPermissionAlternative, ...ManagementApiPermissionAlternative[]];
    }>;

type WithManagementApiPermissionPolicy<Type> = Type & {
  policy: ManagementApiPermissionPolicy;
};

const knownManagementApiScopes: ReadonlySet<string> = new Set<string>([
  PredefinedScope.All,
  ...Object.values<string>(ManagementApiScope),
]);

/** Returns whether `scope` is a recognized built-in Management API scope (including `all`). */
export const isKnownManagementApiScope = (scope: string): scope is ManagementApiScopeName =>
  knownManagementApiScopes.has(scope);

/**
 * Normalizes a policy into disjunctive normal form (OR of AND-tuples) so runtime evaluation,
 * OpenAPI generation, and CI route-stack validation share one canonical representation.
 */
export const normalizeManagementApiPermissionPolicy = (
  policy: ManagementApiPermissionPolicy
): ReadonlyArray<readonly ManagementApiScopeName[]> => {
  if (typeof policy === 'string') {
    return [[policy]];
  }

  return policy.anyOf.map((alternative) =>
    typeof alternative === 'string' ? [alternative] : alternative
  );
};

/** Returns all scope names referenced by a permission policy. */
export const extractPolicyScopes = (
  policy: ManagementApiPermissionPolicy
): ManagementApiScopeName[] =>
  normalizeManagementApiPermissionPolicy(policy).flatMap((group) => [...group]);

/**
 * Checks whether `auth.scopes` satisfies `policy`.
 * A token carrying `PredefinedScope.All` (`all`) satisfies every Management API policy.
 */
export const hasManagementApiPermission = (
  auth: WithAuthContext['auth'],
  policy: ManagementApiPermissionPolicy
): boolean => {
  if (auth.scopes.has(PredefinedScope.All)) {
    return true;
  }

  return normalizeManagementApiPermissionPolicy(policy).some((requiredScopes) =>
    requiredScopes.every((scope) => auth.scopes.has(scope))
  );
};

/**
 * Asserts that `auth.scopes` satisfies `policy`, throwing `403 auth.forbidden` otherwise.
 */
export const assertHasManagementApiPermission = (
  auth: WithAuthContext['auth'],
  policy: ManagementApiPermissionPolicy
): void => {
  assertThat(
    hasManagementApiPermission(auth, policy),
    new RequestError({ code: 'auth.forbidden', status: 403 })
  );
};

/**
 * Lightweight inline scope guard for cross-domain write switches inside route handlers
 * (e.g. `assertHasScope(ctx.auth, PredefinedScope.All)`).
 *
 * `koaGuard` exempts `auth.forbidden` from route `status` validation (matching `guard.*`), so
 * throwing from inside a handler cleanly returns HTTP `403`.
 */
export const assertHasScope = (
  auth: WithAuthContext['auth'],
  scope: ManagementApiScopeName
): void => {
  assertThat(
    auth.scopes.has(PredefinedScope.All) || auth.scopes.has(scope),
    new RequestError({ code: 'auth.forbidden', status: 403 })
  );
};

export const isManagementApiPermissionMiddleware = (
  function_: unknown
): function_ is WithManagementApiPermissionPolicy<IMiddleware> =>
  typeof function_ === 'function' &&
  function_.name === 'managementApiPermissionMiddleware' &&
  has(function_, 'policy');

const freezeAlternative = (
  alternative: ManagementApiPermissionAlternative
): ManagementApiPermissionAlternative => {
  if (typeof alternative === 'string') {
    return alternative;
  }

  const [first, ...rest] = alternative;
  return Object.freeze([first, ...rest] as const);
};

const freezePolicy = (policy: ManagementApiPermissionPolicy): ManagementApiPermissionPolicy => {
  if (typeof policy === 'string') {
    return policy;
  }

  const [first, ...rest] = policy.anyOf;
  return Object.freeze({
    anyOf: Object.freeze([
      freezeAlternative(first),
      ...rest.map((alternative) => freezeAlternative(alternative)),
    ] as const),
  });
};

/**
 * Static route-level Management API permission middleware.
 *
 * Place this middleware **first** on every scoped Management API route — before `koaPagination`,
 * `koaGuard`, `koaQuotaGuard`, and route handlers — so policy metadata is statically readable by
 * OpenAPI generation, CI route-stack checks, and the router-level enforcer in `routes/init.ts`.
 *
 * @remarks
 * **Unit testing guidelines (for both human authors and automated agents/bots):**
 *
 * 1. **Standalone route tests (`createRequester({ authedRoutes: singleRouteModule })`)**:
 *    Mounting a single route module directly bypasses `routes/init.ts`, so the router-level
 *    policy enforcer (`registerManagementApiPolicyEnforcer`) is **not** attached:
 *    - Routes **without** `koaManagementApiPermission` will NOT enforce the default-`all`
 *      fallback in standalone tests.
 *    - Routes **with** `koaManagementApiPermission` will still enforce their declared policy
 *      inside the route's own middleware stack, **after** any file-level `router.use(...)`
 *      middleware in that module.
 *    - Default `createRequester` mock auth includes `PredefinedScope.All`, so existing authorized
 *      unit tests continue passing without changes. To test scoped rejection or inline
 *      `assertHasScope` inside a standalone route test, override `auth.scopes` in the mock context.
 *
 * 2. **Full-stack authorization tests (default-`all` fallback & `router.use()` ordering)**:
 *    To verify that unauthorized tokens receive `403` **before** file-level `router.use(...)` DB
 *    lookups, that undeclared routes reject non-`all` tokens via default-`all`, or that `HEAD` /
 *    `OPTIONS` behavior is preserved, mount routes through `createRouters` (from `routes/init.ts`)
 *    or attach `registerManagementApiPolicyEnforcer(router)` and call its returned `finalize()`
 *    callback after mounting routes.
 */
export default function koaManagementApiPermission<
  StateT,
  ContextT extends { auth: WithAuthContext['auth'] },
  ResponseBodyT,
>(
  policy: ManagementApiPermissionPolicy
): WithManagementApiPermissionPolicy<MiddlewareType<StateT, ContextT, ResponseBodyT>> {
  const frozenPolicy = freezePolicy(policy);

  const managementApiPermissionMiddleware: WithManagementApiPermissionPolicy<
    MiddlewareType<StateT, ContextT, ResponseBodyT>
  > = async (ctx, next) => {
    assertHasManagementApiPermission(ctx.auth, frozenPolicy);
    return next();
  };

  // eslint-disable-next-line @silverhand/fp/no-mutation -- attach static policy metadata for OpenAPI, CI, and router-level enforcer
  managementApiPermissionMiddleware.policy = frozenPolicy;

  return managementApiPermissionMiddleware;
}

/**
 * Registers a router-level Management API policy enforcer immediately after `koaAuth` on
 * `managementRouter` and returns a `finalize()` callback to invoke once all routes (including
 * nested sub-routers such as `SchemaRouter` and `organizationRoutes`) have been mounted.
 *
 * Because `koa-router` flattens nested `router.use(subRouter.routes())` layers into the parent
 * `router.stack` and populates `ctx.matched` before executing any middleware, this enforcer
 * evaluates **both** declared `koaManagementApiPermission` policies and the default-`all`
 * fail-closed fallback **before** any file-level `router.use()`, `koaPagination`, `koaGuard`,
 * `koaQuotaGuard`, or DB lookup can execute.
 *
 * Unmatched requests (e.g. `404`, `405`, `OPTIONS`) pass through unchanged.
 */
export const registerManagementApiPolicyEnforcer = <
  StateT,
  ContextT extends { auth: WithAuthContext['auth'] },
>(
  router: Router<StateT, ContextT>
): (() => void) => {
  const managementLayers = new WeakSet<Router.Layer>();
  const routePolicyMap = new WeakMap<Router.Layer, ManagementApiPermissionPolicy>();

  router.use(async (ctx, next) => {
    const matchedRoutes = (ctx.matched ?? []).filter(
      (layer) => layer.methods.includes(ctx.method) && managementLayers.has(layer)
    );

    if (matchedRoutes.length === 0) {
      return next();
    }

    for (const layer of matchedRoutes) {
      const policy = routePolicyMap.get(layer);

      if (policy) {
        assertHasManagementApiPermission(ctx.auth, policy);
      } else {
        assertHasScope(ctx.auth, PredefinedScope.All);
      }
    }

    return next();
  });

  return () => {
    for (const layer of router.stack) {
      managementLayers.add(layer);

      if (layer.methods.length === 0) {
        continue;
      }

      const permissionMiddleware = layer.stack.find((middleware) =>
        isManagementApiPermissionMiddleware(middleware)
      );

      if (permissionMiddleware) {
        routePolicyMap.set(layer, permissionMiddleware.policy);
      }
    }
  };
};
