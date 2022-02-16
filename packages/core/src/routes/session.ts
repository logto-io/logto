import { LogtoErrorCode } from '@logto/phrases';
import { PasscodeType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { Provider, errors } from 'oidc-provider';
import { nativeEnum, object, string } from 'zod';

import RequestError from '@/errors/RequestError';
import {
  registerWithSocial,
  registerWithEmailAndPasscode,
  registerWithPhoneAndPasscode,
  registerWithUsernameAndPassword,
  sendPasscodeToEmail,
  sendPasscodeToPhone,
  RegisterFlowType,
  registerParametersGuard,
} from '@/lib/register';
import {
  assignRedirectUrlForSocial,
  sendSignInWithEmailPasscode,
  sendSignInWithPhonePasscode,
  signInWithSocial,
  signInWithEmailAndPasscode,
  signInWithPhoneAndPasscode,
  signInWithUsernameAndPassword,
  SignInFlowType,
  signInParametersGuard,
} from '@/lib/sign-in';
import koaGuard from '@/middleware/koa-guard';
import assertThat from '@/utils/assert-that';

import { AnonymousRouter } from './types';

export default function sessionRoutes<T extends AnonymousRouter>(router: T, provider: Provider) {
  router.post(
    '/session/sign-in/:signInFlowType',
    koaGuard({
      params: object({ signInFlowType: nativeEnum(SignInFlowType) }),
      body: signInParametersGuard,
    }),
    async (ctx, next) => {
      const {
        // Interaction's JWT identity: jti
        // https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#user-flows
        // https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.7
        jti,
        prompt: { name },
        result,
      } = await provider.interactionDetails(ctx.req, ctx.res);

      if (name === 'consent') {
        ctx.body = { redirectTo: ctx.request.origin + '/session/consent' };

        return next();
      }

      if (name === 'login') {
        const { signInFlowType } = ctx.guard.params;

        if (
          signInFlowType === SignInFlowType.UsernameAndPassword &&
          ctx.guard.body.UsernameAndPassword
        ) {
          const { username, password } = ctx.guard.body.UsernameAndPassword;
          await signInWithUsernameAndPassword(ctx, provider, username, password);
        } else if (signInFlowType === SignInFlowType.Email && ctx.guard.body.Email) {
          const { email, code } = ctx.guard.body.Email;
          await signInWithEmailAndPasscode(ctx, provider, { jti, email, code });
        } else if (signInFlowType === SignInFlowType.Phone && ctx.guard.body.Phone) {
          const { phone, code } = ctx.guard.body.Phone;
          await signInWithPhoneAndPasscode(ctx, provider, { jti, phone, code });
        } else if (signInFlowType === SignInFlowType.Social && ctx.guard.body.Social) {
          const { connectorId, code, state } = ctx.guard.body.Social;

          if (connectorId && state && !code) {
            await assignRedirectUrlForSocial(ctx, connectorId, state);
          } else if (connectorId && code) {
            await signInWithSocial(ctx, provider, { connectorId, code, result });
          }
        } else {
          throw new RequestError('session.insufficient_info');
        }

        return next();
      }

      throw new errors.InvalidRequest(`Prompt not supported: ${name}`);
    }
  );

  router.post(
    '/session/passcodes',
    koaGuard({
      body: object({
        type: nativeEnum(PasscodeType),
        phone: string().optional(),
        email: string().optional(),
      }),
    }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const { type, phone, email } = ctx.guard.body;

      if (!phone && !email) {
        throw new RequestError('session.insufficient_info');
      }

      if (type === PasscodeType.SignIn) {
        if (phone) {
          await sendSignInWithPhonePasscode(ctx, jti, phone);
        } else if (email) {
          await sendSignInWithEmailPasscode(ctx, jti, email);
        }
      } else if (type === PasscodeType.Register) {
        if (phone) {
          await sendPasscodeToPhone(ctx, jti, phone);
        } else if (email) {
          await sendPasscodeToEmail(ctx, jti, email);
        }
      } else {
        throw new RequestError('session.insufficient_info');
      }

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
    '/session/register/:registerFlowType',
    koaGuard({
      params: object({ registerFlowType: nativeEnum(RegisterFlowType) }),
      body: registerParametersGuard,
    }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const { registerFlowType } = ctx.guard.params;

      if (
        registerFlowType === RegisterFlowType.UsernameAndPassword &&
        ctx.guard.body.UsernameAndPassword
      ) {
        const { username, password } = ctx.guard.body.UsernameAndPassword;
        await registerWithUsernameAndPassword(ctx, provider, username, password);
      } else if (registerFlowType === RegisterFlowType.Email && ctx.guard.body.Email) {
        const { email, code } = ctx.guard.body.Email;
        await registerWithEmailAndPasscode(ctx, provider, { jti, email, code });
      } else if (registerFlowType === RegisterFlowType.Phone && ctx.guard.body.Phone) {
        const { phone, code } = ctx.guard.body.Phone;
        await registerWithPhoneAndPasscode(ctx, provider, { jti, phone, code });
      } else if (registerFlowType === RegisterFlowType.Social && ctx.guard.body.Social) {
        const { connectorId, code, state } = ctx.guard.body.Social;

        if (connectorId && state && !code) {
          await assignRedirectUrlForSocial(ctx, connectorId, state);
        } else if (connectorId && code) {
          await registerWithSocial(ctx, provider, { connectorId, code });
        }
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
