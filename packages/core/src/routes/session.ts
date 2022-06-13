/* eslint-disable max-lines */
import path from 'path';

import { LogtoErrorCode } from '@logto/phrases';
import { PasscodeType, userInfoSelectFields } from '@logto/schemas';
import {
  redirectUriRegEx,
  emailRegEx,
  passwordRegEx,
  phoneRegEx,
  usernameRegEx,
} from '@logto/shared';
import { conditional } from '@silverhand/essentials';
import pick from 'lodash.pick';
import { Provider } from 'oidc-provider';
import { object, string, unknown } from 'zod';

import { getConnectorInstanceById, getSocialConnectorInstanceById } from '@/connectors';
import RequestError from '@/errors/RequestError';
import { createPasscode, sendPasscode, verifyPasscode } from '@/lib/passcode';
import { assignInteractionResults, saveUserFirstConsentedAppId } from '@/lib/session';
import {
  findSocialRelatedUser,
  getUserInfoByAuthCode,
  getUserInfoFromInteractionResult,
} from '@/lib/social';
import {
  encryptUserPassword,
  generateUserId,
  findUserByUsernameAndPassword,
  updateLastSignInAt,
} from '@/lib/user';
import koaGuard from '@/middleware/koa-guard';
import {
  hasUserWithEmail,
  hasUserWithPhone,
  hasUser,
  hasUserWithIdentity,
  insertUser,
  findUserById,
  updateUserById,
  findUserByEmail,
  findUserByPhone,
  findUserByIdentity,
} from '@/queries/user';
import assertThat from '@/utils/assert-that';
import { maskUserInfo } from '@/utils/format';

import { AnonymousRouter } from './types';

