import { LogtoErrorCode } from '@logto/phrases';
import { PasscodeType, UserLogType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { Provider } from 'oidc-provider';
import { object, string } from 'zod';

import RequestError from '@/errors/RequestError';
import { createPasscode, sendPasscode, verifyPasscode } from '@/lib/passcode';
import { encryptUserPassword, generateUserId, signInWithUsernameAndPassword } from '@/lib/user';
import koaGuard from '@/middleware/koa-guard';
import { findUserByEmail, hasUser, insertUser } from '@/queries/user';
import assertThat from '@/utils/assert-that';
import { emailReg } from '@/utils/regex';

import { AnonymousRouter } from './types';

export default function sessionRoutes<T extends AnonymousRouter>(router: T, provider: Provider) {
  router.post(
    '/session',
    koaGuard({
      body: object({
        username: string().optional(),
        password: string().optional(),
        email: string().optional(),
        code: string().optional(),
      }),
    }),
    async (ctx, next) => {
      const interaction = await provider.interactionDetails(ctx.req, ctx.res);
      const {
        jti,
        prompt: { name },
      } = interaction;

      if (name === 'consent') {
        ctx.body = { redirectTo: ctx.request.origin + '/session/consent' };

        return next();
      }

      if (name === 'login') {
        const { username, password, email, code } = ctx.guard.body;

        assertThat(!email || emailReg.test(email), new RequestError('user.invalid_email'));

        if (email && !code) {
          // Request passcode for email
          const passcode = await createPasscode(jti, PasscodeType.SignIn, { email });
          await sendPasscode(passcode);
          ctx.state = 204;
        } else if (email && code) {
          // Sign In with Email
          ctx.userLog.email = email;
          ctx.userLog.type = UserLogType.SignInEmail;

          await verifyPasscode(jti, PasscodeType.SignIn, code, { email });
          const { id } = await findUserByEmail(email);

          const redirectTo = await provider.interactionResult(
            ctx.req,
            ctx.res,
            {
              login: { accountId: id },
            },
            { mergeWithLastSubmission: false }
          );
          ctx.body = { redirectTo };
        } else {
          assertThat(username && password, 'session.insufficient_info');

          ctx.userLog.username = username;
          ctx.userLog.type = UserLogType.SignInUsernameAndPassword;

          const { id } = await signInWithUsernameAndPassword(username, password);

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
        username: string().min(3),
        password: string().min(6),
      }),
    }),
    async (ctx, next) => {
      const { username, password } = ctx.guard.body;

      if (await hasUser(username)) {
        throw new RequestError('user.username_exists');
      }

      const id = await generateUserId();

      const { passwordEncryptionSalt, passwordEncrypted, passwordEncryptionMethod } =
        encryptUserPassword(id, password);

      await insertUser({
        id,
        username,
        passwordEncrypted,
        passwordEncryptionMethod,
        passwordEncryptionSalt,
      });

      const redirectTo = await provider.interactionResult(
        ctx.req,
        ctx.res,
        {
          login: { accountId: id },
        },
        { mergeWithLastSubmission: false }
      );
      ctx.body = { redirectTo };

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
