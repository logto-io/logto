import { type ConnectorFactory } from '@logto/cli/lib/connector/index.js';
import type router from '@logto/cloud/routes';
import { demoConnectorIds, validateConfig } from '@logto/connector-kit';
import {
  Connectors,
  ConnectorType,
  connectorResponseGuard,
  type JsonObject,
  ProductEvent,
} from '@logto/schemas';
import { generateStandardShortId } from '@logto/shared';
import { conditional } from '@silverhand/essentials';
import cleanDeep from 'clean-deep';
import { string, object } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { type QuotaLibrary } from '#src/libraries/quota.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';
import { buildExtraInfo } from '#src/utils/connectors/extra-information.js';
import { loadConnectorFactories, transpileLogtoConnector } from '#src/utils/connectors/index.js';
import { checkSocialConnectorTargetAndPlatformUniqueness } from '#src/utils/connectors/platform.js';

import { captureEvent } from '../../utils/posthog.js';
import type { ManagementApiRouter, RouterInitArgs } from '../types.js';

import connectorAuthorizationUriRoutes from './authorization-uri.js';
import connectorConfigTestingRoutes from './config-testing.js';
import connectorFactoryRoutes from './factory.js';

const guardConnectorsQuota = async (
  factory: ConnectorFactory<typeof router>,
  quota: QuotaLibrary
) => {
  if (factory.type === ConnectorType.Social) {
    await quota.guardTenantUsageByKey('socialConnectorsLimit');
  }
};

const passwordlessConnector = new Set([ConnectorType.Email, ConnectorType.Sms]);
const pickFactoryProperties = <T extends ConnectorFactory<typeof router>>(factory: T) => ({
  type: factory.type,
  name: factory.metadata.name.en,
});

