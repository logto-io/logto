import assert from 'assert';
import Router from 'koa-router';
import koaBody from 'koa-body';
import { object, string } from 'zod';
import { encryptPassword } from '@/utils/password';
import { findUserById } from '@/queries/user';
import { Provider } from 'oidc-provider';
import { conditional } from '@logto/essentials';

export default function createSignInRoutes(provider: Provider) {
  const router = new Router();

  router.post('/sign-in', koaBody(), async (ctx) => {
    const {
      prompt: { name },
    } = await provider.interactionDetails(ctx.req, ctx.res);

    if (name === 'login') {
      const SignInBody = object({
        id: string().min(1),
        password: string().min(1),
      });
      const { id, password } = SignInBody.parse(ctx.request.body);

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
  });

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
  });

  return router.routes();
}
