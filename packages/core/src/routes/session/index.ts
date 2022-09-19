import path from 'path';

import { LogtoErrorCode } from '@logto/phrases';
import { conditional } from '@silverhand/essentials';
import { Provider } from 'oidc-provider';
import { object, string } from 'zod';

import RequestError from '@/errors/RequestError';
import { assignInteractionResults, saveUserFirstConsentedAppId } from '@/lib/session';
import assertThat from '@/utils/assert-that';

import { AnonymousRouter } from '../types';
import forgotPasswordRoutes from './forgot-password';
import koaGuardSessionAction from './middleware/koa-guard-session-action';
import passwordlessRoutes from './passwordless';
import socialRoutes from './social';
import usernamePasswordRoutes from './username-password';
import { getRoutePrefix } from './utils';

export default function sessionRoutes<T extends AnonymousRouter>(router: T, provider: Provider) {
  router.use(getRoutePrefix('sign-in'), koaGuardSessionAction(provider, 'sign-in'));
  router.use(getRoutePrefix('register'), koaGuardSessionAction(provider, 'register'));
  router.use(getRoutePrefix('forgot-password'), koaGuardSessionAction(provider));

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

  router.delete('/session', async (ctx, next) => {
    await provider.interactionDetails(ctx.req, ctx.res);
    const error: LogtoErrorCode = 'oidc.aborted';
    await assignInteractionResults(ctx, provider, { error });

    return next();
  });

  usernamePasswordRoutes(router, provider);
  passwordlessRoutes(router, provider);
  socialRoutes(router, provider);

  forgotPasswordRoutes(router, provider);
}
