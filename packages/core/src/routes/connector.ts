import { Connectors } from '@logto/schemas';
import { object, string } from 'zod';

import { validateConfig } from '@/connectors/utilities';
import koaGuard from '@/middleware/koa-guard';
import { findAllConnectors, findConnectorById, updateConnector } from '@/queries/connector';

import { AuthedRouter } from './types';

export default function connectorRoutes<T extends AuthedRouter>(router: T) {
  router.get('/connectors', async (ctx, next) => {
    ctx.body = await findAllConnectors();

    return next();
  });

  router.get(
    '/connectors/:id',
    koaGuard({ params: object({ id: string().min(1) }) }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;
      ctx.body = await findConnectorById(id);

      return next();
    }
  );

  router.patch(
    '/connectors/:id',
    koaGuard({
      params: object({ id: string().min(1) }),
      body: Connectors.guard.omit({ id: true, type: true, createdAt: true }).partial(),
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body: { enabled, config },
      } = ctx.guard;
      if (config && (await validateConfig(config))) {
        await updateConnector({ set: { enabled, config }, where: { id } });
        ctx.body = { enabled, config };
      } else {
        throw new Error('Input invalid config: ' + JSON.stringify(config));
      }

      return next();
    }
  );
}
