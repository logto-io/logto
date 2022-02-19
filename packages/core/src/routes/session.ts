import path from 'path';

import { LogtoErrorCode } from '@logto/phrases';
import { userInfoSelectFields } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import pick from 'lodash.pick';
import { Provider } from 'oidc-provider';
import { object, string } from 'zod';

import {
  registerWithSocial,
  registerWithEmailAndPasscode,
  registerWithPhoneAndPasscode,
  registerWithUsernameAndPassword,
  sendPasscodeToEmail,
  sendPasscodeToPhone,
} from '@/lib/register';
import {
  assignRedirectUrlForSocial,
  sendSignInWithEmailPasscode,
  sendSignInWithPhonePasscode,
  signInWithSocial,
  signInWithEmailAndPasscode,
  signInWithPhoneAndPasscode,
  signInWithUsernameAndPassword,
} from '@/lib/sign-in';
import { getUserInfoByAuthCode, getUserInfoFromInteractionResult } from '@/lib/social';
import koaGuard from '@/middleware/koa-guard';
import { findUserById, hasUserWithIdentity, updateUserById } from '@/queries/user';
import assertThat from '@/utils/assert-that';

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
  });

  router.post(
    '/session/sign-in/username-password',
    koaGuard({ body: object({ username: string(), password: string() }) }),
    async (ctx, next) => {
      const { username, password } = ctx.guard.body;
      await signInWithUsernameAndPassword(ctx, provider, username, password);

      return next();
    }
  );

  router.post(
    '/session/sign-in/passwordless/phone',
    koaGuard({ body: object({ phone: string(), code: string().optional() }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const { phone, code } = ctx.guard.body;

      if (!code) {
        await sendSignInWithPhonePasscode(ctx, jti, phone);

        return next();
      }

      await signInWithPhoneAndPasscode(ctx, provider, { jti, phone, code });

      return next();
    }
  );

  router.post(
    '/session/sign-in/passwordless/email',
    koaGuard({ body: object({ email: string(), code: string().optional() }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const { email, code } = ctx.guard.body;

      if (!code) {
        await sendSignInWithEmailPasscode(ctx, jti, email);

        return next();
      }

      await signInWithEmailAndPasscode(ctx, provider, { jti, email, code });

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

      if (!code) {
        assertThat(state, 'session.insufficient_info');
        await assignRedirectUrlForSocial(ctx, connectorId, state);

        return next();
      }

      const userInfo = await getUserInfoByAuthCode(connectorId, code);
      await signInWithSocial(ctx, provider, connectorId, userInfo);

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
    const redirectTo = await provider.interactionResult(
      ctx.req,
      ctx.res,
      { consent: { grantId: finalGrantId } },
      { mergeWithLastSubmission: true }
    );
    ctx.body = { redirectTo };

    return next();
  });

  router.post(
    '/session/register/username-password',
    koaGuard({ body: object({ username: string(), password: string() }) }),
    async (ctx, next) => {
      const { username, password } = ctx.guard.body;
      await registerWithUsernameAndPassword(ctx, provider, username, password);

      return next();
    }
  );

  router.post(
    '/session/register/passwordless/phone',
    koaGuard({ body: object({ phone: string(), code: string().optional() }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const { phone, code } = ctx.guard.body;

      if (!code) {
        await sendPasscodeToPhone(ctx, jti, phone);

        return next();
      }

      await registerWithPhoneAndPasscode(ctx, provider, { jti, phone, code });

      return next();
    }
  );

  router.post(
    '/session/register/passwordless/email',
    koaGuard({ body: object({ email: string(), code: string().optional() }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const { email, code } = ctx.guard.body;

      if (!code) {
        await sendPasscodeToEmail(ctx, jti, email);

        return next();
      }

      await registerWithEmailAndPasscode(ctx, provider, { jti, email, code });

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

      await registerWithSocial(ctx, provider, connectorId, userInfo);

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
    const redirectTo = await provider.interactionResult(ctx.req, ctx.res, {
      error,
    });
    ctx.body = { redirectTo };

    return next();
  });
}
