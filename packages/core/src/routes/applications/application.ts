import type { Role } from '@logto/schemas';
import {
  demoAppApplicationId,
  buildDemoAppDataForTenant,
  InternalRole,
  ApplicationType,
  applicationPatchGuard,
} from '@logto/schemas';
import { generateStandardId, generateStandardSecret } from '@logto/shared';
import { conditional } from '@silverhand/essentials';
import { boolean, object, string, z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import { buildOidcClientMetadata } from '#src/oidc/utils.js';
import assertThat from '#src/utils/assert-that.js';
import { parseSearchParamsForSearch } from '#src/utils/search.js';

import type { AuthedRouter, RouterInitArgs } from '../types.js';

import { applicationResponseGuard, applicationCreateGuard } from './types.js';

const includesInternalAdminRole = (roles: Readonly<Array<{ role: Role }>>) =>
  roles.some(({ role: { name } }) => name === InternalRole.Admin);

const applicationTypeGuard = z.nativeEnum(ApplicationType);

export default function applicationRoutes<T extends AuthedRouter>(
  ...[
    router,
    {
      queries,
      id: tenantId,
      libraries: { quota },
    },
  ]: RouterInitArgs<T>
) {
  const {
    deleteApplicationById,
    findApplicationById,
    insertApplication,
    updateApplicationById,
    countApplications,
    findApplications,
  } = queries.applications;
  const {
    findApplicationsRolesByApplicationId,
    insertApplicationsRoles,
    deleteApplicationRole,
    findApplicationsRolesByRoleId,
  } = queries.applicationsRoles;
  const { findRoleByRoleName } = queries.roles;

  router.get(
    '/applications',
    koaPagination({ isOptional: true }),
    koaGuard({
      query: object({
        /**
         * We treat the `types` query param as an array, but it will be parsed as string-typed
         * value if only one type is specified, manually convert to ApplicationType array.
         */
        types: applicationTypeGuard
          .array()
          .or(applicationTypeGuard.transform((type) => [type]))
          .optional(),
        excludeRoleId: string().optional(),
        // FIXME:  @simeng-li Remove this guard once Logto as IdP is ready
        ...conditional(
          EnvSet.values.isDevFeaturesEnabled && { isThirdParty: z.literal('true').optional() }
        ),
      }),
      response: z.array(applicationResponseGuard),
      status: 200,
    }),
    async (ctx, next) => {
      const { limit, offset, disabled: paginationDisabled } = ctx.pagination;
      const { searchParams } = ctx.URL;
      const { types, excludeRoleId } = ctx.guard.query;

      // FIXME:  @simeng-li Remove this guard once Logto as IdP is ready
      const isThirdParty = Boolean(ctx.guard.query.isThirdParty);

      // This will only parse the `search` query param, other params will be ignored. Please use query guard to validate them.
      const search = parseSearchParamsForSearch(searchParams);

      const excludeApplicationsRoles = excludeRoleId
        ? await findApplicationsRolesByRoleId(excludeRoleId)
        : [];

      const excludeApplicationIds = excludeApplicationsRoles.map(
        ({ applicationId }) => applicationId
      );

      if (paginationDisabled) {
        ctx.body = await findApplications({ search, excludeApplicationIds, types, isThirdParty });

        return next();
      }

      const [{ count }, applications] = await Promise.all([
        countApplications(search, excludeApplicationIds, isThirdParty, types),
        findApplications({
          search,
          excludeApplicationIds,
          types,
          isThirdParty,
          pagination: { limit, offset },
        }),
      ]);

      // Return totalCount to pagination middleware
      ctx.pagination.totalCount = count;
      ctx.body = applications;

      return next();
    }
  );

  router.post(
    '/applications',
    koaGuard({
      body: applicationCreateGuard,
      response: applicationResponseGuard,
      status: [200, 422],
    }),
    async (ctx, next) => {
      const { oidcClientMetadata, ...rest } = ctx.guard.body;

      await quota.guardKey(
        rest.type === ApplicationType.MachineToMachine
          ? 'machineToMachineLimit'
          : 'applicationsLimit'
      );

      // Third party applications must be traditional type
      if (rest.isThirdParty) {
        assertThat(
          rest.type === ApplicationType.Traditional,
          'application.invalid_third_party_application_type'
        );
      }

      ctx.body = await insertApplication({
        id: generateStandardId(),
        secret: generateStandardSecret(),
        oidcClientMetadata: buildOidcClientMetadata(oidcClientMetadata),
        ...rest,
      });

      return next();
    }
  );

  router.get(
    '/applications/:id',
    koaGuard({
      params: object({ id: string().min(1) }),
      response: applicationResponseGuard.merge(z.object({ isAdmin: z.boolean() })),
      status: [200, 404],
    }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;

      // Somethings console needs to display demo app info. Build a fixed one for it.
      if (id === demoAppApplicationId) {
        ctx.body = { ...buildDemoAppDataForTenant(tenantId), isAdmin: false };

        return next();
      }

      const application = await findApplicationById(id);
      const applicationsRoles = await findApplicationsRolesByApplicationId(id);

      ctx.body = {
        ...application,
        isAdmin: includesInternalAdminRole(applicationsRoles),
      };

      return next();
    }
  );

  router.patch(
    '/applications/:id',
    koaGuard({
      params: object({ id: string().min(1) }),
      body: applicationPatchGuard.deepPartial().merge(
        object({
          isAdmin: boolean().optional(),
        })
      ),
      response: applicationResponseGuard,
      status: [200, 404, 422, 500],
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body,
      } = ctx.guard;

      const { isAdmin, ...rest } = body;

      // User can enable the admin access of Machine-to-Machine apps by switching on a toggle on Admin Console.
      // Since those apps sit in the user tenant, we provide an internal role to apply the necessary scopes.
      // This role is NOT intended for user assignment.
      if (isAdmin !== undefined) {
        const [applicationsRoles, internalAdminRole] = await Promise.all([
          findApplicationsRolesByApplicationId(id),
          findRoleByRoleName(InternalRole.Admin),
        ]);
        const usedToBeAdmin = includesInternalAdminRole(applicationsRoles);

        assertThat(
          internalAdminRole,
          new RequestError({
            code: 'entity.not_exists',
            status: 500,
            data: { name: InternalRole.Admin },
          })
        );

        if (isAdmin && !usedToBeAdmin) {
          await insertApplicationsRoles([
            { id: generateStandardId(), applicationId: id, roleId: internalAdminRole.id },
          ]);
        } else if (!isAdmin && usedToBeAdmin) {
          await deleteApplicationRole(id, internalAdminRole.id);
        }
      }

      ctx.body = await (Object.keys(rest).length > 0
        ? updateApplicationById(id, rest)
        : findApplicationById(id));

      return next();
    }
  );

  router.delete(
    '/applications/:id',
    koaGuard({
      params: object({ id: string().min(1) }),
      response: z.undefined(),
      status: [204, 404],
    }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;
      // Note: will need delete cascade when application is joint with other tables
      await deleteApplicationById(id);
      ctx.status = 204;

      return next();
    }
  );
}
