import { LogtoErrorCode } from '@logto/phrases';
import { conditional } from '@silverhand/essentials';
import { Provider } from 'oidc-provider';
import { object, string } from 'zod';

import RequestError from '@/errors/RequestError';
import koaGuard from '@/middleware/koa-guard';
import { findUserByUsername } from '@/queries/user';
import assertThat from '@/utils/assert-that';
import { encryptPassword } from '@/utils/password';

import { AnonymousRouter } from './types';

export default function sessionRoutes<T extends AnonymousRouter>(router: T, provider: Provider) {
  router.post(
    '/session',
    koaGuard({ body: object({ username: string().optional(), password: string().optional() }) }),
    async (ctx, next) => {
      const interaction = await provider.interactionDetails(ctx.req, ctx.res);
      const {
        prompt: { name },
      } = interaction;

      if (name === 'login') {
        const { username, password } = ctx.guard.body;

        assertThat(username && password, 'session.insufficient_info');

        try {
          const { id, passwordEncrypted, passwordEncryptionMethod, passwordEncryptionSalt, block } =
            await findUserByUsername(username);

          assertThat(
            passwordEncrypted && passwordEncryptionMethod && passwordEncryptionSalt,
            'session.invalid_sign_in_method'
          );

          assertThat(
            encryptPassword(id, password, passwordEncryptionSalt, passwordEncryptionMethod) ===
              passwordEncrypted,
            'session.invalid_credentials'
          );

          if (block) {
            const accessDeniedError = new RequestError('oidc.access_denied');
            const redirectUriWithError = await provider.interactionResult(ctx.req, ctx.res, {
              error: 'access_denied',
              error_description: accessDeniedError.message,
            });
            ctx.body = { redirectTo: redirectUriWithError };
          } else {
            const redirectTo = await provider.interactionResult(
              ctx.req,
              ctx.res,
              {
                login: { accountId: id },
              },
              { mergeWithLastSubmission: false }
            );
            ctx.body = { redirectTo };
          }
        } catch (error: unknown) {
          if (!(error instanceof RequestError)) {
            throw new RequestError('session.invalid_credentials');
          }

          throw error;
        }
      } else if (name === 'consent') {
        ctx.body = { redirectTo: ctx.request.origin + '/session/consent' };
      } else {
        throw new Error(`Prompt not supported: ${name}`);
      }

      return next();
    }
  );

  router.post('/session/consent', async (ctx, next) => {
    const interaction = await provider.interactionDetails(ctx.req, ctx.res);
    const { session, grantId, params, prompt } = interaction;
    assertThat(session, 'session.not_found');

    const { scope } = object({
      scope: string().optional(),
    }).parse(params);

    // LOG-49: Connect and check scope with resource indicators
    const scopes = scope?.split(' ') ?? [];
    const invalidScopes = scopes.filter((scope) => !['openid', 'offline_access'].includes(scope));
    assertThat(invalidScopes.length === 0, 'oidc.invalid_scope', {
      count: invalidScopes.length,
      scopes: invalidScopes.join(', '),
    });

    const { accountId } = session;
    const grant =
      conditional(grantId && (await provider.Grant.find(grantId))) ??
      new provider.Grant({ accountId, clientId: String(params.client_id) });

    // V2: fulfill missing claims / resources
    const PromptDetailsBody = object({
      missingOIDCScope: string().array().optional(),
    });
    const { missingOIDCScope } = PromptDetailsBody.parse(prompt.details);

    if (missingOIDCScope) {
      grant.addOIDCScope(missingOIDCScope.join(' '));
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
