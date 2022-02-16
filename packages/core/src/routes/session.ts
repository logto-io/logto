import { LogtoErrorCode } from '@logto/phrases';
import { PasscodeType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { Provider } from 'oidc-provider';
import { nativeEnum, object, string } from 'zod';

import RequestError from '@/errors/RequestError';
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
import koaGuard from '@/middleware/koa-guard';
import assertThat from '@/utils/assert-that';

import { AnonymousRouter } from './types';

export default function sessionRoutes<T extends AnonymousRouter>(router: T, provider: Provider) {
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
    '/session/sign-in/phone-code',
    koaGuard({ body: object({ phone: string(), code: string() }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const { phone, code } = ctx.guard.body;
      await signInWithPhoneAndPasscode(ctx, provider, { jti, phone, code });

      return next();
    }
  );

  router.post(
    '/session/sign-in/email-code',
    koaGuard({ body: object({ email: string(), code: string() }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const { email, code } = ctx.guard.body;
      await signInWithEmailAndPasscode(ctx, provider, { jti, email, code });

      return next();
    }
  );

  router.post(
    '/session/sign-in/social-code',
    koaGuard({ body: object({ connectorId: string(), code: string() }) }),
    async (ctx, next) => {
      const { result } = await provider.interactionDetails(ctx.req, ctx.res);
      const { connectorId, code } = ctx.guard.body;
      await signInWithSocial(ctx, provider, { connectorId, code, result });

      return next();
    }
  );

  router.post(
    '/session/passcodes/email',
    koaGuard({
      body: object({
        type: nativeEnum(PasscodeType),
        email: string(),
      }),
    }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const { type, email } = ctx.guard.body;

      if (type === PasscodeType.SignIn) {
        await sendSignInWithEmailPasscode(ctx, jti, email);
      } else if (type === PasscodeType.Register) {
        await sendPasscodeToEmail(ctx, jti, email);
      } else {
        throw new RequestError('session.insufficient_info');
      }

      return next();
    }
  );

  router.post(
    '/session/passcodes/phone',
    koaGuard({
      body: object({
        type: nativeEnum(PasscodeType),
        phone: string(),
      }),
    }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const { type, phone } = ctx.guard.body;

      if (type === PasscodeType.SignIn) {
        await sendSignInWithPhonePasscode(ctx, jti, phone);
      } else if (type === PasscodeType.Register) {
        await sendPasscodeToPhone(ctx, jti, phone);
      } else {
        throw new RequestError('session.insufficient_info');
      }

      return next();
    }
  );

  router.post(
    '/session/social-authorization-uri',
    koaGuard({ body: object({ connectorId: string(), state: string() }) }),
    async (ctx, next) => {
      const { connectorId, state } = ctx.guard.body;
      await assignRedirectUrlForSocial(ctx, connectorId, state);

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
    '/session/register/phone-code',
    koaGuard({ body: object({ phone: string(), code: string() }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const { phone, code } = ctx.guard.body;
      await registerWithPhoneAndPasscode(ctx, provider, { jti, phone, code });

      return next();
    }
  );

  router.post(
    '/session/register/email-code',
    koaGuard({ body: object({ email: string(), code: string() }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const { email, code } = ctx.guard.body;
      await registerWithEmailAndPasscode(ctx, provider, { jti, email, code });

      return next();
    }
  );

  router.post(
    '/session/register/social-code',
    koaGuard({ body: object({ connectorId: string(), code: string() }) }),
    async (ctx, next) => {
      const { connectorId, code } = ctx.guard.body;
      await registerWithSocial(ctx, provider, { connectorId, code });

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
