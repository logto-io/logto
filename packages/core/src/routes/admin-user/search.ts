import { OrganizationUserRelations, UsersRoles } from '@logto/schemas';
import { type Nullable, tryThat, yes } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import { type UserConditions } from '#src/queries/user.js';
import assertThat from '#src/utils/assert-that.js';
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

const customDataSearchHint =
  'Parameter `customData` must be a URL-encoded JSON object, e.g. `customData={"qq":114514}`. Nested parameters such as `customData.qq`, `customData[qq]`, and `mode.customData` are not supported.';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isFieldAccessor = (key: string, field: string) =>
  key === field || key.startsWith(`${field}.`) || key.startsWith(`${field}[`);

const isNestedCustomDataParameter = (key: string) =>
  (key !== 'customData' && isFieldAccessor(key, 'customData')) ||
  isFieldAccessor(key, 'mode.customData') ||
  isFieldAccessor(key, 'search.customData');

const hasEmptyContainer = (value: unknown): boolean => {
  if (Array.isArray(value)) {
    return value.length === 0 || value.some((item) => hasEmptyContainer(item));
  }

  if (isRecord(value)) {
    const values = Object.values(value);

    return values.length === 0 || values.some((item) => hasEmptyContainer(item));
  }

  return false;
};

const parseJson = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    throw new TypeError(`Parameter \`customData\` must be valid JSON. ${customDataSearchHint}`);
  }
};

const parseCustomDataParameter = (value: string): string => {
  const parsed = parseJson(value);

  assertThat(
    isRecord(parsed),
    new TypeError(`Parameter \`customData\` must be a JSON object. ${customDataSearchHint}`)
  );
  assertThat(
    Object.keys(parsed).length > 0,
    new TypeError(
      `Parameter \`customData\` must be a non-empty JSON object. ${customDataSearchHint}`
    )
  );
  assertThat(
    !hasEmptyContainer(parsed),
    new TypeError(
      `Parameter \`customData\` must not contain empty objects or arrays. ${customDataSearchHint}`
    )
  );

  // Return the original JSON text instead of re-serializing the parsed value, so numbers that
  // exceed the safe integer range keep their precision.
  return value;
};

/**
 * Parse the repeatable `customData` query parameter. Every value is a raw JSON object string used
 * for JSONB containment (`@>`); values are combined with OR, and the whole condition is combined
 * with all other user filters using AND.
 */
const parseCustomDataSearchParams = (searchParams: URLSearchParams) => {
  for (const key of searchParams.keys()) {
    assertThat(
      !isNestedCustomDataParameter(key),
      new TypeError(`Nested \`customData\` parameters are not supported. ${customDataSearchHint}`)
    );
  }

  const values = searchParams.getAll('customData');

  if (values.length === 0) {
    return;
  }

  return values.map((value) => parseCustomDataParameter(value));
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

          // Parse custom data first so that nested syntax like `mode.customData` gets the custom
          // data hint instead of a generic search mode error.
          const customDataSearchValues = parseCustomDataSearchParams(searchParams);

          const conditions: UserConditions = {
            search: parseSearchParamsForSearch(searchParams),
            identity: getIdentityCondition(searchParams),
            relation: getQueryRelation(excludeRoleId, excludeOrganizationId),
            customData: customDataSearchValues,
          };

          const [{ count }, users] = await Promise.all([
            countUsers(conditions),
            findUsers(limit, offset, conditions),
          ]);

          const includePasswordHash =
            yes(searchParams.get('includePasswordHash') ?? '') && !ctx.auth.isReadOnly;

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
