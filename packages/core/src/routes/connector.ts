import { MessageTypes } from '@logto/connector-core';
import { arbitraryObjectGuard, ConnectorDto, Connectors, ConnectorType } from '@logto/schemas';
import { emailRegEx, phoneRegEx } from '@logto/shared';
import { object, string } from 'zod';

import { getLogtoConnectorById, getLogtoConnectors } from '@/connectors';
import { LogtoConnector } from '@/connectors/types';
import RequestError from '@/errors/RequestError';
import koaGuard from '@/middleware/koa-guard';
import { updateConnector } from '@/queries/connector';
import assertThat from '@/utils/assert-that';

import { AuthedRouter } from './types';

const transpileLogtoConnector = ({ db, metadata }: LogtoConnector): ConnectorDto => ({
  ...db,
  ...metadata,
});

export default function connectorRoutes<T extends AuthedRouter>(router: T) {
  router.get(
    '/connectors',
    koaGuard({
      query: object({
        target: string().optional(),
      }),
    }),
    async (ctx, next) => {
      const { target: filterTarget } = ctx.query;
      const connectors = await getLogtoConnectors();

      assertThat(
        connectors.filter(
          (connector) => connector.db.enabled && connector.metadata.type === ConnectorType.Email
        ).length <= 1,
        'connector.more_than_one_email'
      );
      assertThat(
        connectors.filter(
          (connector) => connector.db.enabled && connector.metadata.type === ConnectorType.SMS
        ).length <= 1,
        'connector.more_than_one_sms'
      );

      const filteredConnectors = filterTarget
        ? connectors.filter(({ metadata: { target } }) => target === filterTarget)
        : connectors;

      ctx.body = filteredConnectors.map((connector) => transpileLogtoConnector(connector));

      return next();
    }
  );

  router.get(
    '/connectors/:id',
    koaGuard({ params: object({ id: string().min(1) }) }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;
      const connector = await getLogtoConnectorById(id);
      ctx.body = transpileLogtoConnector(connector);

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

      const {
        db: { config },
        metadata,
        validateConfig,
      } = await getLogtoConnectorById(id);

      if (enabled) {
        validateConfig(config);
      }

      // Only allow one enabled connector for SMS and Email.
      // disable other connectors before enable this one.
      if (
        enabled &&
        (metadata.type === ConnectorType.SMS || metadata.type === ConnectorType.Email)
      ) {
        const connectors = await getLogtoConnectors();
        await Promise.all(
          connectors
            .filter(({ db: { enabled }, metadata: { type } }) => type === metadata.type && enabled)
            .map(async ({ db: { id } }) =>
              updateConnector({ set: { enabled: false }, where: { id }, jsonbMode: 'merge' })
            )
        );
      }

      const connector = await updateConnector({
        set: { enabled },
        where: { id },
        jsonbMode: 'merge',
      });
      ctx.body = { ...connector, metadata };

      return next();
    }
  );

  router.patch(
    '/connectors/:id',
    koaGuard({
      params: object({ id: string().min(1) }),
      body: Connectors.createGuard.omit({ id: true, enabled: true, createdAt: true }).partial(),
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body,
      } = ctx.guard;

      const { metadata, validateConfig } = await getLogtoConnectorById(id);

      if (body.config) {
        validateConfig(body.config);
      }

      const connector = await updateConnector({ set: body, where: { id }, jsonbMode: 'replace' });
      ctx.body = { ...connector, metadata };

      return next();
    }
  );

  router.post(
    '/connectors/:id/test',
    koaGuard({
      params: object({ id: string().min(1) }),
      body: object({
        phone: string().regex(phoneRegEx).optional(),
        email: string().regex(emailRegEx).optional(),
        config: arbitraryObjectGuard,
      }),
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body,
      } = ctx.guard;
      const { phone, email, config } = body;

      const logtoConnectors = await getLogtoConnectors();
      const subject = phone ?? email;
      assertThat(subject, new RequestError({ code: 'guard.invalid_input' }));

      const connector = phone
        ? logtoConnectors.find(
            ({ metadata: { id: id_, type } }) => id_ === id && type === ConnectorType.SMS
          )
        : logtoConnectors.find(
            ({ metadata: { id: id_, type } }) => id_ === id && type === ConnectorType.Email
          );

      assertThat(
        connector,
        new RequestError({
          code: 'connector.not_found',
          type: phone ? ConnectorType.SMS : ConnectorType.Email,
        })
      );

      const { sendMessage } = connector;

      await sendMessage(
        {
          to: subject,
          type: MessageTypes.Test,
          payload: {
            code: phone ? '123456' : 'email-test',
          },
        },
        config
      );

      ctx.status = 204;

      return next();
    }
  );
}
