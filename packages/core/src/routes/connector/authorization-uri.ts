import { notImplemented } from '@logto/cli/lib/connector/consts.js';
import { ConnectorType } from '@logto/connector-kit';
import { object, string } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';

import { type AuthedRouter, type RouterInitArgs } from '../types.js';

export default function connectorAuthorizationUriRoutes<T extends AuthedRouter>(
  ...[router, tenant]: RouterInitArgs<T>
) {
  const { getLogtoConnectorById } = tenant.connectors;

  router.post(
    '/connectors/:connectorId/authorization-uri',
    koaGuard({
      params: object({ connectorId: string().min(1) }),
      body: object({ state: string(), redirectUri: string() }),
      response: object({ redirectTo: string().url() }),
      status: [200, 400, 404],
    }),
    async (ctx, next) => {
      const { connectorId } = ctx.guard.params;
      const { state, redirectUri } = ctx.guard.body;
      assertThat(state && redirectUri, 'session.insufficient_info');

      const connector = await getLogtoConnectorById(connectorId);
      assertThat(connector.type === ConnectorType.Social, 'connector.unexpected_type');

      const {
        headers: { 'user-agent': userAgent },
      } = ctx.request;

      const redirectTo = await connector.getAuthorizationUri(
        {
          state,
          redirectUri,
          connectorId,
          connectorFactoryId: connector.metadata.id,
          /**
           * Passing empty jti only works for connectors not relying on session storage.
           * E.g. Google and GitHub
           */
          jti: '',
          headers: { userAgent },
        },
        /**
         * Same as above, passing `notImplemented` only works for connectors not relying on session storage.
         * E.g. Google and GitHub
         */
        notImplemented
      );

      ctx.body = { redirectTo };

      return next();
    }
  );
}
