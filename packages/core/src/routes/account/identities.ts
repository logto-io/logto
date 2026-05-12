import { appInsights } from '@logto/app-insights/node';
import { UserScope } from '@logto/core-kit';
import { VerificationType, AccountCenterControlValue } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import type { HookContextManager } from '#src/libraries/hook/context-manager.js';
import { buildVerificationRecordByIdAndType } from '#src/libraries/verification.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';
import { buildAppInsightsTelemetry } from '#src/utils/request.js';
import { assertCanDeleteSocialIdentity } from '#src/utils/user.js';

import type { UserRouter, RouterInitArgs } from '../types.js';

import { accountApiPrefix } from './constants.js';

export default function identitiesRoutes<T extends UserRouter>(
  ...[router, { queries, libraries }]: RouterInitArgs<T>
) {
  const {
    users: { updateUserById, findUserById, deleteUserIdentity },
    userSsoIdentities,
  } = queries;

  const {
    users: { checkIdentifierCollision },
    socials: { upsertSocialTokenSetSecret },
  } = libraries;

  type LinkSocialIdentityCoreParams = {
    userId: string;
    newIdentifierVerificationRecordId: string;
    allowReplace: boolean;
    appendDataHookContext: HookContextManager['appendDataHookContext'];
    getAppInsightsContext: () => Partial<Record<string, unknown>>;
  };

  /**
   * Core logic for linking a new social identity that is shared between the
   * POST (add) and PUT (replace) endpoints. Auth & permissions are checked
   * by the callers before invoking this function.
   */
  const linkSocialIdentityCore = async ({
    userId,
    newIdentifierVerificationRecordId,
    allowReplace,
    appendDataHookContext,
    getAppInsightsContext,
  }: LinkSocialIdentityCoreParams) => {
    const newVerificationRecord = await buildVerificationRecordByIdAndType({
      type: VerificationType.Social,
      id: newIdentifierVerificationRecordId,
      queries,
      libraries,
    });
    assertThat(newVerificationRecord.isVerified, 'verification_record.not_found');

    const {
      socialIdentity: { target, userInfo },
    } = await newVerificationRecord.toUserProfile();

    await checkIdentifierCollision({ identity: { target, id: userInfo.id } }, userId);

    const user = await findUserById(userId);

    const existingIdentity = user.identities[target];

    if (!allowReplace) {
      assertThat(!existingIdentity, 'user.identity_already_in_use');
    }

    const updatedUser = await updateUserById(userId, {
      identities: {
        ...user.identities,
        [target]: {
          userId: userInfo.id,
          details: userInfo,
        },
      },
    });

    appendDataHookContext('User.Data.Updated', { user: updatedUser });

    const tokenSetSecret = await newVerificationRecord.getTokenSetSecret();

    if (tokenSetSecret) {
      // Upsert token set secret should not break the normal social link flow
      await trySafe(
        async () => upsertSocialTokenSetSecret(user.id, tokenSetSecret),
        (error) => {
          void appInsights.trackException(error, getAppInsightsContext());
        }
      );
    } else if (allowReplace && existingIdentity && existingIdentity.userId !== userInfo.id) {
      // Delete token set secret should not break the normal social link flow
      await trySafe(
        async () => queries.secrets.deleteSocialTokenSetSecretByUserIdAndTarget(user.id, target),
        (error) => {
          void appInsights.trackException(error, getAppInsightsContext());
        }
      );
    }
  };

  router.post(
    `${accountApiPrefix}/identities`,
    koaGuard({
      body: z.object({
        newIdentifierVerificationRecordId: z.string(),
      }),
      status: [204, 400, 401, 422],
    }),
    async (ctx, next) => {
      const { id: userId, scopes, identityVerified } = ctx.auth;
      assertThat(
        identityVerified,
        new RequestError({ code: 'verification_record.permission_denied', status: 401 })
      );
      assertThat(
        ctx.accountCenter.fields.social === AccountCenterControlValue.Edit,
        'account_center.field_not_editable'
      );
      assertThat(
        scopes.has(UserScope.Identities),
        new RequestError({ code: 'auth.unauthorized', status: 401 })
      );

      await linkSocialIdentityCore({
        userId,
        newIdentifierVerificationRecordId: ctx.guard.body.newIdentifierVerificationRecordId,
        allowReplace: false,
        appendDataHookContext: ctx.appendDataHookContext,
        getAppInsightsContext: () => buildAppInsightsTelemetry(ctx),
      });
      ctx.status = 204;
      return next();
    }
  );

  router.put(
    `${accountApiPrefix}/identities`,
    koaGuard({
      body: z.object({
        newIdentifierVerificationRecordId: z.string(),
      }),
      status: [204, 400, 401, 422],
    }),
    async (ctx, next) => {
      const { id: userId, scopes, identityVerified } = ctx.auth;
      assertThat(
        identityVerified,
        new RequestError({ code: 'verification_record.permission_denied', status: 401 })
      );
      assertThat(
        ctx.accountCenter.fields.social === AccountCenterControlValue.Edit,
        'account_center.field_not_editable'
      );
      assertThat(
        scopes.has(UserScope.Identities),
        new RequestError({ code: 'auth.unauthorized', status: 401 })
      );

      await linkSocialIdentityCore({
        userId,
        newIdentifierVerificationRecordId: ctx.guard.body.newIdentifierVerificationRecordId,
        allowReplace: true,
        appendDataHookContext: ctx.appendDataHookContext,
        getAppInsightsContext: () => buildAppInsightsTelemetry(ctx),
      });
      ctx.status = 204;
      return next();
    }
  );

  router.delete(
    `${accountApiPrefix}/identities/:target`,
    koaGuard({
      params: z.object({ target: z.string() }),
      status: [204, 400, 401, 404],
    }),
    async (ctx, next) => {
      const { id: userId, scopes, identityVerified } = ctx.auth;
      assertThat(
        identityVerified,
        new RequestError({ code: 'verification_record.permission_denied', status: 401 })
      );
      const { target } = ctx.guard.params;
      const { fields } = ctx.accountCenter;
      assertThat(
        fields.social === AccountCenterControlValue.Edit,
        'account_center.field_not_editable'
      );

      assertThat(scopes.has(UserScope.Identities), 'auth.unauthorized');

      const [user, ssoIdentities] = await Promise.all([
        findUserById(userId),
        userSsoIdentities.findUserSsoIdentitiesByUserId(userId),
      ]);
      assertCanDeleteSocialIdentity(user, target, ssoIdentities.length);

      const updatedUser = await deleteUserIdentity(userId, target);

      ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });

      ctx.status = 204;

      return next();
    }
  );
}
