import { Connectors } from '@logto/schemas';
import { object, string } from 'zod';

import { validateConfig } from '@/connectors/utilities';
import RequestError from '@/errors/RequestError';
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
        body,
      } = ctx.guard;
      const validEnable = typeof enabled === 'boolean';
      const validConfig = Boolean(config && (await validateConfig(config)));
      if (validEnable && validConfig) {
        await updateConnector({ set: body, where: { id } });
        ctx.body = body;
      } else if (validEnable && !validConfig) {
        await updateConnector({ set: { enabled }, where: { id } });
        ctx.body = { enabled };
      } else if (!validEnable && validConfig) {
        await updateConnector({ set: { config }, where: { id } });
        ctx.body = { config };
      }

      if (!(validEnable && validConfig)) {
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
}
