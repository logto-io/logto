import { InteractionEvent } from '@logto/schemas';
import type Router from 'koa-router';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { encryptUserPassword } from '#src/libraries/user.utils.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import { PasswordValidator } from './classes/libraries/password-validator.js';
import { experienceRoutes } from './const.js';
import { type ExperienceInteractionRouterContext } from './types.js';

export default function passwordExpirationRoutes<T extends ExperienceInteractionRouterContext>(
  router: Router<unknown, T>,
  { queries }: TenantContext
) {
  const {
    users: { updateUserById, findUserById },
    signInExperiences: { findDefaultSignInExperience },
  } = queries;

  router.post(
    `${experienceRoutes.prefix}/password-expiration/skip`,
    koaGuard({
      status: [204, 422, 404],
    }),
    async (ctx, next) => {
      const { experienceInteraction } = ctx;

      experienceInteraction.skipPasswordReminder();
      await experienceInteraction.save();

      ctx.status = 204;
      return next();
    }
  );

  /**
   * Reset an expired password within an active sign-in interaction.
   * The user must be identified (password.expired error already thrown during submit).
   * After resetting, it re-submits the interaction to complete sign-in.
   */
  router.put(
    `${experienceRoutes.prefix}/password-expiration/reset`,
    koaGuard({
      body: z.object({ password: z.string().min(1) }),
      status: [204, 400, 404, 422],
    }),
    async (ctx, next) => {
      const { experienceInteraction, guard } = ctx;
      const { password } = guard.body;

      assertThat(
        experienceInteraction.interactionEvent === InteractionEvent.SignIn,
        new RequestError({ code: 'session.invalid_interaction_type', status: 400 })
      );

      const userId = experienceInteraction.identifiedUserId;
      assertThat(userId, new RequestError({ code: 'session.identifier_not_found', status: 404 }));

      const user = await findUserById(userId);
      const signInExperience = await findDefaultSignInExperience();
      const passwordPolicyChecker = new PasswordValidator(signInExperience.passwordPolicy, user);
      await passwordPolicyChecker.validatePassword(password, user);

      const { passwordEncrypted, passwordEncryptionMethod } = await encryptUserPassword(password);
      const updatedUser = await updateUserById(userId, {
        passwordEncrypted,
        passwordEncryptionMethod,
        passwordUpdatedAt: Date.now(),
      });

      ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });

      experienceInteraction.markPasswordNotExpired();
      await experienceInteraction.save();

      ctx.status = 204;
      return next();
    }
  );
}
