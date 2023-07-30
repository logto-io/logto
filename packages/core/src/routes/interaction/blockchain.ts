import type Router from 'koa-router';
import { type IRouterParamContext } from 'koa-router';

import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';
import { ConnectorType } from '#src/utils/connectors/types.js';

import { interactionPrefix, verificationPath } from './const.js';
import type { WithInteractionDetailsContext } from './middleware/koa-interaction-details.js';
import koaInteractionSie from './middleware/koa-interaction-sie.js';
import { blockchainGenerateNoncePayloadGuard } from './types/guard.js';
import { getInteractionStorage } from './utils/interaction.js';

export default function blockchainRoutes<T extends IRouterParamContext>(
  router: Router<unknown, WithLogContext<WithInteractionDetailsContext<T>>>,
  { queries, connectors }: TenantContext
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

      const { getLogtoConnectorById } = connectors;

      const { body: payload } = ctx.guard;

      const connector = await getLogtoConnectorById(payload.connectorId);

      assertThat(connector.type === ConnectorType.Blockchain, 'connector.unexpected_type');

      const nonce = await connector.generateNonce();

      log.append(payload);

      ctx.body = { nonce };

      return next();
    }
  );
}
