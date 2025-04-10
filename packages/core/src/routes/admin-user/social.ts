import { notImplemented } from '@logto/cli/lib/connector/consts.js';
import {
  ConnectorType,
  identityGuard,
  identitiesGuard,
  userProfileResponseGuard,
} from '@logto/schemas';
import { has } from '@silverhand/essentials';
import { object, record, string, unknown } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';

import { transpileUserProfileResponse } from '../../utils/user.js';
import type { ManagementApiRouter, RouterInitArgs } from '../types.js';

export default function adminUserSocialRoutes<T extends ManagementApiRouter>(
  ...[router, tenant]: RouterInitArgs<T>
) {
  const {
    queries: {
      users: { findUserById, updateUserById, hasUserWithIdentity, deleteUserIdentity },
    },
    connectors: { getLogtoConnectorById },
  } = tenant;

  router.put(
    '/users/:userId/identities/:target',
    koaGuard({
      params: object({ userId: string(), target: string() }),
      body: identityGuard,
      response: identitiesGuard,
      status: [200, 201, 404, 422],
    }),
    async (ctx, next) => {
      const {
        params: { userId, target },
        body: identity,
      } = ctx.guard;

      const user = await findUserById(userId);

      assertThat(
        !(await hasUserWithIdentity(target, identity.userId, userId)),
        new RequestError({
          code: 'user.identity_already_in_use',
          status: 422,
        })
      );

      // The identity is being created if the `target` does not exist in the user's identities.
      if (!(target in user.identities)) {
        ctx.status = 201;
      }

      const updatedUser = await updateUserById(userId, {
        identities: {
          ...user.identities,
          [target]: identity,
        },
      });

      ctx.body = updatedUser.identities;

      return next();
    }
  );

  router.post(
    '/users/:userId/identities',
    koaGuard({
      params: object({ userId: string() }),
      body: object({
        connectorId: string(),
        connectorData: record(string(), unknown()),
      }),
      response: identitiesGuard,
      status: [200, 404, 422],
    }),
    async (ctx, next) => {
      const {
        params: { userId },
        body: { connectorId, connectorData },
      } = ctx.guard;

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

      const updatedUser = await updateUserById(userId, {
        identities: {
          ...user.identities,
          [target]: {
            userId: socialUserInfo.id,
            details: socialUserInfo,
          },
        },
      });

      ctx.body = updatedUser.identities;

      return next();
    }
  );

  router.delete(
    '/users/:userId/identities/:target',
    koaGuard({
      params: object({ userId: string(), target: string() }),
      response: userProfileResponseGuard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      const {
        params: { userId, target },
      } = ctx.guard;

      const { identities } = await findUserById(userId);

      if (!has(identities, target)) {
        throw new RequestError({ code: 'user.identity_not_exist', status: 404 });
      }

      const updatedUser = await deleteUserIdentity(userId, target);
      ctx.body = transpileUserProfileResponse(updatedUser);

      return next();
    }
  );
}
