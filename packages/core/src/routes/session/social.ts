import { validateRedirectUrl } from '@logto/core-kit';
import { ConnectorType, userInfoSelectFields } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import pick from 'lodash.pick';
import type { Provider } from 'oidc-provider';
import { object, string, unknown } from 'zod';

import { getLogtoConnectorById } from '#src/connectors/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import {
  assignInteractionResults,
  getApplicationIdFromInteraction,
} from '#src/libraries/session.js';
import { getSignInExperienceForApplication } from '#src/libraries/sign-in-experience/index.js';
import {
  findSocialRelatedUser,
  getUserInfoByAuthCode,
  getUserInfoFromInteractionResult,
} from '#src/libraries/social.js';
import { generateUserId, insertUser } from '#src/libraries/user.js';
import koaGuard from '#src/middleware/koa-guard.js';
import {
  hasUserWithIdentity,
  findUserById,
  updateUserById,
  findUserByIdentity,
} from '#src/queries/user.js';
import assertThat from '#src/utils/assert-that.js';
import { maskUserInfo } from '#src/utils/format.js';

import type { AnonymousRouterLegacy } from '../types.js';
import { checkRequiredProfile, getRoutePrefix } from './utils.js';

export const registerRoute = getRoutePrefix('register', 'social');
export const signInRoute = getRoutePrefix('sign-in', 'social');

export default function socialRoutes<T extends AnonymousRouterLegacy>(
  router: T,
  provider: Provider
) {
  router.post(
    `${signInRoute}`,
    koaGuard({
      body: object({
        connectorId: string(),
        state: string(),
        redirectUri: string().refine((url) => validateRedirectUrl(url, 'web')),
      }),
    }),
    async (ctx, next) => {
      await provider.interactionDetails(ctx.req, ctx.res);
      const { connectorId, state, redirectUri } = ctx.guard.body;
      assertThat(state && redirectUri, 'session.insufficient_info');
      const connector = await getLogtoConnectorById(connectorId);
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
        dbEntry: { syncProfile },
      } = await getLogtoConnectorById(connectorId);

      const userInfo = await getUserInfoByAuthCode(connectorId, data);
      ctx.log(type, { userInfo });

      const user = await findUserByIdentity(target, userInfo.id);

      // User with identity not found
      if (!user) {
        await assignInteractionResults(
          ctx,
          provider,
          { socialUserInfo: { connectorId, userInfo } },
          true
        );
        const relatedInfo = await findSocialRelatedUser(userInfo);

        throw new RequestError(
          {
            code: 'user.identity_not_exist',
            status: 422,
          },
          relatedInfo && { relatedUser: maskUserInfo(relatedInfo[0]) }
        );
      }

      const { id, identities, isSuspended } = user;
      assertThat(!isSuspended, new RequestError({ code: 'user.suspended', status: 401 }));
      ctx.log(type, { userId: id });

      const { name, avatar } = userInfo;
      const profileUpdate = Object.fromEntries(
        Object.entries({
          name: conditional(syncProfile && name),
          avatar: conditional(syncProfile && avatar),
        }).filter(([_key, value]) => value !== undefined)
      );

      // Update social connector's user info
      await updateUserById(id, {
        identities: { ...identities, [target]: { userId: userInfo.id, details: userInfo } },
        lastSignInAt: Date.now(),
        ...profileUpdate,
      });

      const signInExperience = await getSignInExperienceForApplication(
        await getApplicationIdFromInteraction(ctx, provider)
      );
      await checkRequiredProfile(ctx, provider, user, signInExperience);
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

      const { id, identities, isSuspended } = relatedInfo[1];
      assertThat(!isSuspended, new RequestError({ code: 'user.suspended', status: 401 }));
      ctx.log(type, { userId: id });

      const user = await updateUserById(id, {
        identities: { ...identities, [target]: { userId: userInfo.id, details: userInfo } },
        lastSignInAt: Date.now(),
      });

      const signInExperience = await getSignInExperienceForApplication(
        await getApplicationIdFromInteraction(ctx, provider)
      );
      await checkRequiredProfile(ctx, provider, user, signInExperience);
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
      assertThat(!(await hasUserWithIdentity(target, userInfo.id)), 'user.identity_already_in_use');

      const id = await generateUserId();
      const user = await insertUser({
        id,
        name: userInfo.name ?? null,
        avatar: userInfo.avatar ?? null,
        identities: {
          [target]: {
            userId: userInfo.id,
            details: userInfo,
          },
        },
        lastSignInAt: Date.now(),
      });
      ctx.log(type, { userId: id });

      const signInExperience = await getSignInExperienceForApplication(
        await getApplicationIdFromInteraction(ctx, provider)
      );
      await checkRequiredProfile(ctx, provider, user, signInExperience);
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
