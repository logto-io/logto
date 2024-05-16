import { notImplemented } from '@logto/cli/lib/connector/index.js';
import { ConnectorType } from '@logto/schemas';
import { has } from '@silverhand/essentials';
import { object, record, string, unknown } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';
import { transpileLogtoConnector } from '#src/utils/connectors/index.js';

import type { RouterInitArgs } from '../routes/types.js';

import type { AuthedMeRouter } from './types.js';

/**
 * This social API route is meant for linking social accounts in Logto Cloud AC.
 * Thus it does NOT support connectors rely on the session (jti based) storage. E.g. Apple connector and all standard connectors.
 * This is because Logto Cloud AC only supports Google and GitHub social sign-in, both of which do not rely on session storage.
 */
export default function socialRoutes<T extends AuthedMeRouter>(
  ...[router, tenant]: RouterInitArgs<T>
) {
  const {
    queries: {
      users: { findUserById, deleteUserIdentity, hasUserWithIdentity },
      signInExperiences: { findDefaultSignInExperience },
    },
    libraries: {
      users: { updateUserById },
    },
    connectors: { getLogtoConnectors, getLogtoConnectorById },
  } = tenant;

  router.get('/social/connectors', async (ctx, next) => {
    const connectors = await getLogtoConnectors();
    const { socialSignInConnectorTargets } = await findDefaultSignInExperience();

    ctx.body = await Promise.all(
      connectors
        .filter(
          ({ type, metadata: { target } }) =>
            type === ConnectorType.Social && socialSignInConnectorTargets.includes(target)
        )
        .map(async (connector) => transpileLogtoConnector(connector))
    );

    return next();
  });

  router.post(
    '/social/authorization-uri',
    koaGuard({
      body: object({ connectorId: string(), state: string(), redirectUri: string() }),
    }),
    async (ctx, next) => {
      const { connectorId, state, redirectUri } = ctx.guard.body;
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

  router.post(
    '/social/link-identity',
    koaGuard({
      body: object({
        connectorId: string(),
        connectorData: record(string(), unknown()),
      }),
    }),
    async (ctx, next) => {
      const { id: userId } = ctx.auth;
      const { connectorId, connectorData } = ctx.guard.body;

      const [connector, user] = await Promise.all([
        getLogtoConnectorById(connectorId),
        findUserById(userId),
      ]);

      assertThat(
        connector.type === ConnectorType.Social,
        new RequestError({
          code: 'session.invalid_connector_id',
          status: 422,
          connectorId,
        })
      );

      const { target } = connector.metadata;

      /**
       * Same as above, passing `notImplemented` only works for connectors not relying on session storage.
       * E.g. Google and GitHub
       */
      const socialUserInfo = await connector.getUserInfo(connectorData, notImplemented);

      assertThat(
        !(await hasUserWithIdentity(target, socialUserInfo.id, userId)),
        new RequestError({
          code: 'user.identity_already_in_use',
          status: 422,
        })
      );

      await updateUserById(userId, {
        identities: {
          ...user.identities,
          [target]: {
            userId: socialUserInfo.id,
            details: socialUserInfo,
          },
        },
      });

      ctx.status = 204;

      return next();
    }
  );

  router.delete(
    '/social/identity/:connectorId',
    koaGuard({
      params: object({
        connectorId: string(),
      }),
    }),
    async (ctx, next) => {
      const { id: userId } = ctx.auth;
      const { connectorId } = ctx.guard.params;

      const [connector, user] = await Promise.all([
        getLogtoConnectorById(connectorId),
        findUserById(userId),
      ]);

      const { target } = connector.metadata;

      assertThat(
        has(user.identities, target),
        new RequestError({ code: 'user.identity_not_exist', status: 404 })
      );

      await deleteUserIdentity(userId, target);

      ctx.status = 204;

      return next();
    }
  );
}
