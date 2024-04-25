import {
  SsoConnectors,
  ssoConnectorProvidersResponseGuard,
  ssoConnectorWithProviderConfigGuard,
} from '@logto/schemas';
import { generateStandardShortId } from '@logto/shared';
import { conditional, assert } from '@silverhand/essentials';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import koaQuotaGuard from '#src/middleware/koa-quota-guard.js';
import { ssoConnectorCreateGuard, ssoConnectorPatchGuard } from '#src/routes/sso-connector/type.js';
import { ssoConnectorFactories } from '#src/sso/index.js';
import { isSupportedSsoProvider, isSupportedSsoConnector } from '#src/sso/utils.js';
import { tableToPathname } from '#src/utils/SchemaRouter.js';
import assertThat from '#src/utils/assert-that.js';

import { type ManagementApiRouter, type RouterInitArgs } from '../types.js';

import {
  parseFactoryDetail,
  parseConnectorConfig,
  fetchConnectorProviderDetails,
  validateConnectorDomains,
  validateConnectorConfigConnectionStatus,
} from './utils.js';

export default function singleSignOnConnectorsRoutes<T extends ManagementApiRouter>(
  ...args: RouterInitArgs<T>
) {
  const [
    router,
    {
      id: tenantId,
      queries: { ssoConnectors },
      libraries: {
        quota,
        ssoConnectors: { getSsoConnectorById, getSsoConnectors },
      },
    },
  ] = args;

  const pathname = `/${tableToPathname(SsoConnectors.table)}`;

  /*
    Get all supported single sign on connector provider details
    - standardConnectors: OIDC, SAML, etc.
    - providerConnectors: Google, Okta, etc.
  */
  router.get(
    '/sso-connector-providers',
    koaGuard({
      response: ssoConnectorProvidersResponseGuard,
      status: [200],
    }),
    async (ctx, next) => {
      const { locale } = ctx;
      const factories = Object.values(ssoConnectorFactories);

      ctx.body = factories.map((factory) => parseFactoryDetail(factory, locale));

      return next();
    }
  );

  /* Create a new single sign on connector */
  router.post(
    pathname,
    koaQuotaGuard({ key: 'ssoEnabled', quota }),
    koaGuard({
      body: ssoConnectorCreateGuard,
      response: SsoConnectors.guard,
      status: [200, 400, 409, 422],
    }),
    async (ctx, next) => {
      const { body } = ctx.guard;
      const { providerName, connectorName, config, domains, ...rest } = body;

      // Return 422 if the connector provider is not supported
      if (!isSupportedSsoProvider(providerName)) {
        throw new RequestError({
          code: 'connector.not_found',
          type: providerName,
          status: 422,
        });
      }

      // Validate the connector domains if it's provided
      if (domains) {
        validateConnectorDomains(domains);
      }

      // Validate the connector config if it's provided
      const parsedConfig = config && parseConnectorConfig(providerName, config);

      // Validate the connector name is unique
      if (connectorName) {
        const duplicateConnector = await ssoConnectors.findByConnectorName(connectorName);
        assertThat(!duplicateConnector, 'single_sign_on.duplicate_connector_name', 409);
      }

      const connectorId = generateStandardShortId();

      // Check the connection status of the connector config if it's provided
      if (parsedConfig) {
        await validateConnectorConfigConnectionStatus(
          {
            id: connectorId,
            providerName,
            config: parsedConfig,
          },
          tenantId
        );
      }

      const connector = await ssoConnectors.insert({
        id: connectorId,
        providerName,
        connectorName,
        ...conditional(config && { config: parsedConfig }),
        ...conditional(domains && { domains }),
        ...rest,
      });

      ctx.body = connector;

      return next();
    }
  );

  /* Get all single sign on connectors */
  router.get(
    pathname,
    koaPagination({ isOptional: true }),
    koaGuard({
      response: ssoConnectorWithProviderConfigGuard.array(),
      status: [200],
    }),
    async (ctx, next) => {
      const { limit, offset, disabled: paginationDisabled } = ctx.pagination;
      const [totalCount, connectors] = paginationDisabled
        ? await getSsoConnectors()
        : await getSsoConnectors(limit, offset);
      ctx.pagination.totalCount = totalCount;

      // Fetch provider details for each connector
      const connectorsWithProviderDetails = await Promise.all(
        connectors.map(async (connector) =>
          fetchConnectorProviderDetails(connector, tenantId, ctx.locale)
        )
      );

      ctx.body = connectorsWithProviderDetails;

      return next();
    }
  );

  /* Get a single sign on connector by id */
  router.get(
    `${pathname}/:id`,
    koaGuard({
      params: z.object({ id: z.string().min(1) }),
      response: ssoConnectorWithProviderConfigGuard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      const {
        guard: {
          params: { id },
        },
        locale,
      } = ctx;

      const connector = await getSsoConnectorById(id);

      // Fetch provider details for the connector
      const connectorWithProviderDetails = await fetchConnectorProviderDetails(
        connector,
        tenantId,
        locale
      );

      ctx.body = connectorWithProviderDetails;

      return next();
    }
  );

  /* Delete a single sign on connector by id */
  router.delete(
    `${pathname}/:id`,
    koaGuard({
      params: z.object({ id: z.string().min(1) }),
      status: [204, 404],
    }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;

      await ssoConnectors.deleteById(id);
      ctx.status = 204;
      return next();
    }
  );

  /* Patch update a single sign on connector by id */
  router.patch(
    `${pathname}/:id`,
    koaGuard({
      params: z.object({ id: z.string().min(1) }),
      body: ssoConnectorPatchGuard,
      response: ssoConnectorWithProviderConfigGuard,
      status: [200, 400, 404, 409, 422],
    }),
    async (ctx, next) => {
      const {
        guard: {
          body,
          params: { id },
        },
        locale,
      } = ctx;

      const originalConnector = await getSsoConnectorById(id);
      const { providerName } = originalConnector;
      const { config, domains, ...rest } = body;

      // Validate the connector domains if it's provided
      if (domains) {
        validateConnectorDomains(domains);
      }

      // Validate the connector name is unique
      if (rest.connectorName) {
        const duplicateConnector = await ssoConnectors.findByConnectorName(rest.connectorName);
        // Should not block the update of the current connector.
        assertThat(
          !duplicateConnector || duplicateConnector.id === id,
          'single_sign_on.duplicate_connector_name',
          409
        );
      }

      // Validate the connector config if it's provided
      const parsedConfig = config && parseConnectorConfig(providerName, config);

      // Check the connection status of the connector config if it's provided
      if (parsedConfig) {
        await validateConnectorConfigConnectionStatus(
          {
            id,
            providerName,
            config: parsedConfig,
          },
          tenantId
        );
      }

      // Check if there's any valid update
      const hasValidUpdate = parsedConfig ?? Object.keys(rest).length > 0;

      // Patch update the connector only if there's any valid update
      const connector = hasValidUpdate
        ? await ssoConnectors.updateById(id, {
            ...conditional(parsedConfig && { config: parsedConfig }),
            ...conditional(domains && { domains }),
            ...rest,
          })
        : originalConnector;

      // Make the typescript happy
      assert(
        isSupportedSsoConnector(connector),
        new RequestError({ code: 'connector.not_found', status: 404 })
      );

      const connectorWithProviderDetails = await fetchConnectorProviderDetails(
        connector,
        tenantId,
        locale
      );

      ctx.body = connectorWithProviderDetails;

      return next();
    }
  );
}
