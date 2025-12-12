import { buildRawConnector, notImplemented } from '@logto/cli/lib/connector/index.js';
import type { ConnectorFactory } from '@logto/cli/lib/connector/index.js';
import type CloudRouter from '@logto/cloud/routes';
import {
  type SmsConnector,
  type EmailConnector,
  demoConnectorIds,
  TemplateType,
} from '@logto/connector-kit';
import { ServiceConnector } from '@logto/connector-kit';
import { phoneRegEx, emailRegEx } from '@logto/core-kit';
import { jsonObjectGuard, ConnectorType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { string, object } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';
import { loadConnectorFactories } from '#src/utils/connectors/index.js';

import type { ManagementApiRouter, RouterInitArgs } from '../types.js';

export default function connectorConfigTestingRoutes<T extends ManagementApiRouter>(
  ...[router, { cloudConnection, connectors }]: RouterInitArgs<T>
) {
  const { getClient } = cloudConnection;
  const { getI18nEmailTemplate } = connectors;

  router.post(
    '/connectors/:factoryId/test',
    koaGuard({
      params: object({ factoryId: string().min(1) }),
      body: object({
        phone: string().regex(phoneRegEx).optional(),
        email: string().regex(emailRegEx).optional(),
        config: jsonObjectGuard,
        locale: string().optional(),
      }),
      status: [204, 400, 404],
    }),
    async (ctx, next) => {
      const {
        params: { factoryId },
        body,
      } = ctx.guard;
      const { phone, email, config, locale } = body;

      const subject = phone ?? email;
      assertThat(subject, new RequestError({ code: 'guard.invalid_input' }));

      const connectorFactories = await loadConnectorFactories();
      const connectorFactory = connectorFactories
        .filter(
          (
            factory
          ): factory is
            | ConnectorFactory<typeof CloudRouter, SmsConnector>
            | ConnectorFactory<typeof CloudRouter, EmailConnector> =>
            factory.type === ConnectorType.Email || factory.type === ConnectorType.Sms
        )
        .find(({ metadata: { id } }) => id === factoryId && !demoConnectorIds.includes(id));
      const expectType = phone ? ConnectorType.Sms : ConnectorType.Email;

      assertThat(
        connectorFactory,
        new RequestError({
          code: 'connector.not_found',
          type: expectType,
          factoryId,
        })
      );

      assertThat(connectorFactory.type === expectType, 'connector.unexpected_type');

      const {
        rawConnector: { sendMessage },
      } = await buildRawConnector<typeof CloudRouter, SmsConnector | EmailConnector>(
        connectorFactory,
        notImplemented,
        conditional(ServiceConnector.Email === connectorFactory.metadata.id && getClient),
        conditional(connectorFactory.type === ConnectorType.Email && getI18nEmailTemplate)
      );

      await sendMessage(
        {
          to: subject,
          type: TemplateType.Generic,
          payload: {
            code: '000000',
            ...conditional(locale && { locale }),
          },
          ip: ctx.request.ip,
        },
        config
      );

      ctx.status = 204;

      return next();
    }
  );
}
