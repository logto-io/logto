import { MessageTypes } from '@logto/connector-kit';
import { emailRegEx, phoneRegEx } from '@logto/core-kit';
import type { ConnectorFactoryResponse, ConnectorResponse } from '@logto/schemas';
import { arbitraryObjectGuard, Connectors, ConnectorType } from '@logto/schemas';
import { buildIdGenerator } from '@logto/shared';
import { object, string } from 'zod';

import {
  getLogtoConnectorById,
  getLogtoConnectors,
  loadConnectorFactories,
} from '#src/connectors/index.js';
import type { LogtoConnector } from '#src/connectors/types.js';
import RequestError from '#src/errors/RequestError/index.js';
import { removeUnavailableSocialConnectorTargets } from '#src/lib/sign-in-experience/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import {
  findConnectorById,
  countConnectorByConnectorId,
  deleteConnectorById,
  deleteConnectorByIds,
  insertConnector,
  updateConnector,
} from '#src/queries/connector.js';
import assertThat from '#src/utils/assert-that.js';

import type { AuthedRouter } from './types.js';

const transpileLogtoConnector = ({
  dbEntry,
  metadata,
  type,
}: LogtoConnector): ConnectorResponse => ({
  type,
  ...metadata,
  ...dbEntry,
});

const generateConnectorId = buildIdGenerator(12);

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
        connectors.filter((connector) => connector.type === ConnectorType.Email).length <= 1,
        'connector.more_than_one_email'
      );
      assertThat(
        connectors.filter((connector) => connector.type === ConnectorType.Sms).length <= 1,
        'connector.more_than_one_sms'
      );

      const filteredConnectors = filterTarget
        ? connectors.filter(({ metadata: { target } }) => target === filterTarget)
        : connectors;

      ctx.body = filteredConnectors.map((connector) => transpileLogtoConnector(connector));

      return next();
    }
  );

  router.get('/connector-factories', async (ctx, next) => {
    const connectorFactories = await loadConnectorFactories();
    const formatedFactories: ConnectorFactoryResponse[] = connectorFactories.map(
      ({ metadata, type }) => ({
        type,
        ...metadata,
      })
    );
    ctx.body = formatedFactories;

    return next();
  });

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

  router.post(
    '/connectors',
    koaGuard({
      body: Connectors.createGuard.pick({
        config: true,
        connectorId: true,
        metadata: true,
        syncProfile: true,
      }),
    }),
    async (ctx, next) => {
      const {
        body: { connectorId },
        body,
      } = ctx.guard;

      const connectorFactories = await loadConnectorFactories();
      const connectorFactory = connectorFactories.find(
        ({ metadata: { id } }) => id === connectorId
      );

      if (!connectorFactory) {
        throw new RequestError({
          code: 'connector.not_found_with_connector_id',
          status: 422,
        });
      }

      const { count } = await countConnectorByConnectorId(connectorId);
      assertThat(
        count === 0 || connectorFactory.metadata.isStandard === true,
        new RequestError({
          code: 'connector.multiple_instances_not_supported',
          status: 422,
        })
      );

      const insertConnectorId = generateConnectorId();
      ctx.body = await insertConnector({
        id: insertConnectorId,
        ...body,
      });

      /**
       * We can have only one working email/sms connector:
       * once we insert a new one, old connectors with same type should be deleted.
       */
      if (
        connectorFactory.type === ConnectorType.Sms ||
        connectorFactory.type === ConnectorType.Email
      ) {
        const logtoConnectors = await getLogtoConnectors();
        const conflictingConnectorIds = logtoConnectors
          .filter(
            ({ dbEntry: { id }, type }) =>
              type === connectorFactory.type && id !== insertConnectorId
          )
          .map(({ dbEntry: { id } }) => id);

        if (conflictingConnectorIds.length > 0) {
          await deleteConnectorByIds(conflictingConnectorIds);
        }
      }

      return next();
    }
  );

  router.patch(
    '/connectors/:id',
    koaGuard({
      params: object({ id: string().min(1) }),
      body: Connectors.createGuard
        .pick({ config: true, metadata: true, syncProfile: true })
        .partial(),
    }),

    async (ctx, next) => {
      const {
        params: { id },
        body: { config },
        body,
      } = ctx.guard;

      const { type, validateConfig } = await getLogtoConnectorById(id);

      if (body.syncProfile) {
        assertThat(
          type === ConnectorType.Social,
          new RequestError({ code: 'connector.invalid_type_for_syncing_profile', status: 422 })
        );
      }

      if (config) {
        validateConfig(config);
      }

      await updateConnector({ set: body, where: { id }, jsonbMode: 'replace' });
      const connector = await getLogtoConnectorById(id);
      ctx.body = transpileLogtoConnector(connector);

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

      const subject = phone ?? email;
      assertThat(subject, new RequestError({ code: 'guard.invalid_input' }));

      const connector = await getLogtoConnectorById(id);
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

  router.delete(
    '/connectors/:id',
    koaGuard({ params: object({ id: string().min(1) }) }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;

      const { connectorId } = await findConnectorById(id);
      const connectorFactories = await loadConnectorFactories();
      const connectorFactory = connectorFactories.find(
        ({ metadata }) => metadata.id === connectorId
      );

      await deleteConnectorById(id);

      if (connectorFactory?.type === ConnectorType.Social) {
        await removeUnavailableSocialConnectorTargets();
      }

      ctx.status = 204;

      return next();
    }
  );
}
