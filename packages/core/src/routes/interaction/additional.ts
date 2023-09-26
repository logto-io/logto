import { MfaFactor, requestVerificationCodePayloadGuard } from '@logto/schemas';
import type Router from 'koa-router';
import { type IRouterParamContext } from 'koa-router';
import { z } from 'zod';

import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';

import { interactionPrefix, verificationPath } from './const.js';
import type { WithInteractionDetailsContext } from './middleware/koa-interaction-details.js';
import { socialAuthorizationUrlPayloadGuard } from './types/guard.js';
import { getInteractionStorage, storeInteractionResult } from './utils/interaction.js';
import { createSocialAuthorizationUrl } from './utils/social-verification.js';
import { generateTotpSecret } from './utils/totp-validation.js';
import { sendVerificationCodeToIdentifier } from './utils/verification-code-validation.js';

export default function additionalRoutes<T extends IRouterParamContext>(
  router: Router<unknown, WithInteractionDetailsContext<WithLogContext<T>>>,
  tenant: TenantContext
) {
  // Create social authorization url interaction verification
  router.post(
    `${interactionPrefix}/${verificationPath}/social-authorization-uri`,
    koaGuard({
      body: socialAuthorizationUrlPayloadGuard,
      status: [200, 400, 404],
      response: z.object({
        redirectTo: z.string(),
      }),
    }),
    async (ctx, next) => {
      // Check interaction exists
      const { event } = getInteractionStorage(ctx.interactionDetails.result);
      const log = ctx.createLog(`Interaction.${event}.Identifier.Social.Create`);

      const { body: payload } = ctx.guard;

      log.append(payload);

      const redirectTo = await createSocialAuthorizationUrl(ctx, tenant, payload);

      ctx.body = { redirectTo };

      return next();
    }
  );

  // Create passwordless interaction verification-code
  router.post(
    `${interactionPrefix}/${verificationPath}/verification-code`,
    koaGuard({
      body: requestVerificationCodePayloadGuard,
      status: [204, 400, 404],
    }),
    async (ctx, next) => {
      const { interactionDetails, guard, createLog } = ctx;
      // Check interaction exists
      const { event } = getInteractionStorage(interactionDetails.result);

      await sendVerificationCodeToIdentifier(
        { event, ...guard.body },
        interactionDetails.jti,
        createLog,
        tenant.libraries.passcodes
      );

      ctx.status = 204;

      return next();
    }
  );

  // Prepare new totp secret
  router.post(
    `${interactionPrefix}/${verificationPath}/totp`,
    koaGuard({
      status: [200],
      response: z.object({
        secret: z.string(),
      }),
    }),
    async (ctx, next) => {
      const { interactionDetails, createLog } = ctx;
      // Check interaction exists
      const { event } = getInteractionStorage(interactionDetails.result);
      createLog(`Interaction.${event}.BindMfa.Totp.Create`);

      const secret = generateTotpSecret();
      await storeInteractionResult(
        { pendingMfa: { type: MfaFactor.TOTP, secret } },
        ctx,
        tenant.provider,
        true
      );

      ctx.body = { secret };

      return next();
    }
  );
}
