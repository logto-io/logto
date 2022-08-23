import { PasscodeType } from '@logto/schemas';
import { emailRegEx, phoneRegEx } from '@logto/shared';
import { Provider } from 'oidc-provider';
import { object, string } from 'zod';

import RequestError from '@/errors/RequestError';
import { createPasscode, sendPasscode, verifyPasscode } from '@/lib/passcode';
import { assignInteractionResults } from '@/lib/session';
import { generateUserId, insertUser, updateLastSignInAt } from '@/lib/user';
import koaGuard from '@/middleware/koa-guard';
import {
  hasUserWithEmail,
  hasUserWithPhone,
  findUserByEmail,
  findUserByPhone,
} from '@/queries/user';
import assertThat from '@/utils/assert-that';

import { AnonymousRouter } from '../types';

export default function sessionPasswordlessRoutes<T extends AnonymousRouter>(
  router: T,
  provider: Provider
) {
  router.post(
    '/session/sign-in/passwordless/sms/send-passcode',
    koaGuard({ body: object({ phone: string().regex(phoneRegEx) }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const { phone } = ctx.guard.body;
      const type = 'SignInSmsSendPasscode';
      ctx.log(type, { phone });

      assertThat(
        await hasUserWithPhone(phone),
        new RequestError({ code: 'user.phone_not_exists', status: 422 })
      );

      const passcode = await createPasscode(jti, PasscodeType.SignIn, { phone });
      const { db } = await sendPasscode(passcode);
      ctx.log(type, { connectorId: db.id });
      ctx.status = 204;

      return next();
    }
  );

  router.post(
    '/session/sign-in/passwordless/sms/verify-passcode',
    koaGuard({ body: object({ phone: string().regex(phoneRegEx), code: string() }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const { phone, code } = ctx.guard.body;
      const type = 'SignInSms';
      ctx.log(type, { phone, code });

      assertThat(
        await hasUserWithPhone(phone),
        new RequestError({ code: 'user.phone_not_exists', status: 422 })
      );

      await verifyPasscode(jti, PasscodeType.SignIn, code, { phone });
      const { id } = await findUserByPhone(phone);
      ctx.log(type, { userId: id });

      await updateLastSignInAt(id);
      await assignInteractionResults(ctx, provider, { login: { accountId: id } }, true);

      return next();
    }
  );

  router.post(
    '/session/sign-in/passwordless/email/send-passcode',
    koaGuard({ body: object({ email: string().regex(emailRegEx) }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const { email } = ctx.guard.body;
      const type = 'SignInEmailSendPasscode';
      ctx.log(type, { email });

      assertThat(
        await hasUserWithEmail(email),
        new RequestError({ code: 'user.email_not_exists', status: 422 })
      );

      const passcode = await createPasscode(jti, PasscodeType.SignIn, { email });
      const { db } = await sendPasscode(passcode);
      ctx.log(type, { connectorId: db.id });
      ctx.status = 204;

      return next();
    }
  );

  router.post(
    '/session/sign-in/passwordless/email/verify-passcode',
    koaGuard({ body: object({ email: string().regex(emailRegEx), code: string() }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const { email, code } = ctx.guard.body;
      const type = 'SignInEmail';
      ctx.log(type, { email, code });

      assertThat(
        await hasUserWithEmail(email),
        new RequestError({ code: 'user.email_not_exists', status: 422 })
      );

      await verifyPasscode(jti, PasscodeType.SignIn, code, { email });
      const { id } = await findUserByEmail(email);
      ctx.log(type, { userId: id });

      await updateLastSignInAt(id);
      await assignInteractionResults(ctx, provider, { login: { accountId: id } }, true);

      return next();
    }
  );

  router.post(
    '/session/register/passwordless/sms/send-passcode',
    koaGuard({ body: object({ phone: string().regex(phoneRegEx) }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const { phone } = ctx.guard.body;
      const type = 'RegisterSmsSendPasscode';
      ctx.log(type, { phone });

      assertThat(
        !(await hasUserWithPhone(phone)),
        new RequestError({ code: 'user.phone_exists_register', status: 422 })
      );

      const passcode = await createPasscode(jti, PasscodeType.Register, { phone });
      const { db } = await sendPasscode(passcode);
      ctx.log(type, { connectorId: db.id });
      ctx.status = 204;

      return next();
    }
  );

  router.post(
    '/session/register/passwordless/sms/verify-passcode',
    koaGuard({ body: object({ phone: string().regex(phoneRegEx), code: string() }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const { phone, code } = ctx.guard.body;
      const type = 'RegisterSms';
      ctx.log(type, { phone, code });

      assertThat(
        !(await hasUserWithPhone(phone)),
        new RequestError({ code: 'user.phone_exists_register', status: 422 })
      );

      await verifyPasscode(jti, PasscodeType.Register, code, { phone });
      const id = await generateUserId();
      ctx.log(type, { userId: id });

      await insertUser({ id, primaryPhone: phone });
      await updateLastSignInAt(id);
      await assignInteractionResults(ctx, provider, { login: { accountId: id } });

      return next();
    }
  );

  router.post(
    '/session/register/passwordless/email/send-passcode',
    koaGuard({ body: object({ email: string().regex(emailRegEx) }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const { email } = ctx.guard.body;
      const type = 'RegisterEmailSendPasscode';
      ctx.log(type, { email });

      assertThat(
        !(await hasUserWithEmail(email)),
        new RequestError({ code: 'user.email_exists_register', status: 422 })
      );

      const passcode = await createPasscode(jti, PasscodeType.Register, { email });
      const { db } = await sendPasscode(passcode);
      ctx.log(type, { connectorId: db.id });
      ctx.status = 204;

      return next();
    }
  );

  router.post(
    '/session/register/passwordless/email/verify-passcode',
    koaGuard({ body: object({ email: string().regex(emailRegEx), code: string() }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const { email, code } = ctx.guard.body;
      const type = 'RegisterEmail';
      ctx.log(type, { email, code });

      assertThat(
        !(await hasUserWithEmail(email)),
        new RequestError({ code: 'user.email_exists_register', status: 422 })
      );

      await verifyPasscode(jti, PasscodeType.Register, code, { email });
      const id = await generateUserId();
      ctx.log(type, { userId: id });

      await insertUser({ id, primaryEmail: email });
      await updateLastSignInAt(id);
      await assignInteractionResults(ctx, provider, { login: { accountId: id } });

      return next();
    }
  );
}
