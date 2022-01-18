import { Connectors } from '@logto/schemas';
import { object, string } from 'zod';

<<<<<<< HEAD
import { getConnectorInstances, getConnectorInstanceById } from '@/connectors';
import { ConnectorInstance } from '@/connectors/types';
=======
import { validateConfig } from '@/connectors/utilities';
import RequestError from '@/errors/RequestError';
>>>>>>> 56d3cb8 (feat(connector apis): fix according to comments)
import koaGuard from '@/middleware/koa-guard';
import { updateConnector } from '@/queries/connector';

import { AuthedRouter } from './types';

const transpileConnectorInstance = ({ connector, metadata }: ConnectorInstance) => ({
  ...connector,
  metadata,
});

export default function connectorRoutes<T extends AuthedRouter>(router: T) {
  router.get('/connectors', async (ctx, next) => {
    const connectorInstances = await getConnectorInstances();
    ctx.body = connectorInstances.map((connectorInstance) => {
      return transpileConnectorInstance(connectorInstance);
    });

    return next();
  });

  router.get(
    '/connectors/:id',
    koaGuard({ params: object({ id: string().min(1) }) }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;
      const connectorInstance = await getConnectorInstanceById(id);
      ctx.body = transpileConnectorInstance(connectorInstance);

      return next();
    }
  );

  router.patch(
    '/connectors/:id/enabled',
    koaGuard({
      params: object({ id: string().min(1) }),
      body: Connectors.createGuard.pick({ enabled: true }),
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body: { enabled },
      } = ctx.guard;
      const { metadata } = await getConnectorInstanceById(id);
      const connector = await updateConnector({ set: { enabled }, where: { id } });
      ctx.body = { ...connector, metadata };

      return next();
    }
  );

  router.patch(
    '/connectors/:id',
    koaGuard({
      params: object({ id: string().min(1) }),
      body: Connectors.createGuard
        .omit({ id: true, type: true, enabled: true, createdAt: true })
        .partial(),
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body,
      } = ctx.guard;
      const { metadata, validateConfig } = await getConnectorInstanceById(id);

      if (body.config) {
        await validateConfig(body.config);
      }

      const connector = await updateConnector({ set: body, where: { id } });
      ctx.body = { ...connector, metadata };

      return next();
    }
  );
}
