import { Connectors } from '@logto/schemas';
import { boolean, object, string } from 'zod';

import { validateConfig } from '@/connectors/utilities';
import RequestError from '@/errors/RequestError';
import { getAllConnectorInfo, getConnectorInfoById } from '@/lib/connector-info';
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
      ctx.body = await getConnectorInfoById(id);

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
      if (typeof enabled === 'boolean') {
        await updateConnector({ set: { enabled }, where: { id } });
        ctx.body = { enabled };
      } else {
        throw new RequestError({
          code: 'guard.invalid_input',
          name: Connectors.tableSingular,
          id,
          status: 400,
        });
      }

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
        body: { config },
      } = ctx.guard;
      const validConfig = Boolean(config && (await validateConfig(config)));

      if (!validConfig) {
        throw new RequestError({
          code: 'guard.invalid_input',
          name: Connectors.tableSingular,
          id,
          status: 400,
        });
      }

      await updateConnector({ set: { config }, where: { id } });
      ctx.body = { config };

      return next();
    }
  );
}
