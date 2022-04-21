/* eslint-disable max-lines */
import path from 'path';

import { LogtoErrorCode } from '@logto/phrases';
import { LogType, PasscodeType, userInfoSelectFields } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import pick from 'lodash.pick';
import { Provider } from 'oidc-provider';
import { object, string } from 'zod';

import { getSocialConnectorInstanceById } from '@/connectors';
import RequestError from '@/errors/RequestError';
import { createPasscode, sendPasscode, verifyPasscode } from '@/lib/passcode';
import { assignInteractionResults } from '@/lib/session';
import {
  findSocialRelatedUser,
  getUserInfoByAuthCode,
  getUserInfoFromInteractionResult,
} from '@/lib/social';
import { encryptUserPassword, generateUserId, findUserByUsernameAndPassword } from '@/lib/user';
import koaGuard from '@/middleware/koa-guard';
import { findDefaultSignInExperience } from '@/queries/sign-in-experience';
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
import {
  redirectUriRegEx,
  emailRegEx,
  passwordRegEx,
  phoneRegEx,
  usernameRegEx,
} from '@/utils/regex';

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
        username: string().regex(usernameRegEx),
        password: string().regex(passwordRegEx),
      }),
    }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      ctx.log.sessionId = jti;

      const { username, password } = ctx.guard.body;
      ctx.log.type = LogType.SignInUsernamePassword;
      ctx.log.username = username;
      assertThat(password, 'session.insufficient_info');

      const { id } = await findUserByUsernameAndPassword(username, password);
      ctx.log.userId = id;
      await assignInteractionResults(ctx, provider, { login: { accountId: id } });

      return next();
    }
  );

  router.post(
    '/session/sign-in/passwordless/sms/send-passcode',
    koaGuard({ body: object({ phone: string().regex(phoneRegEx) }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      ctx.log.sessionId = jti;

      const { phone } = ctx.guard.body;
      ctx.log.type = LogType.SignInSmsSendPasscode;
      ctx.log.phone = phone;

      assertThat(
        await hasUserWithPhone(phone),
        new RequestError({ code: 'user.phone_not_exists', status: 422 })
      );

      const passcode = await createPasscode(jti, PasscodeType.SignIn, { phone });
      ctx.log.passcode = passcode;

      await sendPasscode(passcode);
      ctx.status = 204;

      return next();
    }
  );

  router.post(
    '/session/sign-in/passwordless/sms/verify-passcode',
    koaGuard({ body: object({ phone: string().regex(phoneRegEx), code: string() }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      ctx.log.sessionId = jti;

      const { phone, code } = ctx.guard.body;
      ctx.log.type = LogType.SignInSms;
      ctx.log.phone = phone;
      ctx.log.passcode = code;

      assertThat(
        await hasUserWithPhone(phone),
        new RequestError({ code: 'user.phone_not_exists', status: 422 })
      );

      await verifyPasscode(jti, PasscodeType.SignIn, code, { phone });
      const { id } = await findUserByPhone(phone);
      ctx.log.userId = id;

      await assignInteractionResults(ctx, provider, { login: { accountId: id } });

      return next();
    }
  );

  router.post(
    '/session/sign-in/passwordless/email/send-passcode',
    koaGuard({ body: object({ email: string().regex(emailRegEx) }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      ctx.log.sessionId = jti;

      const { email } = ctx.guard.body;
      ctx.log.type = LogType.SignInEmailSendPasscode;
      ctx.log.email = email;

      assertThat(
        await hasUserWithEmail(email),
        new RequestError({ code: 'user.email_not_exists', status: 422 })
      );

      const passcode = await createPasscode(jti, PasscodeType.SignIn, { email });
      ctx.log.passcode = passcode;

      await sendPasscode(passcode);
      ctx.status = 204;

      return next();
    }
  );

  router.post(
    '/session/sign-in/passwordless/email/verify-passcode',
    koaGuard({ body: object({ email: string().regex(emailRegEx), code: string() }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      ctx.log.sessionId = jti;

      const { email, code } = ctx.guard.body;
      ctx.log.type = LogType.SignInEmail;
      ctx.log.email = email;
      ctx.log.passcode = code;

      assertThat(
        await hasUserWithEmail(email),
        new RequestError({ code: 'user.email_not_exists', status: 422 })
      );

      await verifyPasscode(jti, PasscodeType.SignIn, code, { email });
      const { id } = await findUserByEmail(email);
      ctx.log.userId = id;

      await assignInteractionResults(ctx, provider, { login: { accountId: id } });

      return next();
    }
  );

  router.post(
    '/session/sign-in/social',
    koaGuard({
      body: object({
        connectorId: string(),
        code: string().optional(),
        state: string(),
        redirectUri: string().regex(redirectUriRegEx),
      }),
    }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      ctx.log.sessionId = jti;

      const { connectorId, code, state, redirectUri } = ctx.guard.body;
      ctx.log.type = LogType.SignInSocial;
      ctx.log.connectorId = connectorId;
      ctx.log.code = code;
      ctx.log.state = state;
      ctx.log.redirectUri = redirectUri;

      if (!code) {
        assertThat(state && redirectUri, 'session.insufficient_info');
        const connector = await getSocialConnectorInstanceById(connectorId);
        assertThat(connector.connector.enabled, 'connector.not_enabled');
        const redirectTo = await connector.getAuthorizationUri(redirectUri, state);
        ctx.body = { redirectTo };
        ctx.log.redirectTo = redirectTo;

        return next();
      }

      const userInfo = await getUserInfoByAuthCode(connectorId, code, redirectUri);
      ctx.log.userInfo = userInfo;

      if (!(await hasUserWithIdentity(connectorId, userInfo.id))) {
        await assignInteractionResults(ctx, provider, { connectorId, userInfo }, true);
        const relatedInfo = await findSocialRelatedUser(userInfo);
        throw new RequestError(
          {
            code: 'user.identity_not_exists',
            status: 422,
          },
          relatedInfo && { relatedUser: relatedInfo[0] }
        );
      }

      const { id, identities } = await findUserByIdentity(connectorId, userInfo.id);
      ctx.log.userId = id;

      // Update social connector's user info
      await updateUserById(id, {
        identities: { ...identities, [connectorId]: { userId: userInfo.id, details: userInfo } },
      });
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
      const { jti, result } = await provider.interactionDetails(ctx.req, ctx.res);
      assertThat(result, 'session.connector_session_not_found');
      ctx.log.sessionId = jti;

      const { connectorId } = ctx.guard.body;
      ctx.log.type = LogType.SignInSocialBind;
      ctx.log.connectorId = connectorId;

      const userInfo = await getUserInfoFromInteractionResult(connectorId, result);
      ctx.log.userInfo = userInfo;

      const relatedInfo = await findSocialRelatedUser(userInfo);
      assertThat(relatedInfo, 'session.connector_session_not_found');

      const { id, identities } = relatedInfo[1];
      ctx.log.userId = id;

      await updateUserById(id, {
        identities: { ...identities, [connectorId]: { userId: userInfo.id, details: userInfo } },
      });
      await assignInteractionResults(ctx, provider, { login: { accountId: id } });

      return next();
    }
  );

  router.post('/session/consent', async (ctx, next) => {
    const interaction = await provider.interactionDetails(ctx.req, ctx.res);
    const { session, grantId, params, prompt } = interaction;
    assertThat(session, 'session.not_found');

    const { accountId } = session;
    const grant =
      conditional(grantId && (await provider.Grant.find(grantId))) ??
      new provider.Grant({ accountId, clientId: String(params.client_id) });

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
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      ctx.log.sessionId = jti;

      const { username, password } = ctx.guard.body;
      ctx.log.type = LogType.RegisterUsernamePassword;
      ctx.log.username = username;

      assertThat(
        password,
        new RequestError({
          code: 'session.insufficient_info',
          status: 400,
        })
      );
      assertThat(
        !(await hasUser(username)),
        new RequestError({
          code: 'user.username_exists_register',
          status: 422,
        })
      );

      const id = await generateUserId();
      ctx.log.userId = id;

      const { passwordEncryptionSalt, passwordEncrypted, passwordEncryptionMethod } =
        encryptUserPassword(id, password);

      await insertUser({
        id,
        username,
        passwordEncrypted,
        passwordEncryptionMethod,
        passwordEncryptionSalt,
      });
      await assignInteractionResults(ctx, provider, { login: { accountId: id } });

      return next();
    }
  );

  router.get(
    '/session/register/:username/existence',
    koaGuard({ params: object({ username: string().regex(usernameRegEx) }) }),
    async (ctx, next) => {
      const { username } = ctx.guard.params;

      ctx.body = { existence: await hasUser(username) };

      return next();
    }
  );

  router.post(
    '/session/register/passwordless/sms/send-passcode',
    koaGuard({ body: object({ phone: string().regex(phoneRegEx) }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      ctx.log.sessionId = jti;

      const { phone } = ctx.guard.body;
      ctx.log.type = LogType.RegisterSmsSendPasscode;
      ctx.log.phone = phone;

      assertThat(
        !(await hasUserWithPhone(phone)),
        new RequestError({ code: 'user.phone_exists_register', status: 422 })
      );

      const passcode = await createPasscode(jti, PasscodeType.Register, { phone });
      ctx.log.passcode = passcode;

      await sendPasscode(passcode);
      ctx.status = 204;

      return next();
    }
  );

  router.post(
    '/session/register/passwordless/sms/verify-passcode',
    koaGuard({ body: object({ phone: string().regex(phoneRegEx), code: string() }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      ctx.log.sessionId = jti;

      const { phone, code } = ctx.guard.body;
      ctx.log.type = LogType.RegisterSms;
      ctx.log.phone = phone;
      ctx.log.passcode = code;

      assertThat(
        !(await hasUserWithPhone(phone)),
        new RequestError({ code: 'user.phone_exists_register', status: 422 })
      );

      await verifyPasscode(jti, PasscodeType.Register, code, { phone });
      const id = await generateUserId();
      ctx.log.userId = id;

      await insertUser({ id, primaryPhone: phone });
      await assignInteractionResults(ctx, provider, { login: { accountId: id } });

      return next();
    }
  );

  router.post(
    '/session/register/passwordless/email/send-passcode',
    koaGuard({ body: object({ email: string().regex(emailRegEx) }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      ctx.log.sessionId = jti;

      const { email } = ctx.guard.body;
      ctx.log.type = LogType.RegisterEmailSendPasscode;
      ctx.log.email = email;

      assertThat(
        !(await hasUserWithEmail(email)),
        new RequestError({ code: 'user.email_exists_register', status: 422 })
      );

      const passcode = await createPasscode(jti, PasscodeType.Register, { email });
      ctx.log.passcode = passcode;

      await sendPasscode(passcode);
      ctx.status = 204;

      return next();
    }
  );

  router.post(
    '/session/register/passwordless/email/verify-passcode',
    koaGuard({ body: object({ email: string().regex(emailRegEx), code: string() }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      ctx.log.sessionId = jti;

      const { email, code } = ctx.guard.body;
      ctx.log.type = LogType.RegisterEmail;
      ctx.log.email = email;
      ctx.log.passcode = code;

      assertThat(
        !(await hasUserWithEmail(email)),
        new RequestError({ code: 'user.email_exists_register', status: 422 })
      );

      await verifyPasscode(jti, PasscodeType.Register, code, { email });
      const id = await generateUserId();
      ctx.log.userId = id;

      await insertUser({ id, primaryEmail: email });
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
      const { jti, result } = await provider.interactionDetails(ctx.req, ctx.res);
      // User can not register with social directly,
      // need to try to sign in with social first, then confirm to register and continue,
      // so the result is expected to be exists.
      assertThat(result, 'session.connector_session_not_found');
      ctx.log.sessionId = jti;

      const { connectorId } = ctx.guard.body;
      ctx.log.type = LogType.RegisterSocial;
      ctx.log.connectorId = connectorId;

      const userInfo = await getUserInfoFromInteractionResult(connectorId, result);
      ctx.log.userInfo = userInfo;
      assertThat(!(await hasUserWithIdentity(connectorId, userInfo.id)), 'user.identity_exists');

      const id = await generateUserId();
      await insertUser({
        id,
        name: userInfo.name ?? null,
        avatar: userInfo.avatar ?? null,
        identities: {
          [connectorId]: {
            userId: userInfo.id,
            details: userInfo,
          },
        },
      });

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
      const { jti, result } = await provider.interactionDetails(ctx.req, ctx.res);
      assertThat(result, 'session.connector_session_not_found');
      assertThat(result.login?.accountId, 'session.unauthorized');
      ctx.log.sessionId = jti;

      const { connectorId } = ctx.guard.body;
      ctx.log.type = LogType.RegisterSocialBind;
      ctx.log.connectorId = connectorId;

      const userInfo = await getUserInfoFromInteractionResult(connectorId, result);
      ctx.log.userInfo = userInfo;

      const userId = result.login.accountId;
      ctx.log.userId = userId;

      const user = await findUserById(userId);
      const updatedUser = await updateUserById(userId, {
        identities: {
          ...user.identities,
          [connectorId]: { userId: userInfo.id, details: userInfo },
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

  router.get('/sign-in-settings', async (ctx, next) => {
    // TODO: Social Connector Details
    const signInExperience = await findDefaultSignInExperience();
    ctx.body = signInExperience;

    return next();
  });
}
/* eslint-enable max-lines */
