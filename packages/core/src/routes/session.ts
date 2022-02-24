import path from 'path';

import { LogtoErrorCode } from '@logto/phrases';
import { PasscodeType, UserLogType, userInfoSelectFields } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import pick from 'lodash.pick';
import { Provider } from 'oidc-provider';
import { object, string } from 'zod';

import { getSocialConnectorInstanceById } from '@/connectors';
import RequestError from '@/errors/RequestError';
import { createPasscode, sendPasscode, verifyPasscode } from '@/lib/passcode';
import {
  assignInteractionResults,
  connectorRedirectUrl,
  checkEmailValidityAndAvailability,
  checkEmailValidityAndExistence,
  checkPhoneNumberValidityAndAvailability,
  checkPhoneNumberValidityAndExistence,
} from '@/lib/session';
import {
  findSocialRelatedUser,
  getUserInfoByAuthCode,
  getUserInfoFromInteractionResult,
} from '@/lib/social';
import { encryptUserPassword, generateUserId, findUserByUsernameAndPassword } from '@/lib/user';
import koaGuard from '@/middleware/koa-guard';
import {
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
import { emailRegEx, phoneRegEx, usernameRegEx } from '@/utils/regex';

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
    koaGuard({ body: object({ username: string().regex(usernameRegEx), password: string() }) }),
    async (ctx, next) => {
      const { username, password } = ctx.guard.body;
      ctx.userLog.username = username;
      ctx.userLog.type = UserLogType.SignInUsernameAndPassword;

      assertThat(password, 'session.insufficient_info');

      const { id } = await findUserByUsernameAndPassword(username, password);
      ctx.userLog.userId = id;

      await assignInteractionResults(ctx, provider, { login: { accountId: id } });

      return next();
    }
  );

  router.post(
    '/session/sign-in/passwordless/phone/send-passcode',
    koaGuard({ body: object({ phone: string().regex(phoneRegEx) }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const { phone } = ctx.guard.body;
      ctx.userLog.phone = phone;
      ctx.userLog.type = UserLogType.SignInPhone;

      await checkPhoneNumberValidityAndExistence(phone);

      const passcode = await createPasscode(jti, PasscodeType.SignIn, { phone });
      await sendPasscode(passcode);
      ctx.state = 204;

      return next();
    }
  );

  router.post(
    '/session/sign-in/passwordless/phone/verify-passcode',
    koaGuard({ body: object({ phone: string().regex(phoneRegEx), code: string() }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const { phone, code } = ctx.guard.body;
      ctx.userLog.phone = phone;
      ctx.userLog.type = UserLogType.SignInPhone;

      await checkPhoneNumberValidityAndExistence(phone);

      await verifyPasscode(jti, PasscodeType.SignIn, code, { phone });
      const { id } = await findUserByPhone(phone);
      ctx.userLog.userId = id;

      await assignInteractionResults(ctx, provider, { login: { accountId: id } });

      return next();
    }
  );

  router.post(
    '/session/sign-in/passwordless/email/send-passcode',
    koaGuard({ body: object({ email: string().regex(emailRegEx) }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const { email } = ctx.guard.body;
      ctx.userLog.email = email;
      ctx.userLog.type = UserLogType.SignInEmail;

      await checkEmailValidityAndExistence(email);

      const passcode = await createPasscode(jti, PasscodeType.SignIn, { email });
      await sendPasscode(passcode);
      ctx.state = 204;

      return next();
    }
  );

  router.post(
    '/session/sign-in/passwordless/email/verify-passcode',
    koaGuard({ body: object({ email: string().regex(emailRegEx), code: string() }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const { email, code } = ctx.guard.body;
      ctx.userLog.email = email;
      ctx.userLog.type = UserLogType.SignInEmail;

      await checkEmailValidityAndExistence(email);

      await verifyPasscode(jti, PasscodeType.SignIn, code, { email });
      const { id } = await findUserByEmail(email);
      ctx.userLog.userId = id;

      await assignInteractionResults(ctx, provider, { login: { accountId: id } });

      return next();
    }
  );

  router.post(
    '/session/sign-in/social',
    koaGuard({
      body: object({ connectorId: string(), code: string().optional(), state: string() }),
    }),
    async (ctx, next) => {
      const { connectorId, code, state } = ctx.guard.body;
      ctx.userLog.connectorId = connectorId;
      ctx.userLog.type = UserLogType.SignInSocial;

      if (!code) {
        assertThat(state, 'session.insufficient_info');
        const connector = await getSocialConnectorInstanceById(connectorId);
        assertThat(connector.connector.enabled, 'connector.not_enabled');
        const redirectTo = await connector.getAuthorizationUri(connectorRedirectUrl, state);
        ctx.body = { redirectTo };

        return next();
      }

      const userInfo = await getUserInfoByAuthCode(connectorId, code);

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
      ctx.userLog.userId = id;

      // Update social connector's user info
      await updateUserById(id, {
        identities: { ...identities, [connectorId]: { userId: userInfo.id, details: userInfo } },
      });
      await assignInteractionResults(ctx, provider, { login: { accountId: id } });

      return next();
    }
  );

  router.post(
    '/session/sign-in/bind-social-related-user-and-sign-in',
    koaGuard({
      body: object({ connectorId: string() }),
    }),
    async (ctx, next) => {
      ctx.userLog.type = UserLogType.SignInSocial;
      const { connectorId } = ctx.guard.body;
      const { result } = await provider.interactionDetails(ctx.req, ctx.res);

      assertThat(result, 'session.connector_session_not_found');

      ctx.userLog.connectorId = connectorId;

      const userInfo = await getUserInfoFromInteractionResult(connectorId, result);
      const relatedInfo = await findSocialRelatedUser(userInfo);

      assertThat(relatedInfo, 'session.connector_session_not_found');

      const { id, identities } = relatedInfo[1];
      ctx.userLog.userId = id;

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
    koaGuard({ body: object({ username: string().regex(usernameRegEx), password: string() }) }),
    async (ctx, next) => {
      const { username, password } = ctx.guard.body;
      ctx.userLog.username = username;
      ctx.userLog.type = UserLogType.RegisterUsernameAndPassword;

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
      ctx.userLog.userId = id;

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
    '/session/register/passwordless/phone/send-passcode',
    koaGuard({ body: object({ phone: string().regex(phoneRegEx) }) }),
    async (ctx, next) => {
      ctx.userLog.type = UserLogType.RegisterPhone;
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const { phone } = ctx.guard.body;
      ctx.userLog.phone = phone;

      await checkPhoneNumberValidityAndAvailability(phone);

      const passcode = await createPasscode(jti, PasscodeType.Register, { phone });
      await sendPasscode(passcode);
      ctx.state = 204;

      return next();
    }
  );

  router.post(
    '/session/register/passwordless/phone/verify-passcode',
    koaGuard({ body: object({ phone: string().regex(phoneRegEx), code: string() }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const { phone, code } = ctx.guard.body;
      ctx.userLog.phone = phone;
      ctx.userLog.type = UserLogType.RegisterPhone;

      await checkPhoneNumberValidityAndAvailability(phone);

      await verifyPasscode(jti, PasscodeType.Register, code, { phone });
      const id = await generateUserId();
      ctx.userLog.userId = id;

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
      const { email } = ctx.guard.body;
      ctx.userLog.email = email;
      ctx.userLog.type = UserLogType.RegisterEmail;

      await checkEmailValidityAndAvailability(email);

      const passcode = await createPasscode(jti, PasscodeType.Register, { email });
      await sendPasscode(passcode);
      ctx.state = 204;

      return next();
    }
  );

  router.post(
    '/session/register/passwordless/email/verify-passcode',
    koaGuard({ body: object({ email: string().regex(emailRegEx), code: string() }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const { email, code } = ctx.guard.body;
      ctx.userLog.email = email;
      ctx.userLog.type = UserLogType.RegisterEmail;

      await checkEmailValidityAndAvailability(email);

      await verifyPasscode(jti, PasscodeType.Register, code, { email });
      const id = await generateUserId();
      ctx.userLog.userId = id;

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
      const { connectorId } = ctx.guard.body;
      const { result } = await provider.interactionDetails(ctx.req, ctx.res);

      // User can not regsiter with social directly,
      // need to try to sign in with social first, then confirm to register and continue,
      // so the result is expected to be exists.
      assertThat(result, 'session.connector_session_not_found');

      const userInfo = await getUserInfoFromInteractionResult(connectorId, result);
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
      const { connectorId } = ctx.guard.body;
      const { result } = await provider.interactionDetails(ctx.req, ctx.res);
      assertThat(result, 'session.connector_session_not_found');
      assertThat(result.login?.accountId, 'session.unauthorized');

      const userInfo = await getUserInfoFromInteractionResult(connectorId, result);
      const user = await findUserById(result.login.accountId);

      const updatedUser = await updateUserById(user.id, {
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
}
