import { InteractionEvent, bindMfaPayloadGuard } from '@logto/schemas';
import type Router from 'koa-router';
import { type IRouterParamContext } from 'koa-router';

import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';

import { interactionPrefix } from './const.js';
import type { WithInteractionDetailsContext } from './middleware/koa-interaction-details.js';
import koaInteractionSie from './middleware/koa-interaction-sie.js';
import { getInteractionStorage, storeInteractionResult } from './utils/interaction.js';
import { verifyMfaSettings } from './utils/sign-in-experience-validation.js';
import { bindMfaPayloadVerification } from './verifications/mfa-payload-verification.js';

export default function mfaRoutes<T extends IRouterParamContext>(
  router: Router<unknown, WithInteractionDetailsContext<WithLogContext<T>>>,
  { provider, queries }: TenantContext
) {
  // Update New MFA
  router.put(
    `${interactionPrefix}/bind-mfa`,
    koaGuard({
      body: bindMfaPayloadGuard,
      status: [204, 400, 401, 404, 422],
    }),
    koaInteractionSie(queries),
    async (ctx, next) => {
      const bindMfaPayload = ctx.guard.body;
      const { signInExperience, interactionDetails, createLog } = ctx;
      const interactionStorage = getInteractionStorage(interactionDetails.result);

      const log = createLog(`Interaction.${interactionStorage.event}.BindMfa.Totp.Submit`);

      if (interactionStorage.event !== InteractionEvent.ForgotPassword) {
        verifyMfaSettings(bindMfaPayload.type, signInExperience);
      }

      const bindMfa = await bindMfaPayloadVerification(ctx, bindMfaPayload, interactionStorage);

      log.append({ bindMfa, interactionStorage });

      await storeInteractionResult({ bindMfa }, ctx, provider, true);

      ctx.status = 204;

      return next();
    }
  );
}
