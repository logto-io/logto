import { AccountCenterControlValue } from '@logto/schemas';
import { z } from 'zod';

import { encryptUserPassword } from '#src/libraries/user.utils.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';

import type { RouterInitArgs, UserRouter } from '../types.js';

import { accountApiPrefix } from './constants.js';

export default function passwordRoutes<T extends UserRouter>(...args: RouterInitArgs<T>) {
  const [router, { queries, libraries }] = args;
  const {
    users: { updateUserById, findUserById },
  } = queries;

  const {
    users: { verifyUserPassword },
  } = libraries;

  // Get user profile with encrypted secret for password change
  router.get(
    `${accountApiPrefix}/password/profile`,
    koaGuard({
      status: [200],
      response: z.object({
        hasPassword: z.boolean(),
        encryptedSecret: z.string().nullable(),
      }),
    }),
    async (ctx, next) => {
      const { id: userId } = ctx.auth;
      const user = await findUserById(userId);

      ctx.body = {
        hasPassword: Boolean(user.passwordEncrypted),
        encryptedSecret: user.encryptedSecret,
      };

      return next();
    }
  );

  // Change password with zero-knowledge encryption support
  router.put(
    `${accountApiPrefix}/password`,
    koaGuard({
      body: z.object({
        oldPassword: z.string(),
        newPassword: z.string(),
        encryptedSecret: z.string().optional(),
      }),
      status: [204, 400, 401, 403, 422],
    }),
    async (ctx, next) => {
      const { id: userId } = ctx.auth;
      const { oldPassword, newPassword, encryptedSecret } = ctx.guard.body;
      const { fields } = ctx.accountCenter;

      assertThat(
        fields.password === AccountCenterControlValue.Edit,
        'account_center.field_not_editable'
      );

      const user = await findUserById(userId);

      await verifyUserPassword(user, oldPassword);

      const { passwordEncrypted, passwordEncryptionMethod } =
        await encryptUserPassword(newPassword);

      const updatedUser = await updateUserById(userId, {
        passwordEncrypted,
        passwordEncryptionMethod,
        ...(encryptedSecret && { encryptedSecret }),
      });

      ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });

      ctx.status = 204;

      return next();
    }
  );
}
