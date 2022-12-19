import path from 'path';

import type { LogtoErrorCode } from '@logto/phrases';
import { UserRole } from '@logto/schemas';
import { adminConsoleApplicationId } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import type { Provider } from 'oidc-provider';
import { object, string } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { assignInteractionResults, saveUserFirstConsentedAppId } from '#src/libraries/session.js';
import { findUserById } from '#src/queries/user.js';
import assertThat from '#src/utils/assert-that.js';

import type { AnonymousRouterLegacy } from '../types.js';
import continueRoutes from './continue.js';
import forgotPasswordRoutes from './forgot-password.js';
import koaGuardSessionAction from './middleware/koa-guard-session-action.js';
import passwordRoutes from './password.js';
import passwordlessRoutes from './passwordless.js';
import socialRoutes from './social.js';
import { getRoutePrefix } from './utils.js';

export default function sessionRoutes<T extends AnonymousRouterLegacy>(
  router: T,
  provider: Provider
) {
  router.use(getRoutePrefix('sign-in'), koaGuardSessionAction(provider, 'sign-in'));
  router.use(getRoutePrefix('register'), koaGuardSessionAction(provider, 'register'));

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

    // Temp solution before migrating to RBAC. Block non-admin user from consenting to admin console
    if (String(client_id) === adminConsoleApplicationId) {
      const { roleNames } = await findUserById(accountId);

      assertThat(
        roleNames.includes(UserRole.Admin),
        new RequestError({ code: 'auth.forbidden', status: 401 })
      );
    }

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

  passwordRoutes(router, provider);
  passwordlessRoutes(router, provider);
  socialRoutes(router, provider);
  continueRoutes(router, provider);
  forgotPasswordRoutes(router, provider);
}
