import assert from 'assert';
import Router from 'koa-router';
import { object, string } from 'zod';
import { encryptPassword } from '@/utils/password';
import { findUserByUsername } from '@/queries/user';
import { Provider } from 'oidc-provider';
import { conditional } from '@logto/essentials';
import koaGuard from '@/middleware/koa-guard';
import RequestError from '@/errors/RequestError';
import { LogtoErrorCode } from '@logto/phrases';

export default function sessionRoutes(router: Router, provider: Provider) {
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

        assert(username && password, new RequestError('session.insufficient_info'));

        try {
          const { id, passwordEncrypted, passwordEncryptionMethod, passwordEncryptionSalt } =
            await findUserByUsername(username);

          assert(
            passwordEncrypted && passwordEncryptionMethod && passwordEncryptionSalt,
            new RequestError('session.invalid_sign_in_method')
          );
          assert(
            encryptPassword(id, password, passwordEncryptionSalt, passwordEncryptionMethod) ===
              passwordEncrypted,
            new RequestError('session.invalid_credentials')
          );

          const redirectTo = await provider.interactionResult(
            ctx.req,
            ctx.res,
            {
              login: { accountId: id },
            },
            { mergeWithLastSubmission: false }
          );
          ctx.body = { redirectTo };
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

    const { scope } = object({
      scope: string().optional(),
    }).parse(params);

    // LOG-49: Connect and check scope with resource indicators
    const scopes = scope?.split(' ') ?? [];
    const invalidScopes = scopes.filter((scope) => !['openid', 'offline_access'].includes(scope));
    assert(
      invalidScopes.length === 0,
      new RequestError({
        code: 'oidc.invalid_scope',
        count: invalidScopes.length,
        scopes: invalidScopes.join(', '),
      })
    );

    assert(session, 'Session not found');
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
