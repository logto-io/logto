import { SsoConnectors, jsonObjectGuard } from '@logto/schemas';
import { generateStandardShortId } from '@logto/shared';
import { conditional, assert } from '@silverhand/essentials';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import { ssoConnectorFactories } from '#src/sso/index.js';
import { SsoProviderName, type SupportedSsoConnector } from '#src/sso/types/index.js';
import { isSupportedSsoProvider, isSupportedSsoConnector } from '#src/sso/utils.js';
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

      // Return 422 if the connector provider is not supported
      if (!isSupportedSsoProvider(providerName)) {
        throw new RequestError({
          code: 'connector.not_found',
          type: providerName,
          status: 422,
        });
      }

      /* 
        Validate the connector config if it's provided.
        Allow partial config settings on create.
       */
      const parsedConfig = config && parseConnectorConfig(providerName, config, true);
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
      const [_, entities] = await ssoConnectors.findAll();

      // Filter out unsupported connectors
      const filerSupportedConnectors = entities.filter(
        (connector): connector is SupportedSsoConnector => isSupportedSsoConnector(connector)
      );

      // Fetch provider details for each connector
      const connectorsWithProviderDetails = await Promise.all(
        filerSupportedConnectors.map(async (connector) => fetchConnectorProviderDetails(connector))
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
      const { id } = ctx.guard.params;

      const connector = await ssoConnectors.findById(id);

      // Return 404 if the connector is not supported
      assert(
        isSupportedSsoConnector(connector),
        new RequestError({
          code: 'connector.not_found',
          status: 404,
        })
      );

      // Fetch provider details for the connector
      const connectorWithProviderDetails = await fetchConnectorProviderDetails(connector);

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
      status: [200, 404, 422],
    }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;
      const { body } = ctx.guard;

      const originalConnector = await ssoConnectors.findById(id);

      assert(
        isSupportedSsoConnector(originalConnector),
        new RequestError({ code: 'connector.not_found', status: 404 })
      );

      const { providerName } = originalConnector;
      const { config, ...rest } = body;

      // Validate the connector config if it's provided
      const parsedConfig = config && parseConnectorConfig(providerName, config);

      // Check if there's any valid update
      const hasValidUpdate = parsedConfig ?? Object.keys(rest).length > 0;

      // Patch update the connector only if there's any valid update
      const connector = hasValidUpdate
        ? await ssoConnectors.updateById(id, {
            ...conditional(parsedConfig && { config: parsedConfig }),
            ...rest,
          })
        : originalConnector;

      // Make the typescript happy
      assert(
        isSupportedSsoConnector(connector),
        new RequestError({ code: 'connector.not_found', status: 404 })
      );

      const connectorWithProviderDetails = await fetchConnectorProviderDetails(connector);

      ctx.body = connectorWithProviderDetails;

      return next();
    }
  );

  /* Patch update a single sign on connector's config by id */
  router.patch(
    `${pathname}/:id/config`,
    koaGuard({
      params: z.object({ id: z.string().min(1) }),
      body: jsonObjectGuard,
      response: ssoConnectorWithProviderConfigGuard,
      status: [200, 404, 422],
    }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;
      const { body } = ctx.guard;

      const originalConnector = await ssoConnectors.findById(id);

      // Return 404 if the connector provider is not supported
      assert(
        isSupportedSsoConnector(originalConnector),
        new RequestError({ code: 'connector.not_found', status: 404 })
      );

      const { providerName, config } = originalConnector;

      // Merge with existing config and revalidate
      const parsedConfig = parseConnectorConfig(providerName, {
        ...config,
        ...body,
      });

      const connector = await ssoConnectors.updateById(id, {
        config: parsedConfig,
      });

      // Make the typescript happy
      assert(
        isSupportedSsoConnector(connector),
        new RequestError({ code: 'connector.not_found', status: 404 })
      );

      // Fetch provider details for the connector
      const connectorWithProviderDetails = await fetchConnectorProviderDetails(connector);

      ctx.body = connectorWithProviderDetails;

      return next();
    }
  );
}