export default function sessionRoutes<T extends AnonymousRouter>(router: T, provider: Provider) {
  router.post('/session', async (ctx, next) => {
    const {
      prompt: { name },
    } = await provider.interactionDetails(ctx.req, ctx.res);

    if (name === 'consent') {
      ctx.body = { redirectTo: path.join(ctx.request.origin, '/session/consent') };

      return next();
    }

    throw new RequestError('session.unsupported_prompt_name');
  });

  router.post(
    '/session/sign-in/username-password',
    koaGuard({
      body: object({
        username: string().nonempty(),
        password: string().nonempty(),
      }),
    }),
    async (ctx, next) => {
      const { username, password } = ctx.guard.body;
      const type = 'SignInUsernamePassword';
      ctx.log(type, { username });

      const { id } = await findUserByUsernameAndPassword(username, password);
      ctx.log(type, { userId: id });
      await updateLastSignInAt(id);
      await assignInteractionResults(ctx, provider, { login: { accountId: id } }, true);

      return next();
    }
  );

  router.post(
    '/session/sign-in/passwordless/sms/send-passcode',
    koaGuard({ body: object({ phone: string().regex(phoneRegEx) }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const { phone } = ctx.guard.body;
      const type = 'SignInSmsSendPasscode';
      ctx.log(type, { phone });

      assertThat(
        await hasUserWithPhone(phone),
        new RequestError({ code: 'user.phone_not_exists', status: 422 })
      );

      const passcode = await createPasscode(jti, PasscodeType.SignIn, { phone });
      const { connector } = await sendPasscode(passcode);
      ctx.log(type, { connectorId: connector.id });
      ctx.status = 204;

      return next();
    }
  );

  router.post(
    '/session/sign-in/passwordless/sms/verify-passcode',
    koaGuard({ body: object({ phone: string().regex(phoneRegEx), code: string() }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const { phone, code } = ctx.guard.body;
      const type = 'SignInSms';
      ctx.log(type, { phone, code });

      assertThat(
        await hasUserWithPhone(phone),
        new RequestError({ code: 'user.phone_not_exists', status: 422 })
      );

      await verifyPasscode(jti, PasscodeType.SignIn, code, { phone });
      const { id } = await findUserByPhone(phone);
      ctx.log(type, { userId: id });

      await updateLastSignInAt(id);
      await assignInteractionResults(ctx, provider, { login: { accountId: id } }, true);

      return next();
    }
  );

  router.post(
    '/session/sign-in/passwordless/email/send-passcode',
    koaGuard({ body: object({ email: string().regex(emailRegEx) }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const { email } = ctx.guard.body;
      const type = 'SignInEmailSendPasscode';
      ctx.log(type, { email });

      assertThat(
        await hasUserWithEmail(email),
        new RequestError({ code: 'user.email_not_exists', status: 422 })
      );

      const passcode = await createPasscode(jti, PasscodeType.SignIn, { email });
      const { connector } = await sendPasscode(passcode);
      ctx.log(type, { connectorId: connector.id });
      ctx.status = 204;

      return next();
    }
  );

  router.post(
    '/session/sign-in/passwordless/email/verify-passcode',
    koaGuard({ body: object({ email: string().regex(emailRegEx), code: string() }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const { email, code } = ctx.guard.body;
      const type = 'SignInEmail';
      ctx.log(type, { email, code });

      assertThat(
        await hasUserWithEmail(email),
        new RequestError({ code: 'user.email_not_exists', status: 422 })
      );

      await verifyPasscode(jti, PasscodeType.SignIn, code, { email });
      const { id } = await findUserByEmail(email);
      ctx.log(type, { userId: id });

      await updateLastSignInAt(id);
      await assignInteractionResults(ctx, provider, { login: { accountId: id } }, true);

      return next();
    }
  );

  router.post(
    '/session/sign-in/social',
    koaGuard({
      body: object({
        connectorId: string(),
        state: string(),
        redirectUri: string().regex(redirectUriRegEx),
      }),
    }),
    async (ctx, next) => {
      const { connectorId, state, redirectUri } = ctx.guard.body;
      assertThat(state && redirectUri, 'session.insufficient_info');
      const connector = await getSocialConnectorInstanceById(connectorId);
      assertThat(connector.connector.enabled, 'connector.not_enabled');
      const redirectTo = await connector.getAuthorizationUri({ state, redirectUri });
      ctx.body = { redirectTo };

      return next();
    }
  );

  router.post(
    '/session/sign-in/social/auth',
    koaGuard({
      body: object({
        connectorId: string(),
        data: unknown(),
      }),
    }),
    async (ctx, next) => {
      const { connectorId, data } = ctx.guard.body;
      const type = 'SignInSocial';
      ctx.log(type, { connectorId, data });
      const {
        metadata: { target },
      } = await getConnectorInstanceById(connectorId);

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
      } = await getConnectorInstanceById(connectorId);

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

  router.post('/session/consent', async (ctx, next) => {
    const interaction = await provider.interactionDetails(ctx.req, ctx.res);
    const {
      session,
      grantId,
      params: { client_id },
      prompt,
    } = interaction;
    assertThat(session, 'session.not_found');

    const { accountId } = session;
    const grant =
      conditional(grantId && (await provider.Grant.find(grantId))) ??
      new provider.Grant({ accountId, clientId: String(client_id) });

    await saveUserFirstConsentedAppId(accountId, String(client_id));

    // V2: fulfill missing claims / resources
    const PromptDetailsBody = object({
      missingOIDCScope: string().array().optional(),
      missingResourceScopes: object({}).catchall(string().array()).optional(),
    });
    const { missingOIDCScope, missingResourceScopes } = PromptDetailsBody.parse(prompt.details);

    if (missingOIDCScope) {
      grant.addOIDCScope(missingOIDCScope.join(' '));
    }

    if (missingResourceScopes) {
      for (const [indicator, scope] of Object.entries(missingResourceScopes)) {
        grant.addResourceScope(indicator, scope.join(' '));
      }
    }

    const finalGrantId = await grant.save();

    // V2: configure consent
    await assignInteractionResults(ctx, provider, { consent: { grantId: finalGrantId } }, true);

    return next();
  });

  router.post(
    '/session/register/username-password',
    koaGuard({
      body: object({
        username: string().regex(usernameRegEx),
        password: string().regex(passwordRegEx),
      }),
    }),
    async (ctx, next) => {
      const { username, password } = ctx.guard.body;
      const type = 'RegisterUsernamePassword';
      ctx.log(type, { username });

      assertThat(
        !(await hasUser(username)),
        new RequestError({
          code: 'user.username_exists_register',
          status: 422,
        })
      );

      const id = await generateUserId();
      ctx.log(type, { userId: id });

      const { passwordEncrypted, passwordEncryptionMethod } = await encryptUserPassword(password);

      await insertUser({
        id,
        username,
        passwordEncrypted,
        passwordEncryptionMethod,
      });
      await updateLastSignInAt(id);
      await assignInteractionResults(ctx, provider, { login: { accountId: id } });

      return next();
    }
  );

  router.post(
    '/session/register/passwordless/sms/send-passcode',
    koaGuard({ body: object({ phone: string().regex(phoneRegEx) }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const { phone } = ctx.guard.body;
      const type = 'RegisterSmsSendPasscode';
      ctx.log(type, { phone });

      assertThat(
        !(await hasUserWithPhone(phone)),
        new RequestError({ code: 'user.phone_exists_register', status: 422 })
      );

      const passcode = await createPasscode(jti, PasscodeType.Register, { phone });
      const { connector } = await sendPasscode(passcode);
      ctx.log(type, { connectorId: connector.id });
      ctx.status = 204;

      return next();
    }
  );

  router.post(
    '/session/register/passwordless/sms/verify-passcode',
    koaGuard({ body: object({ phone: string().regex(phoneRegEx), code: string() }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const { phone, code } = ctx.guard.body;
      const type = 'RegisterSms';
      ctx.log(type, { phone, code });

      assertThat(
        !(await hasUserWithPhone(phone)),
        new RequestError({ code: 'user.phone_exists_register', status: 422 })
      );

      await verifyPasscode(jti, PasscodeType.Register, code, { phone });
      const id = await generateUserId();
      ctx.log(type, { userId: id });

      await insertUser({ id, primaryPhone: phone });
      await updateLastSignInAt(id);
      await assignInteractionResults(ctx, provider, { login: { accountId: id } });

      return next();
    }
  );

  router.post(
    '/session/register/passwordless/email/send-passcode',
    koaGuard({ body: object({ email: string().regex(emailRegEx) }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const { email } = ctx.guard.body;
      const type = 'RegisterEmailSendPasscode';
      ctx.log(type, { email });

      assertThat(
        !(await hasUserWithEmail(email)),
        new RequestError({ code: 'user.email_exists_register', status: 422 })
      );

      const passcode = await createPasscode(jti, PasscodeType.Register, { email });
      const { connector } = await sendPasscode(passcode);
      ctx.log(type, { connectorId: connector.id });
      ctx.status = 204;

      return next();
    }
  );

  router.post(
    '/session/register/passwordless/email/verify-passcode',
    koaGuard({ body: object({ email: string().regex(emailRegEx), code: string() }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const { email, code } = ctx.guard.body;
      const type = 'RegisterEmail';
      ctx.log(type, { email, code });

      assertThat(
        !(await hasUserWithEmail(email)),
        new RequestError({ code: 'user.email_exists_register', status: 422 })
      );

      await verifyPasscode(jti, PasscodeType.Register, code, { email });
      const id = await generateUserId();
      ctx.log(type, { userId: id });

      await insertUser({ id, primaryEmail: email });
      await updateLastSignInAt(id);
      await assignInteractionResults(ctx, provider, { login: { accountId: id } });

      return next();
    }
  );

  router.post(
    '/session/register/social',
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
      } = await getConnectorInstanceById(connectorId);

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
      } = await getConnectorInstanceById(connectorId);

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

  router.delete('/session', async (ctx, next) => {
    await provider.interactionDetails(ctx.req, ctx.res);
    const error: LogtoErrorCode = 'oidc.aborted';
    await assignInteractionResults(ctx, provider, { error });

    return next();
  });
}
/* eslint-enable max-lines */
