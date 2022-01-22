import { Connectors } from '@logto/schemas';
import { object, string } from 'zod';

import { getAllConnectorInstances, getConnectorInstanceById } from '@/lib/connectors';
import koaGuard from '@/middleware/koa-guard';
import { findConnectorById, updateConnector } from '@/queries/connector';

import { AuthedRouter } from './types';

export default function connectorRoutes<T extends AuthedRouter>(router: T) {
  router.get('/connectors', async (ctx, next) => {
    ctx.body = await getAllConnectorInstances();

    return next();
  });

  router.get(
    '/connectors/:id',
    koaGuard({ params: object({ id: string().min(1) }) }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;
      ctx.body = await getConnectorInstanceById(id);

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
      await findConnectorById(id);
      await updateConnector({ set: { enabled }, where: { id } });
      ctx.body = { enabled };

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
      const connectorInstance = await getConnectorInstanceById(id);

      if (body.config) {
        await connectorInstance.validateConfig(body.config);
      }

      await updateConnector({ set: body, where: { id } });
      ctx.body = body;

      return next();
    }
  );
}
