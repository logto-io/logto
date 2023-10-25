import { SsoConnectors } from '@logto/schemas';
import { generateStandardShortId } from '@logto/shared';
import { conditional } from '@silverhand/essentials';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import { ssoConnectorFactories } from '#src/sso/index.js';
import { SsoProviderName } from '#src/sso/types/index.js';
import { tableToPathname } from '#src/utils/SchemaRouter.js';

import { type AuthedRouter, type RouterInitArgs } from '../types.js';

import {
  connectorFactoriesResponseGuard,
  type ConnectorFactoryDetail,
  ssoConnectorCreateGuard,
  ssoConnectorWithProviderConfigGuard,
  ssoConnectorPatchGuard,
} from './type.js';
import {
  parseFactoryDetail,
  isSupportedSsoProvider,
  parseConnectorConfig,
  fetchConnectorProviderDetails,
} from './utils.js';

export default function singleSignOnRoutes<T extends AuthedRouter>(...args: RouterInitArgs<T>) {
  const [
    router,
    {
      queries: { ssoConnectors },
    },
  ] = args;

  const pathname = `/${tableToPathname(SsoConnectors.table)}`;

  /*
    Get all supported single sign on connector factory details
    - standardConnectors: OIDC, SAML, etc.
    - providerConnectors: Google, Okta, etc.
  */
  router.get(
    '/sso-connector-factories',
    koaGuard({
      response: connectorFactoriesResponseGuard,
      status: [200],
    }),
    async (ctx, next) => {
      const { locale } = ctx;
      const factories = Object.values(ssoConnectorFactories);
      const standardConnectors = new Set<ConnectorFactoryDetail>();
      const providerConnectors = new Set<ConnectorFactoryDetail>();

      for (const factory of factories) {
        if ([SsoProviderName.OIDC].includes(factory.providerName)) {
          standardConnectors.add(parseFactoryDetail(factory, locale));
        } else {
          providerConnectors.add(parseFactoryDetail(factory, locale));
        }
      }

      ctx.body = {
        standardConnectors: [...standardConnectors],
        providerConnectors: [...providerConnectors],
      };

      return next();
    }
  );

  /* Create a new single sign on connector */
  router.post(
    pathname,
    koaGuard({
      body: ssoConnectorCreateGuard,
      response: SsoConnectors.guard,
      status: [200, 422],
    }),
    async (ctx, next) => {
      const { body } = ctx.guard;
      const { providerName, connectorName, config, ...rest } = body;

      // TODO: @simeng-li new SSO error code
      if (!isSupportedSsoProvider(providerName)) {
        throw new RequestError({
          code: 'connector.not_found',
          type: providerName,
          status: 422,
        });
      }

      /* 
        Validate the connector config if it's provided.
        Allow partial config DB insert
       */
      const parsedConfig = parseConnectorConfig(providerName, config);
      const connectorId = generateStandardShortId();

      const connector = await ssoConnectors.insert({
        id: connectorId,
        providerName,
        connectorName,
        ...conditional(config && { config: parsedConfig }),
        ...rest,
      });

      ctx.body = connector;

      return next();
    }
  );

  /* Get all single sign on connectors */
  router.get(
    pathname,
    koaGuard({
      response: ssoConnectorWithProviderConfigGuard.array(),
      status: [200],
    }),
    async (ctx, next) => {
      // Query all connectors
      const entities = await ssoConnectors.findAll();

      // Fetch provider details for each connector
      const connectorsWithProviderDetails = await Promise.all(
        entities.map(async (connector) => fetchConnectorProviderDetails(connector))
      );

      // Filter out unsupported connectors
      ctx.body = connectorsWithProviderDetails.filter(Boolean);

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
      const { id } = ctx.guard.params;

      // Fetch the connector
      const connector = await ssoConnectors.findById(id);

      // Fetch provider details for the connector
      const connectorWithProviderDetails = await fetchConnectorProviderDetails(connector);

      // Return 404 if the connector is not found
      if (!connectorWithProviderDetails) {
        throw new RequestError({
          code: 'connector.not_found',
          status: 404,
        });
      }

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

      // Delete the connector
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
      status: [200, 404, 422],
    }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;
      const { body } = ctx.guard;

      // Fetch the connector
      const originalConnector = await ssoConnectors.findById(id);
      const { providerName } = originalConnector;

      // Return 422 if the connector provider is not supported
      if (!isSupportedSsoProvider(providerName)) {
        throw new RequestError({
          code: 'connector.not_found',
          type: providerName,
          status: 422,
        });
      }

      const { config, ...rest } = body;

      // Validate the connector config if it's provided
      const parsedConfig = parseConnectorConfig(providerName, config);

      // Check if there's any valid update
      const hasValidUpdate = parsedConfig ?? Object.keys(rest).length > 0;

      // Patch update the connector only if there's any valid update
      const connector = hasValidUpdate
        ? await ssoConnectors.updateById(id, {
            ...conditional(parsedConfig && { config: parsedConfig }),
            ...rest,
          })
        : originalConnector;

      // Fetch provider details for the connector
      const connectorWithProviderDetails = await fetchConnectorProviderDetails(connector);

      ctx.body = connectorWithProviderDetails;

      return next();
    }
  );
}
