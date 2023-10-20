import koaGuard from '#src/middleware/koa-guard.js';
import { ssoConnectorFactories } from '#src/sso/index.js';
import { SsoProviderName } from '#src/sso/types/index.js';

import { type AuthedRouter, type RouterInitArgs } from '../types.js';

import { connectorFactoriesResponseGuard, type ConnectorFactoryDetail } from './type.js';
import { parseFactoryDetail } from './utils.js';

export default function singleSignOnRoutes<T extends AuthedRouter>(...args: RouterInitArgs<T>) {
  const [originalRouter] = args;

  originalRouter.get(
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
}
