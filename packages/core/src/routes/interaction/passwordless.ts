import { requestVerificationCodePayloadGuard } from '@logto/schemas';
import type Router from 'koa-router';
import { type IRouterParamContext } from 'koa-router';

import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';

import { interactionPrefix, verificationPath } from './const.js';
import type { WithInteractionDetailsContext } from './middleware/koa-interaction-details.js';
import { getInteractionStorage } from './utils/interaction.js';
import { sendVerificationCodeToIdentifier } from './utils/verification-code-validation.js';

export default function passwordlessRoutes<T extends IRouterParamContext>(
  router: Router<unknown, WithLogContext<WithInteractionDetailsContext<T>>>,
  { libraries }: TenantContext
) {
  // Create passwordless interaction verification-code
  router.post(
    `${interactionPrefix}/${verificationPath}/verification-code`,
    koaGuard({
      body: requestVerificationCodePayloadGuard,
    }),
    async (ctx, next) => {
      const { interactionDetails, guard, createLog } = ctx;
      // Check interaction exists
      const { event } = getInteractionStorage(interactionDetails.result);

      await sendVerificationCodeToIdentifier(
        { event, ...guard.body },
        interactionDetails.jti,
        createLog,
        libraries.passcodes
      );

      ctx.status = 204;

      return next();
    }
  );
}
