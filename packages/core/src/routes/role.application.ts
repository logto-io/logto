import { Applications } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { tryThat } from '@silverhand/essentials';
import { object, string } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import { parseSearchParamsForSearch } from '#src/utils/search.js';

import type { ManagementApiRouter, RouterInitArgs } from './types.js';

export default function roleApplicationRoutes<T extends ManagementApiRouter>(
  ...[router, { queries }]: RouterInitArgs<T>
) {
  const {
    roles: { findRoleById },
    applications: { countM2mApplicationsByIds, findM2mApplicationsByIds, findApplicationById },
    applicationsRoles: {
      findFirstApplicationsRolesByRoleIdAndApplicationIds,
      findApplicationsRolesByRoleId,
      insertApplicationsRoles,
      deleteApplicationRole,
    },
  } = queries;

  router.get(
    '/roles/:id/applications',
    koaPagination(),
    koaGuard({
      params: object({ id: string().min(1) }),
      response: Applications.guard.array(),
      status: [200, 204, 400, 404],
    }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;
      const { limit, offset } = ctx.pagination;
      const { searchParams } = ctx.request.URL;

      await findRoleById(id);

      return tryThat(
        async () => {
          const search = parseSearchParamsForSearch(searchParams);
          const applicationRoles = await findApplicationsRolesByRoleId(id);
          const applicationIds = applicationRoles.map(({ applicationId }) => applicationId);

          const [{ count }, applications] = await Promise.all([
            countM2mApplicationsByIds(search, applicationIds),
            findM2mApplicationsByIds(search, limit, offset, applicationIds),
          ]);

          ctx.pagination.totalCount = count;
          ctx.body = applications;

          return next();
        },
        (error) => {
          if (error instanceof TypeError) {
            throw new RequestError(
              { code: 'request.invalid_input', details: error.message },
              error
            );
          }
          throw error;
        }
      );
    }
  );

  router.post(
    '/roles/:id/applications',
    koaGuard({
      params: object({ id: string().min(1) }),
      body: object({ applicationIds: string().min(1).array().nonempty() }),
      status: [201, 404, 422],
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body: { applicationIds },
      } = ctx.guard;

      await findRoleById(id);
      const existingRecord = await findFirstApplicationsRolesByRoleIdAndApplicationIds(
        id,
        applicationIds
      );

      if (existingRecord) {
        throw new RequestError({
          code: 'role.application_exists',
          status: 422,
          userId: existingRecord.applicationId,
        });
      }

      await Promise.all(
        applicationIds.map(async (applicationId) => findApplicationById(applicationId))
      );
      await insertApplicationsRoles(
        applicationIds.map((applicationId) => ({
          id: generateStandardId(),
          roleId: id,
          applicationId,
        }))
      );
      ctx.status = 201;

      return next();
    }
  );

  router.delete(
    '/roles/:id/applications/:applicationId',
    koaGuard({
      params: object({ id: string().min(1), applicationId: string().min(1) }),
      status: [204, 404],
    }),
    async (ctx, next) => {
      const {
        params: { id, applicationId },
      } = ctx.guard;
      await deleteApplicationRole(applicationId, id);
      ctx.status = 204;

      return next();
    }
  );
}
