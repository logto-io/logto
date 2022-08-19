import { arbitraryObjectGuard, ConnectorDto, Connectors, ConnectorType } from '@logto/schemas';
import { emailRegEx, phoneRegEx } from '@logto/shared';
import { object, string } from 'zod';

import { getConnectorInstances, getConnectorInstanceById } from '@/connectors';
import { ConnectorInstance } from '@/connectors/types';
import RequestError from '@/errors/RequestError';
import koaGuard from '@/middleware/koa-guard';
import { updateConnector } from '@/queries/connector';
import assertThat from '@/utils/assert-that';

import { AuthedRouter } from './types';

const transpileConnectorInstance = ({ connector, metadata }: ConnectorInstance): ConnectorDto => ({
  ...connector,
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
      const connectorInstances = await getConnectorInstances();

      assertThat(
        connectorInstances.filter(
          (connector) =>
            connector.connector.enabled && connector.metadata.type === ConnectorType.Email
        ).length <= 1,
        'connector.more_than_one_email'
      );
      assertThat(
        connectorInstances.filter(
          (connector) =>
            connector.connector.enabled && connector.metadata.type === ConnectorType.SMS
        ).length <= 1,
        'connector.more_than_one_sms'
      );

      const filteredInstances = filterTarget
        ? connectorInstances.filter(({ metadata: { target } }) => target === filterTarget)
        : connectorInstances;

      ctx.body = filteredInstances.map((connectorInstance) =>
        transpileConnectorInstance(connectorInstance)
      );

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

      const connectorInstance = await getConnectorInstanceById(id);
      const {
        connector: { config },
        validateConfig,
        metadata,
      } = connectorInstance;

      /**
       * Assertion functions always need explicit annotations.
       * See https://github.com/microsoft/TypeScript/issues/36931#issuecomment-589753014
       */
      const validator: typeof validateConfig = validateConfig;

      if (enabled) {
        validator(config);
      }

      // Only allow one enabled connector for SMS and Email.
      // disable other connectors before enable this one.
      if (
        enabled &&
        (metadata.type === ConnectorType.SMS || metadata.type === ConnectorType.Email)
      ) {
        const connectors = await getConnectorInstances();
        await Promise.all(
          connectors
            .filter(
              (connector) =>
                connector.metadata.type === metadata.type && connector.connector.enabled
            )
            .map(async ({ connector: { id } }) =>
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

      const { metadata, validateConfig } = await getConnectorInstanceById(id);

      /**
       * Assertion functions always need explicit annotations.
       * See https://github.com/microsoft/TypeScript/issues/36931#issuecomment-589753014
       */
      const validator: typeof validateConfig = validateConfig;

      if (body.config) {
        validator(body.config);
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

      const connectorInstances = await getConnectorInstances();
      const subject = phone ?? email;
      assertThat(subject, new RequestError({ code: 'guard.invalid_input' }));

      const connector: ConnectorInstance | undefined = phone
        ? connectorInstances.find(
            (connector) =>
              connector.metadata.id === id && connector.metadata.type === ConnectorType.SMS
          )
        : connectorInstances.find(
            (connector) =>
              connector.metadata.id === id && connector.metadata.type === ConnectorType.Email
          );

      assertThat(
        connector,
        new RequestError({
          code: 'connector.not_found',
          type: phone ? ConnectorType.SMS : ConnectorType.Email,
        })
      );

      const { sendMessage } = connector;
      assertThat(
        sendMessage,
        new RequestError({
          code: 'connector.not_implemented',
          method: 'sendTestMessage',
          status: 501,
        })
      );

      await sendMessage(
        {
          to: subject,
          type: 'Test',
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
