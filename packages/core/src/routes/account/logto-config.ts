import { UserScope } from '@logto/core-kit';
import {
  AccountCenterControlValue,
  userMfaDataGuard,
  userPasskeySignInDataGuard,
} from '@logto/schemas';
import { z } from 'zod';

import {
  buildUpdatedUserLogtoConfig,
  buildUserLogtoConfigResponse,
  userLogtoConfigResponseGuard,
} from '#src/libraries/user-logto-config.js';
import koaGuard from '#src/middleware/koa-guard.js';

import RequestError from '../../errors/RequestError/index.js';
import assertThat from '../../utils/assert-that.js';
import type { UserRouter, RouterInitArgs } from '../types.js';

import { accountApiPrefix } from './constants.js';

export default function logtoConfigRoutes<T extends UserRouter>(...args: RouterInitArgs<T>) {
  const [router, { queries }] = args;
  const {
    users: { updateUserById, findUserById },
  } = queries;

  router.get(
    `${accountApiPrefix}/logto-configs`,
    koaGuard({
      response: userLogtoConfigResponseGuard,
      status: [200, 400, 401],
    }),
    async (ctx, next) => {
      const { id: userId, scopes } = ctx.auth;

      assertThat(
        scopes.has(UserScope.Identities),
        new RequestError({ code: 'auth.unauthorized', status: 401 })
      );

      const { fields } = ctx.accountCenter;
      // MFA and passkey sign-in data are both exposed in logto_config.
      // Passkey is a WebAuthn MFA factor, so it reuses the MFA field access control.
      assertThat(
        fields.mfa === AccountCenterControlValue.Edit ||
          fields.mfa === AccountCenterControlValue.ReadOnly,
        new RequestError({ code: 'account_center.field_not_enabled', status: 400 })
      );

      const user = await findUserById(userId);
      ctx.body = buildUserLogtoConfigResponse(user.logtoConfig);

      return next();
    }
  );

  router.patch(
    `${accountApiPrefix}/logto-configs`,
    koaGuard({
      body: z.object({
        mfa: userMfaDataGuard.optional(),
        passkeySignIn: userPasskeySignInDataGuard.optional(),
      }),
      response: userLogtoConfigResponseGuard,
      status: [200, 400, 401],
    }),
    async (ctx, next) => {
      const { id: userId, scopes } = ctx.auth;
      assertThat(
        scopes.has(UserScope.Identities),
        new RequestError({ code: 'auth.unauthorized', status: 401 })
      );
      const { fields } = ctx.accountCenter;
      // MFA and passkey sign-in data are both exposed in logto_config.
      // Passkey is a WebAuthn MFA factor, so it reuses the MFA field access control.
      assertThat(
        fields.mfa === AccountCenterControlValue.Edit,
        new RequestError({ code: 'account_center.field_not_editable', status: 400 })
      );

      const user = await findUserById(userId);
      const updatedUser = await updateUserById(userId, {
        logtoConfig: buildUpdatedUserLogtoConfig(user, ctx.guard.body),
      });

      ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });
      ctx.body = buildUserLogtoConfigResponse(updatedUser.logtoConfig);

      return next();
    }
  );
}
