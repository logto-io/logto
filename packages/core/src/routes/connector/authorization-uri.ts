import { notImplemented } from '@logto/cli/lib/connector/consts.js';
import { ConnectorType } from '@logto/connector-kit';
import { object, string } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';

import { type ManagementApiRouter, type RouterInitArgs } from '../types.js';

export default function connectorAuthorizationUriRoutes<T extends ManagementApiRouter>(
  ...[router, tenant]: RouterInitArgs<T>
) {
  const { getLogtoConnectorById } = tenant.connectors;

  /**
   * Returns the authorization uri of the social platform that bundled with the given social connector.
   * With the returned authorization uri, you can redirect users to the social platform to authenticate.
   * The usage of this API is usually coupled with `POST /users/:userId/identities` to link authenticated
   * social identity to a Logto user.
   *
   * Note: Currently due to technical limitations, this API does not support the following connectors that
   * rely on Logto interaction session: `@logto/apple`, `@logto/connector-saml`, `@logto/connector-oidc`
   * and `@logto/connector-oauth`.
   *
   * @param {string} connectorId - The id of the connector
   * @param {string} state - A random string generated on the client side to prevent CSRF attack
   * @param {string} redirectUri - The uri to navigate back to after authenticated by the social platform
   */
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
