import { Connectors } from '@logto/schemas';
import { boolean, object, string } from 'zod';

import { getConnectorById } from '@/connectors';
import { validateConfig } from '@/connectors/utilities';
import RequestError from '@/errors/RequestError';
import koaGuard from '@/middleware/koa-guard';
import { findAllConnectors, findConnectorById, updateConnector } from '@/queries/connector';

import { AuthedRouter } from './types';

export default function connectorRoutes<T extends AuthedRouter>(router: T) {
  router.get('/connectors', async (ctx, next) => {
    const connectors = await findAllConnectors();
    ctx.body = connectors.map((connector) => {
      const { id, ...rest } = connector;
      const { metadata } = getConnectorById(id) ?? {};
      return { id, ...rest, ...metadata };
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
      const connector = await findConnectorById(id);
      const { metadata } = getConnectorById(id) ?? {};
      ctx.body = { ...connector, ...metadata };

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
      body: Connectors.createGuard.omit({ id: true, type: true, createdAt: true }).partial(),
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body: { enabled, config },
        body,
      } = ctx.guard;
      const validEnable = Boolean(enabled && typeof enabled === 'boolean');
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