export default function connectorRoutes<T extends ManagementApiRouter>(
  ...[router, tenant]: RouterInitArgs<T>
) {
  const {
    findConnectorById,
    countConnectorByConnectorId,
    deleteConnectorById,
    deleteConnectorByIds,
    insertConnector,
    updateConnector,
  } = tenant.queries.connectors;
  const { getLogtoConnectorById, getLogtoConnectors, getLogtoConnectorByTargetAndPlatform } =
    tenant.connectors;
  const {
    quota,
    signInExperiences: { removeUnavailableSocialConnectorTargets },
  } = tenant.libraries;

  router.post(
    '/connectors',
    koaGuard({
      body: Connectors.createGuard
        .pick({
          config: true,
          connectorId: true,
          metadata: true,
          syncProfile: true,
          enableTokenStorage: true,
        })
        /* 
          Currently the id can not be locked until the connector is successfully created.
          Some connectors providers require a pre-generated id to complete the configuration at the IdP side.
          Logto connector creation process currently has a hard dependency on the provider's config data.
          A optional pre-generated id from the client side is required to complete the connector creation process.
        */
        .merge(Connectors.createGuard.pick({ id: true }).partial()),
      response: connectorResponseGuard,
      status: [200, 400, 403, 422],
    }),
    // eslint-disable-next-line complexity
    async (ctx, next) => {
      const {
        body: { id: proposedId, connectorId, metadata, config, syncProfile, enableTokenStorage },
      } = ctx.guard;

      const connectorFactories = await loadConnectorFactories();

      const connectorFactory = connectorFactories.find(
        ({ metadata: { id } }) => id === connectorId && !demoConnectorIds.includes(id)
      );

      if (!connectorFactory) {
        throw new RequestError({
          code: 'connector.not_found_with_connector_id',
          status: 422,
        });
      }

      await guardConnectorsQuota(connectorFactory, quota);

      if (connectorFactory.type === ConnectorType.Social) {
        assertThat(
          connectorFactory.metadata.isStandard !== true || Boolean(metadata?.target),
          'connector.should_specify_target'
        );

        assertThat(
          connectorFactory.metadata.isStandard === true || metadata === undefined,
          'connector.cannot_overwrite_metadata_for_non_standard_connector'
        );

        const { count } = await countConnectorByConnectorId(connectorId);
        assertThat(
          count === 0 || connectorFactory.metadata.isStandard === true,
          new RequestError({
            code: 'connector.multiple_instances_not_supported',
            status: 422,
          })
        );

        const duplicateConnector = await getLogtoConnectorByTargetAndPlatform(
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          metadata?.target || connectorFactory.metadata.target,
          connectorFactory.metadata.platform
        );
        assertThat(
          !duplicateConnector,
          new RequestError(
            {
              code: 'connector.multiple_target_with_same_platform',
              status: 422,
            },
            {
              connectorId: duplicateConnector?.metadata.id,
              connectorName: duplicateConnector?.metadata.name,
            }
          )
        );
      }

      if (config) {
        validateConfig(config, connectorFactory.configGuard);
      }

      if (enableTokenStorage) {
        assertThat(
          EnvSet.values.secretVaultKek,
          new RequestError({
            code: 'request.feature_not_supported',
            status: 422,
          })
        );

        assertThat(
          connectorFactory.type === ConnectorType.Social &&
            connectorFactory.metadata.isTokenStorageSupported,
          new RequestError({
            code: 'connector.token_storage_not_supported',
            status: 422,
          })
        );
      }

      const insertConnectorId = proposedId ?? generateStandardShortId();

      await insertConnector({
        id: insertConnectorId,
        connectorId,
        ...cleanDeep({ syncProfile, config, metadata, enableTokenStorage }),
      });

      /**
       * We can have only one working email/sms connector:
       * once we insert a new one, old connectors with same type should be deleted.
       * TODO: should using transaction to ensure the atomicity of the operation. LOG-7260
       */
      if (passwordlessConnector.has(connectorFactory.type)) {
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

        captureEvent(
          { tenantId: tenant.id, request: ctx.req },
          ProductEvent.PasswordlessConnectorUpdated,
          pickFactoryProperties(connectorFactory)
        );
      } else {
        captureEvent(
          { tenantId: tenant.id, request: ctx.req },
          ProductEvent.SocialConnectorCreated,
          pickFactoryProperties(connectorFactory)
        );
      }

      const connector = await getLogtoConnectorById(insertConnectorId);
      ctx.body = await transpileLogtoConnector(connector, buildExtraInfo(connector.metadata));

      return next();
    }
  );

  router.get(
    '/connectors',
    koaGuard({
      query: object({
        target: string().optional(),
      }),
      response: connectorResponseGuard.array(),
      status: [200, 400],
    }),
    async (ctx, next) => {
      const { target: filterTarget } = ctx.query;
      const connectors = await getLogtoConnectors();

      checkSocialConnectorTargetAndPlatformUniqueness(connectors);

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

      ctx.body = await Promise.all(
        filteredConnectors.map(async (connector) =>
          transpileLogtoConnector(connector, buildExtraInfo(connector.metadata))
        )
      );

      return next();
    }
  );

  router.get(
    '/connectors/:id',
    koaGuard({
      params: object({ id: string().min(1) }),
      response: connectorResponseGuard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;
      const connector = await getLogtoConnectorById(id);

      // Hide demo connector
      assertThat(!demoConnectorIds.includes(connector.metadata.id), 'connector.not_found');

      ctx.body = await transpileLogtoConnector(connector, buildExtraInfo(connector.metadata));

      return next();
    }
  );

  router.patch(
    '/connectors/:id',
    koaGuard({
      params: object({ id: string().min(1) }),
      body: Connectors.createGuard
        .pick({ config: true, metadata: true, syncProfile: true, enableTokenStorage: true })
        .partial(),
      response: connectorResponseGuard,
      status: [200, 400, 404, 422],
    }),
    // eslint-disable-next-line complexity
    async (ctx, next) => {
      const {
        params: { id },
        body: { config, metadata, syncProfile, enableTokenStorage },
      } = ctx.guard;

      const { type, validateConfig, metadata: originalMetadata } = await getLogtoConnectorById(id);

      // Cannot modify demo connector
      assertThat(!demoConnectorIds.includes(originalMetadata.id), 'connector.not_found');

      assertThat(
        originalMetadata.isStandard !== true ||
          !metadata ||
          metadata.target === originalMetadata.target,
        'connector.can_not_modify_target'
      );

      assertThat(
        originalMetadata.isStandard === true || !metadata,
        'connector.cannot_overwrite_metadata_for_non_standard_connector'
      );

      if (syncProfile) {
        assertThat(
          type === ConnectorType.Social,
          new RequestError({ code: 'connector.invalid_type_for_syncing_profile', status: 422 })
        );
      }

      if (enableTokenStorage) {
        assertThat(
          EnvSet.values.secretVaultKek,
          new RequestError({
            code: 'request.feature_not_supported',
            status: 422,
          })
        );

        assertThat(
          type === ConnectorType.Social && originalMetadata.isTokenStorageSupported,
          new RequestError({
            code: 'connector.token_storage_not_supported',
            status: 422,
          })
        );
      }

      if (config) {
        validateConfig(config);
      }

      if (
        type === ConnectorType.Social &&
        originalMetadata.isTokenStorageSupported &&
        enableTokenStorage === false
      ) {
        // Delete all stored tokens when disabling token storage.
        await tenant.queries.secrets.deleteTokenSetSecretsBySocialConnectorId(id);
      }

      await updateConnector({
        set: {
          /**
           * `JsonObject` has all non-undefined values, and `cleanDeep` method with default settings
           * drops all keys with undefined values, the return type of `Partial<JsonObject>` is still `JsonObject`.
           * The type inference failed to infer this, manually assign type `JsonObject`.
           */
          // eslint-disable-next-line no-restricted-syntax
          config: conditional(config && (cleanDeep(config) as JsonObject)),
          metadata: conditional(metadata && cleanDeep(metadata)),
          syncProfile,
          enableTokenStorage,
        },
        where: { id },
        jsonbMode: 'replace',
      });

      const connector = await getLogtoConnectorById(id);
      ctx.body = await transpileLogtoConnector(connector, buildExtraInfo(connector.metadata));

      return next();
    }
  );

  router.delete(
    // eslint-disable-next-line max-lines -- refactor later
    '/connectors/:id',
    koaGuard({ params: object({ id: string().min(1) }), status: [204, 404] }),
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
        captureEvent(
          { tenantId: tenant.id, request: ctx.req },
          ProductEvent.SocialConnectorDeleted,
          pickFactoryProperties(connectorFactory)
        );
      }

      ctx.status = 204;

      return next();
    }
  );

  connectorConfigTestingRoutes(router, tenant);
  connectorAuthorizationUriRoutes(router, tenant);
  connectorFactoryRoutes(router, tenant);
}
