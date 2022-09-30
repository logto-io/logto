import { emailRegEx, phoneRegEx } from '@logto/core-kit';
import { PasscodeType } from '@logto/schemas';
import dayjs from 'dayjs';
import { Provider } from 'oidc-provider';
import { object, string } from 'zod';

import RequestError from '@/errors/RequestError';
import { createPasscode, sendPasscode, verifyPasscode } from '@/lib/passcode';
import { assignInteractionResults } from '@/lib/session';
import { generateUserId, insertUser } from '@/lib/user';
import koaGuard from '@/middleware/koa-guard';
import {
  updateUserById,
  hasUserWithEmail,
  hasUserWithPhone,
  findUserByEmail,
  findUserByPhone,
} from '@/queries/user';
import { flowTypeGuard } from '@/routes/session/types';
import assertThat from '@/utils/assert-that';

import { AnonymousRouter } from '../types';
import { verificationTimeout } from './consts';
import { getPasscodeType, getPasswordlessRelatedLogType, getRoutePrefix } from './utils';

export const registerRoute = getRoutePrefix('register', 'passwordless');
export const signInRoute = getRoutePrefix('sign-in', 'passwordless');

export default function passwordlessRoutes<T extends AnonymousRouter>(
  router: T,
  provider: Provider
) {
  router.post(
    '/session/passwordless/sms/send',
    koaGuard({
      body: object({
        phone: string().regex(phoneRegEx),
        flow: flowTypeGuard,
      }),
    }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const {
        body: { phone, flow },
      } = ctx.guard;

      const type = getPasswordlessRelatedLogType(flow, 'sms', 'send');
      ctx.log(type, { phone });

      const passcodeType = getPasscodeType(flow);
      const passcode = await createPasscode(jti, passcodeType, { phone });
      const { dbEntry } = await sendPasscode(passcode);
      ctx.log(type, { connectorId: dbEntry.id });
      ctx.status = 204;

      return next();
    }
  );

  router.post(
    '/session/passwordless/email/send',
    koaGuard({
      body: object({
        email: string().regex(emailRegEx),
        flow: flowTypeGuard,
      }),
    }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const {
        body: { email, flow },
      } = ctx.guard;

      const type = getPasswordlessRelatedLogType(flow, 'email', 'send');
      ctx.log(type, { email });

      const passcodeType = getPasscodeType(flow);
      const passcode = await createPasscode(jti, passcodeType, { email });
      const { dbEntry } = await sendPasscode(passcode);
      ctx.log(type, { connectorId: dbEntry.id });
      ctx.status = 204;

      return next();
    }
  );

  router.post(
    '/session/passwordless/sms/verify',
    koaGuard({
      body: object({
        phone: string().regex(phoneRegEx),
        code: string(),
        flow: flowTypeGuard,
      }),
    }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const {
        body: { phone, code, flow },
      } = ctx.guard;

      const type = getPasswordlessRelatedLogType(flow, 'sms', 'verify');
      ctx.log(type, { phone });

      const passcodeType = getPasscodeType(flow);
      await verifyPasscode(jti, passcodeType, code, { phone });

      await provider.interactionResult(ctx.req, ctx.res, {
        verification: {
          flow,
          expiresAt: dayjs().add(verificationTimeout, 'second').toISOString(),
          phone,
        },
      });
      ctx.status = 204;

      return next();
    }
  );

  router.post(
    '/session/passwordless/email/verify',
    koaGuard({
      body: object({
        email: string().regex(emailRegEx),
        code: string(),
        flow: flowTypeGuard,
      }),
    }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const {
        body: { email, code, flow },
      } = ctx.guard;

      const type = getPasswordlessRelatedLogType(flow, 'email', 'verify');
      ctx.log(type, { email });

      const passcodeType = getPasscodeType(flow);
      await verifyPasscode(jti, passcodeType, code, { email });

      await provider.interactionResult(ctx.req, ctx.res, {
        verification: {
          flow,
          expiresAt: dayjs().add(verificationTimeout, 'second').toISOString(),
          email,
        },
      });
      ctx.status = 204;

      return next();
    }
  );

  router.post(
    `${signInRoute}/sms/send-passcode`,
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
      const { dbEntry } = await sendPasscode(passcode);
      ctx.log(type, { connectorId: dbEntry.id });
      ctx.status = 204;

      return next();
    }
  );

  router.post(
    `${signInRoute}/sms/verify-passcode`,
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

      await updateUserById(id, { lastSignInAt: Date.now() });
      await assignInteractionResults(ctx, provider, { login: { accountId: id } }, true);

      return next();
    }
  );

  router.post(
    `${signInRoute}/email/send-passcode`,
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
      const { dbEntry } = await sendPasscode(passcode);
      ctx.log(type, { connectorId: dbEntry.id });
      ctx.status = 204;

      return next();
    }
  );

  router.post(
    `${signInRoute}/email/verify-passcode`,
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

      await updateUserById(id, { lastSignInAt: Date.now() });
      await assignInteractionResults(ctx, provider, { login: { accountId: id } }, true);

      return next();
    }
  );

  router.post(
    `${registerRoute}/sms/send-passcode`,
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
      const { dbEntry } = await sendPasscode(passcode);
      ctx.log(type, { connectorId: dbEntry.id });
      ctx.status = 204;

      return next();
    }
  );

  router.post(
    `${registerRoute}/sms/verify-passcode`,
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

      await insertUser({ id, primaryPhone: phone, lastSignInAt: Date.now() });
      await assignInteractionResults(ctx, provider, { login: { accountId: id } });

      return next();
    }
  );

  router.post(
    `${registerRoute}/email/send-passcode`,
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
      const { dbEntry } = await sendPasscode(passcode);
      ctx.log(type, { connectorId: dbEntry.id });
      ctx.status = 204;

      return next();
    }
  );

  router.post(
    `${registerRoute}/email/verify-passcode`,
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

      await insertUser({ id, primaryEmail: email, lastSignInAt: Date.now() });
      await assignInteractionResults(ctx, provider, { login: { accountId: id } });

      return next();
    }
  );
}
