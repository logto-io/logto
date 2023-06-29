import { type EmailConnector, type SmsConnector } from '@logto/connector-kit';
import { ConnectorType } from '@logto/schemas';
import { assert } from '@silverhand/essentials';
import { string, number, object } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type { LogtoConnector } from '#src/utils/connectors/types.js';

import type { AuthedRouter, RouterInitArgs } from '../types.js';

export default function connectorStatusRoutes<T extends AuthedRouter>(
  ...[router, tenant]: RouterInitArgs<T>
) {
  const { getLogtoConnectors } = tenant.connectors;

  router.get(
    '/connectors/:id/usage',
    koaGuard({
      params: object({ id: string().min(1) }),
      response: object({ usage: number() }),
      status: [200, 404, 501],
    }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;

      const connectors = await getLogtoConnectors();
      const connector = connectors.find(
        (connector): connector is LogtoConnector<EmailConnector | SmsConnector> =>
          connector.type !== ConnectorType.Social && connector.dbEntry.id === id
      );
      assert(connector, new RequestError({ code: 'connector.not_found', status: 404 }));

      const {
        getUsage,
        dbEntry: { createdAt },
      } = connector;
      assert(
        getUsage,
        new RequestError({ code: 'connector.not_implemented', status: 501, method: 'getUsage()' })
      );

      ctx.body = { usage: await getUsage(new Date(createdAt)) };
      return next();
    }
  );
}
