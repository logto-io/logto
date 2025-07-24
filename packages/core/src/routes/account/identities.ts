import { appInsights } from '@logto/app-insights/node';
import { UserScope } from '@logto/core-kit';
import { VerificationType, AccountCenterControlValue } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';

import RequestError from '../../errors/RequestError/index.js';
import { buildVerificationRecordByIdAndType } from '../../libraries/verification.js';
import assertThat from '../../utils/assert-that.js';
import type { UserRouter, RouterInitArgs } from '../types.js';

import { accountApiPrefix } from './constants.js';

export default function identitiesRoutes<T extends UserRouter>(
  ...[router, { queries, libraries }]: RouterInitArgs<T>
) {
  const {
    users: { updateUserById, findUserById, deleteUserIdentity },
  } = queries;

  const {
    users: { checkIdentifierCollision },
    socials: { upsertSocialTokenSetSecret },
  } = libraries;

  router.post(
    `${accountApiPrefix}/identities`,
    koaGuard({
      body: z.object({
        newIdentifierVerificationRecordId: z.string(),
      }),
      status: [204, 400, 401],
    }),
    async (ctx, next) => {
      const { id: userId, scopes, identityVerified } = ctx.auth;
      assertThat(
        identityVerified,
        new RequestError({ code: 'verification_record.permission_denied', status: 401 })
      );
      const { newIdentifierVerificationRecordId } = ctx.guard.body;
      const { fields } = ctx.accountCenter;
      assertThat(
        fields.social === AccountCenterControlValue.Edit,
        'account_center.field_not_editable'
      );

      assertThat(scopes.has(UserScope.Identities), 'auth.unauthorized');

      // Check new identifier
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

      assertThat(!user.identities[target], 'user.identity_already_in_use');

      const updatedUser = await updateUserById(userId, {
        identities: {
          ...user.identities,
          [target]: {
            userId: userInfo.id,
            details: userInfo,
          },
        },
      });

      ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });

      const tokenSetSecret = await newVerificationRecord.getTokenSetSecret();

      if (tokenSetSecret) {
        // Upsert token set secret should not break the normal social link flow
        await trySafe(
          async () => upsertSocialTokenSetSecret(user.id, tokenSetSecret),
          (error) => {
            void appInsights.trackException(error);
          }
        );
      }

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

      const user = await findUserById(userId);

      assertThat(
        user.identities[target],
        new RequestError({
          code: 'user.identity_not_exist',
          status: 404,
        })
      );

      const updatedUser = await deleteUserIdentity(userId, target);

      ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });

      ctx.status = 204;

      return next();
    }
  );
}
