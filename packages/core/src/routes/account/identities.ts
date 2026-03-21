import { appInsights } from '@logto/app-insights/node';
import { UserScope } from '@logto/core-kit';
import {
  VerificationType,
  AccountCenterControlValue,
  MfaFactor,
  SignInIdentifier,
  type SignIn,
  type User,
} from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { buildVerificationRecordByIdAndType } from '#src/libraries/verification.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';
import { buildAppInsightsTelemetry } from '#src/utils/request.js';

import type { UserRouter, RouterInitArgs } from '../types.js';

import { accountApiPrefix } from './constants.js';

const hasAvailablePassword = (user: User) => Boolean(user.passwordEncrypted);

export const hasPasskeySignInMethod = ({
  user,
  isPasskeySignInEnabled,
}: {
  user: User;
  isPasskeySignInEnabled: boolean;
}) =>
  isPasskeySignInEnabled &&
  user.mfaVerifications.some((verification) => verification.type === MfaFactor.WebAuthn);

export const hasEnterpriseSsoSignInMethod = ({
  ssoIdentityCount,
  isSingleSignOnEnabled,
}: {
  ssoIdentityCount: number;
  isSingleSignOnEnabled: boolean;
}) => isSingleSignOnEnabled && ssoIdentityCount > 0;

const hasRemainingSocialIdentity = ({
  user,
  socialSignInConnectorTargets,
  targetToRemove,
}: {
  user: User;
  socialSignInConnectorTargets: string[];
  targetToRemove: string;
}) =>
  Object.keys(user.identities).some(
    (target) => target !== targetToRemove && socialSignInConnectorTargets.includes(target)
  );

const hasRemainingIdentifierSignInMethod = (
  user: User,
  method: SignIn['methods'][number]
): boolean => {
  const canSignInWithPassword = Boolean(method.password && hasAvailablePassword(user));
  const canSignInWithVerificationCode = Boolean(method.verificationCode);
  const hasRemainingIdentifier = canSignInWithPassword || canSignInWithVerificationCode;

  switch (method.identifier) {
    case SignInIdentifier.Username: {
      return Boolean(user.username) && hasRemainingIdentifier;
    }
    case SignInIdentifier.Email: {
      return Boolean(user.primaryEmail) && hasRemainingIdentifier;
    }
    case SignInIdentifier.Phone: {
      return Boolean(user.primaryPhone) && hasRemainingIdentifier;
    }
  }
};

export const canRemoveSocialIdentity = ({
  user,
  signIn,
  socialSignInConnectorTargets,
  targetToRemove,
  hasPasskeySignIn,
  hasEnterpriseSsoSignIn,
}: {
  user: User;
  signIn: SignIn;
  socialSignInConnectorTargets: string[];
  targetToRemove: string;
  hasPasskeySignIn: boolean;
  hasEnterpriseSsoSignIn: boolean;
}) => {
  if (!socialSignInConnectorTargets.includes(targetToRemove)) {
    return true;
  }

  if (hasRemainingSocialIdentity({ user, socialSignInConnectorTargets, targetToRemove })) {
    return true;
  }

  if (hasPasskeySignIn || hasEnterpriseSsoSignIn) {
    return true;
  }

  return signIn.methods.some((method) => hasRemainingIdentifierSignInMethod(user, method));
};

export default function identitiesRoutes<T extends UserRouter>(
  ...[router, { queries, libraries }]: RouterInitArgs<T>
) {
  const {
    users: { updateUserById, findUserById, deleteUserIdentity },
    signInExperiences: { findDefaultSignInExperience },
  } = queries;

  const {
    users: { checkIdentifierCollision, findUserSsoIdentities },
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
            void appInsights.trackException(error, buildAppInsightsTelemetry(ctx));
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
      const [
        { signIn, socialSignInConnectorTargets, passkeySignIn, singleSignOnEnabled },
        ssoIdentities,
      ] = await Promise.all([findDefaultSignInExperience(), findUserSsoIdentities(userId)]);

      assertThat(
        user.identities[target],
        new RequestError({
          code: 'user.identity_not_exist',
          status: 404,
        })
      );
      assertThat(
        canRemoveSocialIdentity({
          user,
          signIn,
          socialSignInConnectorTargets,
          targetToRemove: target,
          hasPasskeySignIn: hasPasskeySignInMethod({
            user,
            isPasskeySignInEnabled: Boolean(passkeySignIn.enabled),
          }),
          hasEnterpriseSsoSignIn: hasEnterpriseSsoSignInMethod({
            ssoIdentityCount: ssoIdentities.length,
            isSingleSignOnEnabled: Boolean(singleSignOnEnabled),
          }),
        }),
        new RequestError({
          code: 'user.last_sign_in_method_required',
          status: 400,
        })
      );

      const updatedUser = await deleteUserIdentity(userId, target);

      ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });

      ctx.status = 204;

      return next();
    }
  );
}
