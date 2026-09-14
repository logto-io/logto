import { OrganizationUserRelations, UsersRoles } from '@logto/schemas';
import { type Nullable, tryThat, yes } from '@silverhand/essentials';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import { type UserConditions } from '#src/queries/user.js';
import { parseSearchParamsForSearch } from '#src/utils/search.js';

import {
  adminUserProfileResponseGuard,
  transpileAdminUserProfileResponse,
} from '../../utils/user.js';
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

const getIdentityCondition = (searchParams: URLSearchParams): UserConditions['identity'] => {
  const type = searchParams.get('identityType');
  const provider = searchParams.get('identityProvider');
  const identityId = searchParams.get('identityId');

  if (type === null && provider === null && identityId === null) {
    return undefined;
  }

  // DEV: Look up users by external social or enterprise SSO identity.
  if (!EnvSet.values.isDevFeaturesEnabled) {
    throw new TypeError('External identity user lookup is not enabled.');
  }

  if (!type || !provider || !identityId) {
    throw new TypeError(
      'Parameters `identityType`, `identityProvider`, and `identityId` must be provided together and must not be empty.'
    );
  }

  if (type !== 'social' && type !== 'sso') {
    throw new TypeError('Parameter `identityType` must be either `social` or `sso`.');
  }

  return { type, provider, identityId };
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
      response: adminUserProfileResponseGuard.array(),
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
              status: 400,
              details:
                'Parameter `excludeRoleId` and `excludeOrganizationId` cannot be used at the same time.',
            });
          }

          const conditions: UserConditions = {
            search: parseSearchParamsForSearch(searchParams),
            identity: getIdentityCondition(searchParams),
            relation: getQueryRelation(excludeRoleId, excludeOrganizationId),
          };

          const [{ count }, users] = await Promise.all([
            countUsers(conditions),
            findUsers(limit, offset, conditions),
          ]);

          const includePasswordHash = yes(searchParams.get('includePasswordHash') ?? '');

          ctx.pagination.totalCount = count;
          ctx.body = users.map((user) =>
            transpileAdminUserProfileResponse(user, { includePasswordHash })
          );

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
