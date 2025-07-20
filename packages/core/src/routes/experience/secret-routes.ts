import type Router from 'koa-router';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';

import { experienceRoutes } from './const.js';
import { type ExperienceInteractionRouterContext } from './types.js';

export default function secretRoutes<T extends ExperienceInteractionRouterContext>(
  router: Router<unknown, T>,
  tenant: TenantContext
) {
  const { queries, id: tenantId } = tenant;
  // Store user's encrypted secret
  router.put(
    `${experienceRoutes.prefix}/secret/user`,
    koaGuard({
      body: z.object({
        encryptedSecret: z.string(),
      }),
      status: [200, 400, 401],
    }),
    async (ctx, next) => {
      const { experienceInteraction } = ctx;
      const { encryptedSecret } = ctx.guard.body;

      // Get the user ID from the current interaction
      const userId = experienceInteraction.identifiedUserId;

      if (!userId) {
        ctx.status = 401;
        return next();
      }

      // Update the user record with the encrypted secret
      await queries.users.updateUserById(userId, {
        encryptedSecret,
      });

      ctx.status = 200;
      return next();
    }
  );

  // Store session's encrypted client secret
  router.put(
    `${experienceRoutes.prefix}/secret/session`,
    koaGuard({
      body: z.object({
        encryptedClientSecret: z.string(),
      }),
      status: [200, 400],
    }),
    async (ctx, next) => {
      const { experienceInteraction } = ctx;
      const { encryptedClientSecret } = ctx.guard.body;

      // Store the encrypted client secret in the experience interaction
      // It will be persisted to the OIDC session when the interaction is submitted
      experienceInteraction.setEncryptedClientSecret(encryptedClientSecret);

      // Save the interaction to persist the encrypted client secret
      await experienceInteraction.save();

      ctx.status = 200;
      return next();
    }
  );

  // Get session's encrypted client secret
  router.get(
    `${experienceRoutes.prefix}/secret/session`,
    koaGuard({
      response: z.object({
        encryptedClientSecret: z.string().nullable(),
      }),
      status: [200, 401],
    }),
    async (ctx, next) => {
      const { experienceInteraction } = ctx;

      // Get the encrypted client secret from the interaction
      const encryptedClientSecret = experienceInteraction.getEncryptedClientSecret();

      ctx.body = {
        encryptedClientSecret,
      };

      return next();
    }
  );
}
