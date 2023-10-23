import { generateStandardShortId } from '@logto/shared';
import { conditional } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import { ssoConnectorFactories } from '#src/sso/index.js';
import { SsoProviderName } from '#src/sso/types/index.js';

import { type AuthedRouter, type RouterInitArgs } from '../types.js';

import {
  connectorFactoriesResponseGuard,
  type ConnectorFactoryDetail,
  ssoConnectorCreateGuard,
} from './type.js';
import { parseFactoryDetail, isSupportedSsoProvider } from './utils.js';

export default function singleSignOnRoutes<T extends AuthedRouter>(...args: RouterInitArgs<T>) {
  const [
    router,
    {
      queries: { ssoConnectors },
    },
  ] = args;

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

  router.post(
    '/sso-connectors',
    koaGuard({
      body: ssoConnectorCreateGuard,
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
}
