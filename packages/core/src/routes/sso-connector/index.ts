import { SsoConnectors } from '@logto/schemas';
import { generateStandardShortId } from '@logto/shared';
import { conditional } from '@silverhand/essentials';

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
} from './type.js';
import {
  parseFactoryDetail,
  isSupportedSsoProvider,
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

  /**
   * Get all supported single sign on connector factory details
   *
   * - standardConnectors: OIDC, SAML, etc.
   * - providerConnectors: Google, Okta, etc.
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

      const factory = ssoConnectorFactories[providerName];

      /* 
        Validate the connector config if it's provided.
        Allow partial config DB insert
       */
      const parseConfig = () => {
        if (!config) {
          return;
        }

        const result = factory.configGuard.partial().safeParse(config);

        if (!result.success) {
          throw new RequestError({
            code: 'connector.invalid_config',
            status: 422,
            details: result.error.flatten(),
          });
        }

        return result.data;
      };

      const parsedConfig = parseConfig();
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
}
