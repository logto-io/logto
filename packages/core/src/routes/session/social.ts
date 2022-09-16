import { redirectUriRegEx } from '@logto/core-kit';
import { ConnectorType, userInfoSelectFields } from '@logto/schemas';
import pick from 'lodash.pick';
import { Provider } from 'oidc-provider';
import { object, string, unknown } from 'zod';

import { getLogtoConnectorById } from '@/connectors';
import RequestError from '@/errors/RequestError';
import { assignInteractionResults } from '@/lib/session';
import {
  findSocialRelatedUser,
  getUserInfoByAuthCode,
  getUserInfoFromInteractionResult,
} from '@/lib/social';
import { generateUserId, insertUser, updateLastSignInAt } from '@/lib/user';
import koaGuard from '@/middleware/koa-guard';
import {
  hasUserWithIdentity,
  findUserById,
  updateUserById,
  findUserByIdentity,
} from '@/queries/user';
import assertThat from '@/utils/assert-that';
import { maskUserInfo } from '@/utils/format';

import { AnonymousRouter } from '../types';
import { getRoutePrefix } from './utils';

export const registerRoute = getRoutePrefix('register', 'social');
export const signInRoute = getRoutePrefix('sign-in', 'social');

export default function socialRoutes<T extends AnonymousRouter>(router: T, provider: Provider) {
  router.post(
    `${signInRoute}`,
    koaGuard({
      body: object({
        connectorId: string(),
        state: string(),
        redirectUri: string().regex(redirectUriRegEx),
      }),
    }),
    async (ctx, next) => {
      await provider.interactionDetails(ctx.req, ctx.res);
      const { connectorId, state, redirectUri } = ctx.guard.body;
      assertThat(state && redirectUri, 'session.insufficient_info');
      const connector = await getLogtoConnectorById(connectorId);
      assertThat(connector.dbEntry.enabled, 'connector.not_enabled');
      assertThat(connector.type === ConnectorType.Social, 'connector.unexpected_type');
      const redirectTo = await connector.getAuthorizationUri({ state, redirectUri });
      ctx.body = { redirectTo };

      return next();
    }
  );

  router.post(
    `${signInRoute}/auth`,
    koaGuard({
      body: object({
        connectorId: string(),
        data: unknown(),
      }),
    }),
    async (ctx, next) => {
      await provider.interactionDetails(ctx.req, ctx.res);

      const { connectorId, data } = ctx.guard.body;
      const type = 'SignInSocial';
      ctx.log(type, { connectorId, data });
      const {
        metadata: { target },
      } = await getLogtoConnectorById(connectorId);

      const userInfo = await getUserInfoByAuthCode(connectorId, data);
      ctx.log(type, { userInfo });

      if (!(await hasUserWithIdentity(target, userInfo.id))) {
        await assignInteractionResults(
          ctx,
          provider,
          { socialUserInfo: { connectorId, userInfo } },
          true
        );
        const relatedInfo = await findSocialRelatedUser(userInfo);

        throw new RequestError(
          {
            code: 'user.identity_not_exists',
            status: 422,
          },
          relatedInfo && { relatedUser: maskUserInfo(relatedInfo[0]) }
        );
      }

      const { id, identities } = await findUserByIdentity(target, userInfo.id);
      ctx.log(type, { userId: id });

      // Update social connector's user info
      await updateUserById(id, {
        identities: { ...identities, [target]: { userId: userInfo.id, details: userInfo } },
      });
      await updateLastSignInAt(id);
      await assignInteractionResults(ctx, provider, { login: { accountId: id } });

      return next();
    }
  );

  router.post(
    '/session/sign-in/bind-social-related-user',
    koaGuard({
      body: object({ connectorId: string() }),
    }),
    async (ctx, next) => {
      const { result } = await provider.interactionDetails(ctx.req, ctx.res);
      assertThat(result, 'session.connector_session_not_found');

      const { connectorId } = ctx.guard.body;
      const type = 'SignInSocialBind';
      ctx.log(type, { connectorId });
      const {
        metadata: { target },
      } = await getLogtoConnectorById(connectorId);

      const userInfo = await getUserInfoFromInteractionResult(connectorId, result);
      ctx.log(type, { userInfo });

      const relatedInfo = await findSocialRelatedUser(userInfo);
      assertThat(relatedInfo, 'session.connector_session_not_found');

      const { id, identities } = relatedInfo[1];
      ctx.log(type, { userId: id });

      await updateUserById(id, {
        identities: { ...identities, [target]: { userId: userInfo.id, details: userInfo } },
      });
      await updateLastSignInAt(id);
      await assignInteractionResults(ctx, provider, { login: { accountId: id } });

      return next();
    }
  );

  router.post(
    registerRoute,
    koaGuard({
      body: object({
        connectorId: string(),
      }),
    }),
    async (ctx, next) => {
      const { result } = await provider.interactionDetails(ctx.req, ctx.res);
      // User can not register with social directly,
      // need to try to sign in with social first, then confirm to register and continue,
      // so the result is expected to be exists.
      assertThat(result, 'session.connector_session_not_found');

      const { connectorId } = ctx.guard.body;
      const type = 'RegisterSocial';
      ctx.log(type, { connectorId });
      const {
        metadata: { target },
      } = await getLogtoConnectorById(connectorId);

      const userInfo = await getUserInfoFromInteractionResult(connectorId, result);
      ctx.log(type, { userInfo });
      assertThat(!(await hasUserWithIdentity(target, userInfo.id)), 'user.identity_exists');

      const id = await generateUserId();
      await insertUser({
        id,
        name: userInfo.name ?? null,
        avatar: userInfo.avatar ?? null,
        identities: {
          [target]: {
            userId: userInfo.id,
            details: userInfo,
          },
        },
      });
      ctx.log(type, { userId: id });

      await updateLastSignInAt(id);
      await assignInteractionResults(ctx, provider, { login: { accountId: id } });

      return next();
    }
  );

  router.post(
    '/session/bind-social',
    koaGuard({
      body: object({
        connectorId: string(),
      }),
    }),
    async (ctx, next) => {
      const { result } = await provider.interactionDetails(ctx.req, ctx.res);
      assertThat(result, 'session.connector_session_not_found');
      const userId = result.login?.accountId;
      assertThat(userId, 'session.unauthorized');

      const { connectorId } = ctx.guard.body;
      const type = 'RegisterSocialBind';
      ctx.log(type, { connectorId, userId });
      const {
        metadata: { target },
      } = await getLogtoConnectorById(connectorId);

      const userInfo = await getUserInfoFromInteractionResult(connectorId, result);
      ctx.log(type, { userInfo });

      const user = await findUserById(userId);
      const updatedUser = await updateUserById(userId, {
        identities: {
          ...user.identities,
          [target]: { userId: userInfo.id, details: userInfo },
        },
      });

      ctx.body = pick(updatedUser, ...userInfoSelectFields);

      return next();
    }
  );
}
