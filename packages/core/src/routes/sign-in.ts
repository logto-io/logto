import assert from 'assert';
import Router from 'koa-router';
import { object, string } from 'zod';
import { encryptPassword } from '@/utils/password';
import { findUserById } from '@/queries/user';
import { Provider } from 'oidc-provider';
import { conditional } from '@logto/essentials';
import koaGuard from '@/middleware/koa-guard';
import { OidcErrorCode } from '@/errors/RequestError';

export default function createSignInRoutes(provider: Provider) {
  const router = new Router();

  router.post(
    '/sign-in',
    koaGuard({ body: object({ id: string().optional(), password: string().optional() }) }),
    async (ctx) => {
      const {
        prompt: { name },
      } = await provider.interactionDetails(ctx.req, ctx.res);

      if (name === 'login') {
        const { id, password } = ctx.guard.body;

        assert(id && password, 'Insufficent sign-in info.');
        const { passwordEncrypted, passwordEncryptionMethod, passwordEncryptionSalt } =
          await findUserById(id);

        assert(passwordEncrypted && passwordEncryptionMethod && passwordEncryptionSalt);
        assert(
          encryptPassword(id, password, passwordEncryptionSalt, passwordEncryptionMethod) ===
            passwordEncrypted
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
      } else if (name === 'consent') {
        ctx.body = { redirectTo: ctx.request.origin + '/sign-in/consent' };
      } else {
        throw new Error(`Prompt not supported: ${name}`);
      }
    }
  );

  router.post('/sign-in/consent', async (ctx) => {
    const { session, grantId, params, prompt } = await provider.interactionDetails(
      ctx.req,
      ctx.res
    );

    assert(session, 'Session not found');
    const { accountId } = session;
    const grant =
      conditional(grantId && (await provider.Grant.find(grantId))) ??
      new provider.Grant({ accountId, clientId: String(params.client_id) });

    // V2: fulfill  Missing claims / resources
    const PromptDetailsBody = object({
      missingOIDCScope: string().array().optional(),
    });
    const { missingOIDCScope } = PromptDetailsBody.parse(prompt.details);

    if (missingOIDCScope) {
      grant.addOIDCScope(missingOIDCScope.join(' '));
    }

    const finalGrantId = await grant.save();

    // V2: configur E consent
    const redirectTo = await provider.interactionResult(
      ctx.req,
      ctx.res,
      { consent: { grantId: finalGrantId } },
      { mergeWithLastSubmission: true }
    );
    ctx.body = { redirectTo };
  });

  router.post('/sign-in/abort', async (ctx) => {
    await provider.interactionDetails(ctx.req, ctx.res);
    const redirectTo = await provider.interactionResult(ctx.req, ctx.res, {
      error: OidcErrorCode.Aborted,
    });
    ctx.body = { redirectTo };
  });

  return router.routes();
}
