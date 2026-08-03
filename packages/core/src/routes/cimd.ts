import { UserScope } from '@logto/core-kit';
import {
  ApplicationUserConsentScopeType,
  applicationUserConsentScopesResponseGuard,
} from '@logto/schemas';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';

import type { ManagementApiRouter, RouterInitArgs } from './types.js';

/**
 * Routes for the tenant-wide permission ceiling of OAuth Client ID Metadata Document (CIMD)
 * clients. Unlike third-party applications, CIMD clients are unregistered and have no per-client
 * record to attach consent scopes to, so the ceiling is tenant-level.
 */
export default function cimdRoutes<T extends ManagementApiRouter>(
  ...[router, tenant]: RouterInitArgs<T>
) {
  if (!EnvSet.values.isDevFeaturesEnabled) {
    return;
  }

  const { queries, libraries } = tenant;
  const {
    resources: { findResourceById },
  } = queries;
  const {
    applications: { validateApplicationUserConsentScopes },
  } = libraries;

  const groupScopesByResource = async (scopes: ReadonlyArray<{ resourceId: string }>) => {
    const resourceIds = [...new Set(scopes.map(({ resourceId }) => resourceId))];
    return Promise.all(
      resourceIds.map(async (resourceId) => ({
        resource: await findResourceById(resourceId),
        scopes: scopes.filter((scope) => scope.resourceId === resourceId),
      }))
    );
  };

  // DEV: CIMD (client ID metadata document) support
  router.get(
    '/cimd/user-consent-scopes',
    koaGuard({
      response: applicationUserConsentScopesResponseGuard,
      status: [200],
    }),
    async (ctx, next) => {
      const [userScopes, resourceScopes, organizationScopes, organizationResourceScopes] =
        await Promise.all([
          queries.cimd.userScopes.findAll(),
          queries.cimd.resourceScopes.findAll(),
          queries.cimd.organizationScopes.findAll(),
          queries.cimd.organizationResourceScopes.findAll(),
        ]);

      // The queries return full data schemas; the response guard filters out unneeded fields.
      ctx.body = {
        userScopes,
        organizationScopes: [...organizationScopes],
        resourceScopes: await groupScopesByResource(resourceScopes),
        organizationResourceScopes: await groupScopesByResource(organizationResourceScopes),
      };

      return next();
    }
  );

  // DEV: CIMD (client ID metadata document) support
  router.post(
    '/cimd/user-consent-scopes',
    koaGuard({
      body: z.object({
        organizationScopes: z.string().array().optional(),
        resourceScopes: z.string().array().optional(),
        organizationResourceScopes: z.string().array().optional(),
        userScopes: z.nativeEnum(UserScope).array().optional(),
      }),
      status: [201, 422],
    }),
    async (ctx, next) => {
      const { body } = ctx.guard;
      const { organizationScopes, resourceScopes, organizationResourceScopes, userScopes } = body;

      // The shared third-party application validation also rejects Management API scopes.
      await validateApplicationUserConsentScopes(body, tenant.id);

      if (userScopes) {
        await queries.cimd.userScopes.insert(userScopes);
      }

      if (resourceScopes) {
        await queries.cimd.resourceScopes.insert(resourceScopes);
      }

      if (organizationScopes) {
        await queries.cimd.organizationScopes.insert(organizationScopes);
      }

      if (organizationResourceScopes) {
        await queries.cimd.organizationResourceScopes.insert(organizationResourceScopes);
      }

      ctx.status = 201;

      return next();
    }
  );

  // DEV: CIMD (client ID metadata document) support
  router.delete(
    '/cimd/user-consent-scopes/:scopeType/:scopeId',
    koaGuard({
      params: z.object({
        scopeType: z.nativeEnum(ApplicationUserConsentScopeType),
        scopeId: z.string(),
      }),
      status: [204, 404],
    }),
    async (ctx, next) => {
      const {
        params: { scopeType, scopeId },
      } = ctx.guard;

      switch (scopeType) {
        case ApplicationUserConsentScopeType.UserScopes: {
          const userScope = z.nativeEnum(UserScope).safeParse(scopeId);
          // An unknown scope name cannot exist in the ceiling table, so it is the same 404 as
          // deleting a missing row rather than a guard-level 400.
          assertThat(
            userScope.success,
            new RequestError({ code: 'entity.not_found', status: 404 })
          );
          await queries.cimd.userScopes.delete(userScope.data);
          break;
        }
        case ApplicationUserConsentScopeType.ResourceScopes: {
          await queries.cimd.resourceScopes.delete(scopeId);
          break;
        }
        case ApplicationUserConsentScopeType.OrganizationScopes: {
          await queries.cimd.organizationScopes.delete(scopeId);
          break;
        }
        case ApplicationUserConsentScopeType.OrganizationResourceScopes: {
          await queries.cimd.organizationResourceScopes.delete(scopeId);
          break;
        }
      }

      ctx.status = 204;

      return next();
    }
  );
}
