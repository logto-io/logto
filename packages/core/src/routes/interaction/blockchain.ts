import { verifyMessage } from 'ethers';
import type Router from 'koa-router';
import { type IRouterParamContext } from 'koa-router';

import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';

import { interactionPrefix, verificationPath } from './const.js';
import type { WithInteractionDetailsContext } from './middleware/koa-interaction-details.js';
import koaInteractionSie from './middleware/koa-interaction-sie.js';
import {
  blockchainGenerateNoncePayloadGuard,
  blockchainVerifySignaturePayloadGuard,
} from './types/guard.js';
import { getInteractionStorage } from './utils/interaction.js';

export default function blockchainRoutes<T extends IRouterParamContext>(
  router: Router<unknown, WithLogContext<WithInteractionDetailsContext<T>>>,
  { queries }: TenantContext
) {
  // Create blockchain nonce interaction verification
  router.post(
    `${interactionPrefix}/${verificationPath}/blockchain-nonce`,
    koaGuard({ body: blockchainGenerateNoncePayloadGuard }),
    koaInteractionSie(queries),
    async (ctx, next) => {
      // Check interaction exists
      const { event } = getInteractionStorage(ctx.interactionDetails.result);
      const log = ctx.createLog(`Interaction.${event}.Identifier.Blockchain.Create`);

      const { body: payload } = ctx.guard;

      log.append(payload);

      // TODO: @lbennett use real nonce
      const nonce = 'wow';

      ctx.body = { nonce };

      return next();
    }
  );

  // Create blockchain nonce interaction verification
  router.post(
    `${interactionPrefix}/${verificationPath}/blockchain-verify`,
    koaGuard({ body: blockchainVerifySignaturePayloadGuard }),
    async (ctx, next) => {
      // Check interaction exists
      const { event } = getInteractionStorage(ctx.interactionDetails.result);
      const log = ctx.createLog(`Interaction.${event}.Identifier.Blockchain.Submit`);

      const { body: payload } = ctx.guard;

      log.append(payload);

      // TODO: @lbennett use real nonce
      const recovered = verifyMessage('wow', payload.signature);

      if (recovered === payload.address) {
        ctx.status = 204;
        ctx.body = { redirectTo: 'http://localhost:3001/sign-in' };
      } else {
        ctx.status = 401;
      }

      return next();
    }
  );
}
