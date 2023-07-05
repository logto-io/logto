import { buildRawConnector } from '@logto/cli/lib/connector/index.js';
import type { ConnectorFactory } from '@logto/cli/lib/connector/index.js';
import {
  type SmsConnector,
  type EmailConnector,
  demoConnectorIds,
  VerificationCodeType,
} from '@logto/connector-kit';
import { ServiceConnector } from '@logto/connector-kit';
import { phoneRegEx, emailRegEx } from '@logto/core-kit';
import { jsonObjectGuard, ConnectorType } from '@logto/schemas';
import { string, object } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';
import { loadConnectorFactories } from '#src/utils/connectors/index.js';

import type { AuthedRouter, RouterInitArgs } from '../types.js';

export default function connectorConfigTestingRoutes<T extends AuthedRouter>(
  ...[router, { cloudConnection }]: RouterInitArgs<T>
) {
  const { getCloudConnectionData } = cloudConnection;

  router.post(
    '/connectors/:factoryId/test',
    koaGuard({
      params: object({ factoryId: string().min(1) }),
      body: object({
        phone: string().regex(phoneRegEx).optional(),
        email: string().regex(emailRegEx).optional(),
        config: jsonObjectGuard,
      }),
    }),
    async (ctx, next) => {
      const {
        params: { factoryId },
        body,
      } = ctx.guard;
      const { phone, email, config: originalConfig } = body;

      const subject = phone ?? email;
      assertThat(subject, new RequestError({ code: 'guard.invalid_input' }));

      const connectorFactories = await loadConnectorFactories();
      const connectorFactory = connectorFactories
        .filter(
          (factory): factory is ConnectorFactory<SmsConnector> | ConnectorFactory<EmailConnector> =>
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
      } = await buildRawConnector<SmsConnector | EmailConnector>(connectorFactory);

      /**
       * Should manually attach cloud connection data to logto email connector since we directly use
       * this `config` to test the `sendMessage` method.
       * Logto email connector will no longer save cloud connection data to its `config` after this change.
       */
      const config =
        ServiceConnector.Email === connectorFactory.metadata.id
          ? { ...(await getCloudConnectionData()), ...originalConfig }
          : originalConfig;
      await sendMessage(
        {
          to: subject,
          type: VerificationCodeType.Generic,
          payload: {
            code: '000000',
          },
        },
        config
      );

      ctx.status = 204;

      return next();
    }
  );
}
