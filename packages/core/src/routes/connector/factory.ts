import { connectorFactoryResponseGuard } from '@logto/schemas';
import { string, object } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';
import { loadConnectorFactories, transpileConnectorFactory } from '#src/utils/connectors/index.js';

import type { ManagementApiRouter, RouterInitArgs } from '../types.js';

export default function connectorFactoryRoutes<T extends ManagementApiRouter>(
  ...[router]: RouterInitArgs<T>
) {
  router.get(
    '/connector-factories',
    koaGuard({
      response: connectorFactoryResponseGuard.array(),
      status: [200],
    }),
    async (ctx, next) => {
      const connectorFactories = await loadConnectorFactories();
      ctx.body = connectorFactories.map((connectorFactory) =>
        transpileConnectorFactory(connectorFactory)
      );

      return next();
    }
  );

  router.get(
    '/connector-factories/:id',
    koaGuard({
      params: object({ id: string().min(1) }),
      response: connectorFactoryResponseGuard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;
      const connectorFactories = await loadConnectorFactories();

      const connectorFactory = connectorFactories.find((factory) => factory.metadata.id === id);
      assertThat(
        connectorFactory,
        new RequestError({
          code: 'entity.not_found',
          status: 404,
        })
      );

      ctx.body = transpileConnectorFactory(connectorFactory);

      return next();
    }
  );
}
