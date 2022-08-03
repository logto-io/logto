import path from 'path';

import { LogtoErrorCode } from '@logto/phrases';
import { UserRole } from '@logto/schemas';
import { adminConsoleApplicationId } from '@logto/schemas/lib/seeds';
import { passwordRegEx, usernameRegEx } from '@logto/shared';
import { conditional } from '@silverhand/essentials';
import { Provider } from 'oidc-provider';
import { object, string } from 'zod';

import RequestError from '@/errors/RequestError';
import { assignInteractionResults, saveUserFirstConsentedAppId } from '@/lib/session';
import {
  encryptUserPassword,
  generateUserId,
  findUserByUsernameAndPassword,
  updateLastSignInAt,
} from '@/lib/user';
import koaGuard from '@/middleware/koa-guard';
import { hasUser, insertUser, hasActiveUsers } from '@/queries/user';
import assertThat from '@/utils/assert-that';

import { AnonymousRouter } from '../types';

export default function sessionRoutes<T extends AnonymousRouter>(router: T, provider: Provider) {
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

  router.post(
    '/session/sign-in/username-password',
    koaGuard({
      body: object({
        username: string().min(1),
        password: string().min(1),
      }),
    }),
    async (ctx, next) => {
      const {
        params: { client_id },
      } = await provider.interactionDetails(ctx.req, ctx.res);
      const { username, password } = ctx.guard.body;
      const type = 'SignInUsernamePassword';
      ctx.log(type, { username });

      const { id, roleNames } = await findUserByUsernameAndPassword(username, password);

      // Temp solution before migrating to RBAC. As AC sign-in exp currently hardcoded to username password only.
      if (String(client_id) === adminConsoleApplicationId) {
        assertThat(
          roleNames.includes(UserRole.Admin),
          new RequestError({ code: 'auth.forbidden', status: 403 })
        );
      }

      ctx.log(type, { userId: id });
      await updateLastSignInAt(id);
      await assignInteractionResults(ctx, provider, { login: { accountId: id } }, true);

      return next();
    }
  );

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

  router.post(
    '/session/register/username-password',
    koaGuard({
      body: object({
        username: string().regex(usernameRegEx),
        password: string().regex(passwordRegEx),
      }),
    }),
    async (ctx, next) => {
      const { username, password } = ctx.guard.body;
      const type = 'RegisterUsernamePassword';
      ctx.log(type, { username });

      assertThat(
        !(await hasUser(username)),
        new RequestError({
          code: 'user.username_exists_register',
          status: 422,
        })
      );

      const {
        params: { client_id },
      } = await provider.interactionDetails(ctx.req, ctx.res);

      const createAdminUser =
        String(client_id) === adminConsoleApplicationId && !(await hasActiveUsers());
      const roleNames = createAdminUser ? [UserRole.Admin] : [];

      const id = await generateUserId();

      ctx.log(type, { userId: id, roleNames });

      const { passwordEncrypted, passwordEncryptionMethod } = await encryptUserPassword(password);

      await insertUser({
        id,
        username,
        passwordEncrypted,
        passwordEncryptionMethod,
        roleNames,
      });
      await updateLastSignInAt(id);
      await assignInteractionResults(ctx, provider, { login: { accountId: id } });

      return next();
    }
  );

  router.delete('/session', async (ctx, next) => {
    await provider.interactionDetails(ctx.req, ctx.res);
    const error: LogtoErrorCode = 'oidc.aborted';
    await assignInteractionResults(ctx, provider, { error });

    return next();
  });
}
