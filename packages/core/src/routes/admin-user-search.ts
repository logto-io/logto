import { userInfoSelectFields, userProfileResponseGuard } from '@logto/schemas';
import { pick, tryThat } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import { parseSearchParamsForSearch } from '#src/utils/search.js';

import type { AuthedRouter, RouterInitArgs } from './types.js';

export default function adminUserSearchRoutes<T extends AuthedRouter>(
  ...[router, { queries }]: RouterInitArgs<T>
) {
  const {
    users: { findUsers, countUsers },
    usersRoles: { findUsersRolesByRoleId },
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
          const search = parseSearchParamsForSearch(searchParams);
          const excludeRoleId = searchParams.get('excludeRoleId');
          const excludeUsersRoles = excludeRoleId
            ? await findUsersRolesByRoleId(excludeRoleId)
            : [];
          const excludeUserIds = excludeUsersRoles.map(({ userId }) => userId);

          const [{ count }, users] = await Promise.all([
            countUsers(search, excludeUserIds),
            findUsers(limit, offset, search, excludeUserIds),
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
