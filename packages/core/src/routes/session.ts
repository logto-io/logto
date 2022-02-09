import { LogtoErrorCode } from '@logto/phrases';
import { conditional } from '@silverhand/essentials';
import { Provider } from 'oidc-provider';
import { object, string } from 'zod';

import RequestError from '@/errors/RequestError';
import {
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
    '/session',
    koaGuard({
      body: object({
        username: string().optional(),
        password: string().optional(),
        email: string().optional(),
        phone: string().optional(),
        code: string().optional(),
        connectorId: string().optional(),
        state: string().optional(),
      }),
    }),
    async (ctx, next) => {
      const interaction = await provider.interactionDetails(ctx.req, ctx.res);
      const {
        // Interaction's JWT identity: jti
        // https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#user-flows
        // https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.7
        jti,
        prompt: { name },
      } = interaction;

      if (name === 'consent') {
        ctx.body = { redirectTo: ctx.request.origin + '/session/consent' };

        return next();
      }

      if (name === 'login') {
        const { username, password, email, phone, code, connectorId, state } = ctx.guard.body;

        if (connectorId && state && !code) {
          await assignRedirectUrlForSocial(ctx, connectorId, state);
        } else if (connectorId && code) {
          await signInWithSocial(ctx, provider, { connectorId, code });
        } else if (email && !code) {
          await sendSignInWithEmailPasscode(ctx, jti, email);
        } else if (email && code) {
          await signInWithEmailAndPasscode(ctx, provider, { jti, email, code });
        } else if (phone && !code) {
          await sendSignInWithPhonePasscode(ctx, jti, phone);
        } else if (phone && code) {
          await signInWithPhoneAndPasscode(ctx, provider, { jti, phone, code });
        } else if (username && password) {
          await signInWithUsernameAndPassword(ctx, provider, username, password);
        } else {
          throw new RequestError('session.insufficient_info');
        }

        return next();
      }

      throw new Error(`Prompt not supported: ${name}`);
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
    '/session/register',
    koaGuard({
      body: object({
        username: string().min(3).optional(),
        password: string().min(6).optional(),
        email: string().optional(),
        phone: string().optional(),
        code: string().optional(),
      }),
    }),
    async (ctx, next) => {
      const interaction = await provider.interactionDetails(ctx.req, ctx.res);
      const { jti } = interaction;
      const { username, password, email, phone, code } = ctx.guard.body;

      if (email && !code) {
        await sendPasscodeToEmail(ctx, jti, email);
      } else if (email && code) {
        await registerWithEmailAndPasscode(ctx, provider, { jti, email, code });
      } else if (phone && !code) {
        await sendPasscodeToPhone(ctx, jti, phone);
      } else if (phone && code) {
        await registerWithPhoneAndPasscode(ctx, provider, { jti, phone, code });
      } else if (username && password) {
        await registerWithUsernameAndPassword(ctx, provider, username, password);
      } else {
        throw new RequestError('session.insufficient_info');
      }

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
