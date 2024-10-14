import {
  SsoConnectors,
  SsoConnectorIdpInitiatedAuthConfigs,
  SsoProviderType,
} from '@logto/schemas';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import { ssoConnectorFactories } from '#src/sso/index.js';
import { tableToPathname } from '#src/utils/SchemaRouter.js';

import assertThat from '../../utils/assert-that.js';
import { type ManagementApiRouter, type RouterInitArgs } from '../types.js';

export default function ssoConnectorIdpInitiatedAuthConfigRoutes<T extends ManagementApiRouter>(
  ...args: RouterInitArgs<T>
) {
  const [
    router,
    {
      queries,
      libraries: {
        ssoConnectors: { getSsoConnectorById, createSsoConnectorIdpInitiatedAuthConfig },
      },
    },
  ] = args;

  const pathPrefix = `/${tableToPathname(SsoConnectors.table)}/:id/idp-initiated-auth-config`;

  router.put(
    pathPrefix,
    koaGuard({
      body: SsoConnectorIdpInitiatedAuthConfigs.createGuard.pick({
        defaultApplicationId: true,
        redirectUri: true,
        authParameters: true,
      }),
      params: z.object({ id: z.string().min(1) }),
      response: SsoConnectorIdpInitiatedAuthConfigs.guard,
      status: [200, 400, 404],
    }),
    async (ctx, next) => {
      const {
        body,
        params: { id },
      } = ctx.guard;

      // Throws an 404 error if the connector is not found
      const { providerName } = await getSsoConnectorById(id);
      const { providerType } = ssoConnectorFactories[providerName];

      assertThat(
        providerType === SsoProviderType.SAML,
        new RequestError('connector.saml_only_idp_initiated_auth')
      );

      const config = await createSsoConnectorIdpInitiatedAuthConfig({
        connectorId: id,
        ...body,
      });

      ctx.body = config;
      ctx.status = 200;

      return next();
    }
  );

  router.get(
    pathPrefix,
    koaGuard({
      params: z.object({ id: z.string().min(1) }),
      response: SsoConnectorIdpInitiatedAuthConfigs.guard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;

      const configs = await queries.ssoConnectors.getIdpInitiatedAuthConfigByConnectorId(id);

      assertThat(
        configs,
        new RequestError({
          code: 'entity.not_found',
          status: 404,
        })
      );

      ctx.body = configs;
      ctx.status = 200;

      return next();
    }
  );

  router.delete(
    pathPrefix,
    koaGuard({
      params: z.object({ id: z.string().min(1) }),
      status: [204, 404],
    }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;

      await queries.ssoConnectors.deleteIdpInitiatedAuthConfigByConnectorId(id);

      ctx.status = 204;

      return next();
    }
  );
}
