import { Connectors } from '@logto/schemas';
import { boolean, object, string } from 'zod';

import { getConnectorInstanceById } from '@/connectors';
import RequestError from '@/errors/RequestError';
import { getAllConnectorInfo, getConnectorInfoById } from '@/lib/connectors';
import koaGuard from '@/middleware/koa-guard';
import { updateConnector } from '@/queries/connector';

import { AuthedRouter } from './types';

export default function connectorRoutes<T extends AuthedRouter>(router: T) {
  router.get('/connectors', async (ctx, next) => {
    ctx.body = await getAllConnectorInfo();

    return next();
  });

  router.get(
    '/connectors/:id',
    koaGuard({ params: object({ id: string().min(1) }) }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;
      ctx.body = getConnectorInfoById(id);

      return next();
    }
  );

  router.patch(
    '/connectors/:id/enabled',
    koaGuard({ params: object({ id: string().min(1) }), body: object({ enabled: boolean() }) }),
    async (ctx, next) => {
      const {
        params: { id },
        body: { enabled },
      } = ctx.guard;
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
      const connectorInstance = getConnectorInstanceById(id);
      if (!connectorInstance) {
        throw new RequestError({
          code: 'entity.not_exists_with_id',
          name: Connectors.tableSingular,
          id,
          status: 404,
        });
      }

      if (body.config) {
        await connectorInstance.validateConfig(body.config);
      }

      await updateConnector({ set: body, where: { id } });
      ctx.body = body;

      return next();
    }
  );
}
