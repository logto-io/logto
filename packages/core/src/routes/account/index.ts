import { usernameRegEx, UserScope } from '@logto/core-kit';
import {
  userProfileResponseGuard,
  userProfileGuard,
  AccountCenterControlValue,
  SignInIdentifier,
  userMfaDataGuard,
  userMfaDataKey,
  jsonObjectGuard,
} from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';

import RequestError from '../../errors/RequestError/index.js';
import { encryptUserPassword } from '../../libraries/user.utils.js';
import assertThat from '../../utils/assert-that.js';
import { PasswordValidator } from '../experience/classes/libraries/password-validator.js';
import type { UserRouter, RouterInitArgs } from '../types.js';

import { accountApiPrefix } from './constants.js';
import emailAndPhoneRoutes from './email-and-phone.js';
import identitiesRoutes from './identities.js';
import logtoConfigRoutes from './logto-config.js';
import mfaVerificationsRoutes from './mfa-verifications.js';
import koaAccountCenter from './middlewares/koa-account-center.js';
import thirdPartyTokensRoutes from './third-party-tokens.js';
import { getAccountCenterFilteredProfile, getScopedProfile } from './utils/get-scoped-profile.js';

export default function accountRoutes<T extends UserRouter>(...args: RouterInitArgs<T>) {
  const [router, { queries, libraries }] = args;
  const {
    users: { updateUserById, findUserById },
    signInExperiences: { findDefaultSignInExperience },
  } = queries;

  const {
    users: { checkIdentifierCollision },
  } = libraries;

  router.use(koaAccountCenter(queries));

  router.get(
    `${accountApiPrefix}`,
    koaGuard({
      response: userProfileResponseGuard.partial(),
      status: [200],
    }),
    async (ctx, next) => {
      const { id: userId, scopes } = ctx.auth;
      const profile = await getScopedProfile(queries, libraries, scopes, userId);
      ctx.body = getAccountCenterFilteredProfile(profile, ctx.accountCenter);
      return next();
    }
  );

  router.patch(
    `${accountApiPrefix}`,
    koaGuard({
      body: z.object({
        name: z.string().nullable().optional(),
        avatar: z.string().url().nullable().optional(),
        username: z.string().regex(usernameRegEx).nullable().optional(),
        customData: jsonObjectGuard.optional(),
      }),
      response: userProfileResponseGuard.partial(),
      status: [200, 400, 422],
    }),
    async (ctx, next) => {
      const { id: userId, scopes } = ctx.auth;
      const { body } = ctx.guard;
      const { name, avatar, username, customData } = body;
      const { fields } = ctx.accountCenter;

      assertThat(
        name === undefined || fields.name === AccountCenterControlValue.Edit,
        'account_center.field_not_editable'
      );
      assertThat(
        avatar === undefined || fields.avatar === AccountCenterControlValue.Edit,
        'account_center.field_not_editable'
      );
      assertThat(
        username === undefined || fields.username === AccountCenterControlValue.Edit,
        'account_center.field_not_editable'
      );
      assertThat(
        customData === undefined || fields.customData === AccountCenterControlValue.Edit,
        'account_center.field_not_editable'
      );
      assertThat(scopes.has(UserScope.Profile), 'auth.unauthorized');
      if (customData !== undefined) {
        assertThat(scopes.has(UserScope.CustomData), 'auth.unauthorized');
      }

      if (username !== undefined) {
        if (username === null) {
          const { signUp } = await findDefaultSignInExperience();
          assertThat(
            !signUp.identifiers.includes(SignInIdentifier.Username),
            'user.username_required'
          );
        } else {
          await checkIdentifierCollision({ username }, userId);
        }
      }

      const updatedUser = await updateUserById(
        userId,
        {
          name,
          avatar,
          username,
          ...conditional(customData !== undefined && { customData }),
        },
        'replace'
      );

      ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });

      const profile = await getScopedProfile(queries, libraries, scopes, userId);
      ctx.body = getAccountCenterFilteredProfile(profile, ctx.accountCenter);

      return next();
    }
  );

  router.patch(
    `${accountApiPrefix}/profile`,
    koaGuard({
      body: userProfileGuard,
      response: userProfileGuard,
      status: [200, 400],
    }),
    async (ctx, next) => {
      const { id: userId, scopes } = ctx.auth;
      const { body } = ctx.guard;
      const { fields } = ctx.accountCenter;

      assertThat(
        fields.profile === AccountCenterControlValue.Edit,
        'account_center.field_not_editable'
      );
      assertThat(scopes.has(UserScope.Profile), 'auth.unauthorized');

      if (body.address !== undefined) {
        assertThat(scopes.has(UserScope.Address), 'auth.unauthorized');
      }

      const updatedUser = await updateUserById(userId, {
        profile: body,
      });

      ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });

      const profile = await getScopedProfile(queries, libraries, scopes, userId);
      ctx.body = profile.profile;

      return next();
    }
  );

  router.post(
    `${accountApiPrefix}/password`,
    koaGuard({
      body: z.object({ password: z.string().min(1) }),
      status: [204, 400, 401, 422],
    }),
    async (ctx, next) => {
      const { id: userId, identityVerified } = ctx.auth;
      assertThat(
        identityVerified,
        new RequestError({ code: 'verification_record.permission_denied', status: 401 })
      );
      const { password } = ctx.guard.body;
      const { fields } = ctx.accountCenter;
      assertThat(
        fields.password === AccountCenterControlValue.Edit,
        'account_center.field_not_editable'
      );

      const user = await findUserById(userId);
      const signInExperience = await findDefaultSignInExperience();
      const passwordPolicyChecker = new PasswordValidator(signInExperience.passwordPolicy, user);
      await passwordPolicyChecker.validatePassword(password, user);

      const { passwordEncrypted, passwordEncryptionMethod } = await encryptUserPassword(password);
      const updatedUser = await updateUserById(userId, {
        passwordEncrypted,
        passwordEncryptionMethod,
      });

      ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });

      ctx.status = 204;

      return next();
    }
  );

  router.get(
    `${accountApiPrefix}/mfa-settings`,
    koaGuard({
      response: z.object({
        skipMfaOnSignIn: z.boolean(),
      }),
      status: [200, 400, 401],
    }),
    async (ctx, next) => {
      const { id: userId, scopes } = ctx.auth;

      assertThat(
        scopes.has(UserScope.Identities),
        new RequestError({ code: 'auth.unauthorized', status: 401 })
      );
      const { fields } = ctx.accountCenter;
      assertThat(
        fields.mfa === AccountCenterControlValue.Edit ||
          fields.mfa === AccountCenterControlValue.ReadOnly,
        new RequestError({ code: 'account_center.field_not_enabled', status: 400 })
      );

      const user = await findUserById(userId);
      const mfaData = userMfaDataGuard.safeParse(user.logtoConfig[userMfaDataKey]);
      const skipMfaOnSignIn = mfaData.success ? (mfaData.data.skipMfaOnSignIn ?? false) : false;

      ctx.body = { skipMfaOnSignIn };

      return next();
    }
  );

  router.patch(
    `${accountApiPrefix}/mfa-settings`,
    koaGuard({
      body: z.object({
        skipMfaOnSignIn: z.boolean(),
      }),
      response: z.object({
        skipMfaOnSignIn: z.boolean(),
      }),
      status: [200, 400, 401],
    }),
    async (ctx, next) => {
      const { id: userId, identityVerified, scopes } = ctx.auth;

      assertThat(
        identityVerified,
        new RequestError({ code: 'verification_record.permission_denied', status: 401 })
      );
      assertThat(
        scopes.has(UserScope.Identities),
        new RequestError({ code: 'auth.unauthorized', status: 401 })
      );
      const { skipMfaOnSignIn } = ctx.guard.body;
      const { fields } = ctx.accountCenter;
      assertThat(
        fields.mfa === AccountCenterControlValue.Edit,
        new RequestError({ code: 'account_center.field_not_editable', status: 400 })
      );

      const user = await findUserById(userId);
      const existingMfaData = userMfaDataGuard.safeParse(user.logtoConfig[userMfaDataKey]);

      const updatedUser = await updateUserById(userId, {
        logtoConfig: {
          ...user.logtoConfig,
          [userMfaDataKey]: {
            ...(existingMfaData.success ? existingMfaData.data : {}),
            skipMfaOnSignIn,
          },
        },
      });

      ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });

      ctx.body = { skipMfaOnSignIn };

      return next();
    }
  );

  logtoConfigRoutes(...args);
  thirdPartyTokensRoutes(...args);
  emailAndPhoneRoutes(...args);
  identitiesRoutes(...args);
  mfaVerificationsRoutes(...args);
}
