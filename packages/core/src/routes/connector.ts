import { configurableConnectorMetadataGuard, MessageTypes } from '@logto/connector-kit';
import { emailRegEx, phoneRegEx } from '@logto/core-kit';
import type { ConnectorResponse } from '@logto/schemas';
import { arbitraryObjectGuard, Connectors, ConnectorType } from '@logto/schemas';
import { object, string } from 'zod';

import { getLogtoConnectorById, getLogtoConnectors } from '@/connectors';
import type { LogtoConnector } from '@/connectors/types';
import RequestError from '@/errors/RequestError';
import { removeUnavailableSocialConnectorTargets } from '@/lib/sign-in-experience';
import koaGuard from '@/middleware/koa-guard';
import { updateConnector } from '@/queries/connector';
import assertThat from '@/utils/assert-that';

import type { AuthedRouter } from './types';

const transpileLogtoConnector = ({
  dbEntry,
  metadata,
  type,
}: LogtoConnector): ConnectorResponse => ({
  type,
  ...metadata,
  ...dbEntry,
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
          (connector) => connector.dbEntry.enabled && connector.type === ConnectorType.Email
        ).length <= 1,
        'connector.more_than_one_email'
      );
      assertThat(
        connectors.filter(
          (connector) => connector.dbEntry.enabled && connector.type === ConnectorType.Sms
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
        type,
        dbEntry: { config },
        metadata,
        validateConfig,
      } = await getLogtoConnectorById(id);

      if (enabled) {
        validateConfig(config);
      }

      // Only allow one enabled connector for SMS and Email.
      // disable other connectors before enable this one.
      if (enabled && (type === ConnectorType.Sms || type === ConnectorType.Email)) {
        const connectors = await getLogtoConnectors();
        await Promise.all(
          connectors
            .filter(
              ({ dbEntry: { enabled }, type: currentType }) => type === currentType && enabled
            )
            .map(async ({ dbEntry: { id } }) =>
              updateConnector({ set: { enabled: false }, where: { id }, jsonbMode: 'merge' })
            )
        );
      }

      const connector = await updateConnector({
        set: { enabled },
        where: { id },
        jsonbMode: 'merge',
      });

      // Delete the social connector in the sign-in experience if it is disabled.
      if (!enabled && type === ConnectorType.Social) {
        await removeUnavailableSocialConnectorTargets();
      }

      ctx.body = { ...connector, metadata, type };

      return next();
    }
  );

  router.patch(
    '/connectors/:id',
    koaGuard({
      params: object({ id: string().min(1) }),
      body: Connectors.createGuard
        .omit({ id: true, connectorId: true, enabled: true, syncProfile: true, createdAt: true })
        .partial(),
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body,
      } = ctx.guard;

      const { metadata, type, validateConfig } = await getLogtoConnectorById(id);

      if (body.config) {
        validateConfig(body.config);
      }

      if (metadata.isStandard === true) {
        const databaseMetadataGuard = configurableConnectorMetadataGuard.required();
        const result = databaseMetadataGuard.safeParse(body.metadata);

        if (!result.success) {
          throw new RequestError({ code: 'connector.invalid_configurable_metadata', status: 422 });
        }
      }

      const connector = await updateConnector({ set: body, where: { id }, jsonbMode: 'replace' });
      const { metadata: databaseMetadata, ...rest } = connector;
      ctx.body = {
        ...rest,
        metadata: metadata.isStandard === true ? { ...metadata, ...databaseMetadata } : metadata,
        type,
      };

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

      const connector = logtoConnectors.find(({ metadata: { id: currentId } }) => currentId === id);
      const expectType = phone ? ConnectorType.Sms : ConnectorType.Email;

      assertThat(
        connector,
        new RequestError({
          code: 'connector.not_found',
          type: expectType,
        })
      );
      assertThat(connector.type === expectType, 'connector.unexpected_type');

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
