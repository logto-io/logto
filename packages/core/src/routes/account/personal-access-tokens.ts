import { UserScope } from '@logto/core-kit';
import {
  AccountCenterControlValue,
  type AccountCenterFieldControl,
  accountCreatedPersonalAccessTokenResponseGuard,
  accountPersonalAccessTokenResponseGuard,
} from '@logto/schemas';
import { generateStandardSecret } from '@logto/shared';
import { pick } from '@silverhand/essentials';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import { assertFirstPartyClient } from '#src/utils/assert-first-party-client.js';
import assertThat from '#src/utils/assert-that.js';

import { type UserRouter, type RouterInitArgs } from '../types.js';

import { accountApiPrefix } from './constants.js';

/** The maximum number of unexpired personal access tokens a user can own via self-service. */
const maxActivePersonalAccessTokens = 20;
/** The maximum lifetime of a personal access token created via self-service, in days. */
const maxPersonalAccessTokenLifetimeDays = 365;

const dayInMs = 24 * 60 * 60 * 1000;
const tokenNameGuard = z.string().min(1).max(256);

const assertFieldAndScope = (
  { personalAccessToken }: AccountCenterFieldControl,
  scopes: Set<string>,
  access: AccountCenterControlValue.ReadOnly | AccountCenterControlValue.Edit
) => {
  const isAllowed =
    access === AccountCenterControlValue.ReadOnly
      ? personalAccessToken === AccountCenterControlValue.ReadOnly ||
        personalAccessToken === AccountCenterControlValue.Edit
      : personalAccessToken === AccountCenterControlValue.Edit;

  assertThat(
    isAllowed,
    access === AccountCenterControlValue.ReadOnly
      ? 'account_center.field_not_enabled'
      : 'account_center.field_not_editable'
  );
  assertThat(
    scopes.has(UserScope.PersonalAccessTokens),
    new RequestError({ code: 'auth.unauthorized', status: 401 })
  );
};

const assertIdentityVerified = (identityVerified?: boolean) => {
  assertThat(
    identityVerified,
    new RequestError({ code: 'verification_record.permission_denied', status: 401 })
  );
};

export default function accountPersonalAccessTokenRoutes<T extends UserRouter>(
  ...[router, { queries }]: RouterInitArgs<T>
) {
  // DEV: Self-service personal access tokens
  if (!EnvSet.values.isDevFeaturesEnabled) {
    return;
  }

  const { personalAccessTokens } = queries;
  const pathname = `${accountApiPrefix}/personal-access-tokens`;

  router.get(
    pathname,
    koaGuard({
      response: accountPersonalAccessTokenResponseGuard.array(),
      status: [200, 400, 401],
    }),
    async (ctx, next) => {
      assertFieldAndScope(
        ctx.accountCenter.fields,
        ctx.auth.scopes,
        AccountCenterControlValue.ReadOnly
      );

      const tokens = await personalAccessTokens.getTokensByUserId(ctx.auth.id);
      ctx.body = tokens.map((token) => pick(token, 'name', 'createdAt', 'expiresAt'));

      return next();
    }
  );

  router.post(
    pathname,
    koaGuard({
      body: z.object({ name: tokenNameGuard, expiresAt: z.number().int() }),
      response: accountCreatedPersonalAccessTokenResponseGuard,
      status: [201, 400, 401, 403, 422],
    }),
    async (ctx, next) => {
      const { id: userId, identityVerified, clientId } = ctx.auth;
      const { name, expiresAt } = ctx.guard.body;

      assertFieldAndScope(
        ctx.accountCenter.fields,
        ctx.auth.scopes,
        AccountCenterControlValue.Edit
      );
      await assertFirstPartyClient(queries, clientId);
      assertIdentityVerified(identityVerified);

      const now = Date.now();
      assertThat(
        expiresAt > now && expiresAt <= now + maxPersonalAccessTokenLifetimeDays * dayInMs,
        new RequestError({
          code: 'user.personal_access_token_invalid_expiration',
          maxDays: maxPersonalAccessTokenLifetimeDays,
        })
      );

      const activeCount = await personalAccessTokens.countActiveByUserId(userId);
      assertThat(
        activeCount < maxActivePersonalAccessTokens,
        new RequestError({
          code: 'user.personal_access_token_limit_exceeded',
          status: 422,
          limit: maxActivePersonalAccessTokens,
        })
      );

      const token = await personalAccessTokens.insert({
        userId,
        name,
        expiresAt,
        value: `pat_${generateStandardSecret()}`,
      });

      ctx.body = pick(token, 'name', 'value', 'createdAt', 'expiresAt');
      ctx.status = 201;

      return next();
    }
  );

  router.patch(
    pathname,
    koaGuard({
      body: z.object({ currentName: tokenNameGuard, name: tokenNameGuard }),
      response: accountPersonalAccessTokenResponseGuard,
      status: [200, 400, 401, 403, 404, 422],
    }),
    async (ctx, next) => {
      const { id: userId, identityVerified, clientId } = ctx.auth;
      const { currentName, name } = ctx.guard.body;

      assertFieldAndScope(
        ctx.accountCenter.fields,
        ctx.auth.scopes,
        AccountCenterControlValue.Edit
      );
      await assertFirstPartyClient(queries, clientId);
      assertIdentityVerified(identityVerified);

      const token = await personalAccessTokens.updateName(userId, currentName, name);
      ctx.body = pick(token, 'name', 'createdAt', 'expiresAt');

      return next();
    }
  );

  // Use POST instead of DELETE to avoid issues with sending a body in DELETE requests.
  router.post(
    `${pathname}/delete`,
    koaGuard({
      body: z.object({ name: tokenNameGuard }),
      status: [204, 400, 401, 403, 404],
    }),
    async (ctx, next) => {
      const { id: userId, identityVerified, clientId } = ctx.auth;
      const { name } = ctx.guard.body;

      assertFieldAndScope(
        ctx.accountCenter.fields,
        ctx.auth.scopes,
        AccountCenterControlValue.Edit
      );
      await assertFirstPartyClient(queries, clientId);
      assertIdentityVerified(identityVerified);

      await personalAccessTokens.deleteByName(userId, name);
      ctx.status = 204;

      return next();
    }
  );
}
