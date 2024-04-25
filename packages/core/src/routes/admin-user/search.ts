import {
  OrganizationUserRelations,
  UsersRoles,
  userInfoSelectFields,
  userProfileResponseGuard,
} from '@logto/schemas';
import { type Nullable, pick, tryThat } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import { type UserConditions } from '#src/queries/user.js';
import { parseSearchParamsForSearch } from '#src/utils/search.js';

import type { ManagementApiRouter, RouterInitArgs } from '../types.js';

const getQueryRelation = (
  excludeRoleId: Nullable<string>,
  excludeOrganizationId: Nullable<string>
): UserConditions['relation'] => {
  if (excludeRoleId) {
    return {
      table: UsersRoles.table,
      field: UsersRoles.fields.roleId,
      value: excludeRoleId,
      type: 'not exists',
    };
  }

  if (excludeOrganizationId) {
    return {
      table: OrganizationUserRelations.table,
      field: OrganizationUserRelations.fields.organizationId,
      value: excludeOrganizationId,
      type: 'not exists',
    };
  }

  return undefined;
};

export default function adminUserSearchRoutes<T extends ManagementApiRouter>(
  ...[router, { queries }]: RouterInitArgs<T>
) {
  const {
    users: { findUsers, countUsers },
  } = queries;

  router.get(
    '/users',
    koaPagination(),
    koaGuard({
      response: userProfileResponseGuard.array(),
      status: [200, 400],
    }),
    async (ctx, next) => {
      const { limit, offset } = ctx.pagination;
      const { searchParams } = ctx.request.URL;

      return tryThat(
        async () => {
          const excludeRoleId = searchParams.get('excludeRoleId');
          const excludeOrganizationId = searchParams.get('excludeOrganizationId');

          if (excludeRoleId && excludeOrganizationId) {
            throw new RequestError({
              code: 'request.invalid_input',
              status: 422,
              details:
                'Parameter `excludeRoleId` and `excludeOrganizationId` cannot be used at the same time.',
            });
          }

          const conditions: UserConditions = {
            search: parseSearchParamsForSearch(searchParams),
            relation: getQueryRelation(excludeRoleId, excludeOrganizationId),
          };

          const [{ count }, users] = await Promise.all([
            countUsers(conditions),
            findUsers(limit, offset, conditions),
          ]);

          ctx.pagination.totalCount = count;
          ctx.body = users.map((user) => pick(user, ...userInfoSelectFields));

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
}
