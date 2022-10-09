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
  findUserByEmail,
  findUserByPhone,
  hasUserWithEmail,
  hasUserWithPhone,
  updateUserById,
} from '@/queries/user';
import { passcodeTypeGuard } from '@/routes/session/types';
import assertThat from '@/utils/assert-that';

import { AnonymousRouter } from '../types';
import { verificationTimeout } from './consts';
import {
  assignVerificationResult,
  getPasswordlessRelatedLogType,
  getRoutePrefix,
  parseVerificationStorage,
  checkVerificationSessionByFlow,
} from './utils';

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
        flow: passcodeTypeGuard,
      }),
    }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const {
        body: { phone, flow },
      } = ctx.guard;

      const type = getPasswordlessRelatedLogType(flow, 'sms', 'send');
      ctx.log(type, { phone });

      const passcode = await createPasscode(jti, flow, { phone });
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
        flow: passcodeTypeGuard,
      }),
    }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const {
        body: { email, flow },
      } = ctx.guard;

      const type = getPasswordlessRelatedLogType(flow, 'email', 'send');
      ctx.log(type, { email });

      const passcode = await createPasscode(jti, flow, { email });
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
        flow: passcodeTypeGuard,
      }),
    }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const {
        body: { phone, code, flow },
      } = ctx.guard;

      const type = getPasswordlessRelatedLogType(flow, 'sms', 'verify');
      ctx.log(type, { phone });

      await verifyPasscode(jti, flow, code, { phone });

      await assignVerificationResult(ctx, provider, {
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
        flow: passcodeTypeGuard,
      }),
    }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const {
        body: { email, code, flow },
      } = ctx.guard;

      const type = getPasswordlessRelatedLogType(flow, 'email', 'verify');
      ctx.log(type, { email });

      await verifyPasscode(jti, flow, code, { email });

      await assignVerificationResult(ctx, provider, {
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

  router.post(`${signInRoute}/sms`, async (ctx, next) => {
    const { result } = await provider.interactionDetails(ctx.req, ctx.res);
    const verificationStorage = parseVerificationStorage(result);

    const { phone, flow, expiresAt } = verificationStorage;
    assertThat(phone, new RequestError({ code: 'session.passwordless_not_verified', status: 401 }));

    const type = getPasswordlessRelatedLogType(PasscodeType.SignIn, 'sms');
    ctx.log(type, { phone, flow, expiresAt });

    checkVerificationSessionByFlow(PasscodeType.SignIn, verificationStorage);

    assertThat(
      await hasUserWithPhone(phone),
      new RequestError({ code: 'user.phone_not_exists', status: 422 })
    );
    const { id } = await findUserByPhone(phone);
    ctx.log(type, { userId: id });

    await updateUserById(id, { lastSignInAt: Date.now() });
    await assignInteractionResults(ctx, provider, { login: { accountId: id } });

    return next();
  });

  router.post(`${signInRoute}/email`, async (ctx, next) => {
    const { result } = await provider.interactionDetails(ctx.req, ctx.res);
    const verificationStorage = parseVerificationStorage(result);

    const { email, flow, expiresAt } = verificationStorage;
    assertThat(email, new RequestError({ code: 'session.passwordless_not_verified', status: 401 }));

    const type = getPasswordlessRelatedLogType(PasscodeType.SignIn, 'email');
    ctx.log(type, { email, flow, expiresAt });

    checkVerificationSessionByFlow(PasscodeType.SignIn, verificationStorage);

    assertThat(
      await hasUserWithEmail(email),
      new RequestError({ code: 'user.email_not_exists', status: 422 })
    );
    const { id } = await findUserByEmail(email);
    ctx.log(type, { userId: id });

    await updateUserById(id, { lastSignInAt: Date.now() });
    await assignInteractionResults(ctx, provider, { login: { accountId: id } });

    return next();
  });

  router.post(`${registerRoute}/sms`, async (ctx, next) => {
    const { result } = await provider.interactionDetails(ctx.req, ctx.res);
    const verificationStorage = parseVerificationStorage(result);

    const { phone, flow, expiresAt } = verificationStorage;
    assertThat(phone, new RequestError({ code: 'session.passwordless_not_verified', status: 401 }));

    const type = getPasswordlessRelatedLogType(PasscodeType.Register, 'sms');
    ctx.log(type, { phone, flow, expiresAt });

    checkVerificationSessionByFlow(PasscodeType.Register, verificationStorage);

    assertThat(
      !(await hasUserWithPhone(phone)),
      new RequestError({ code: 'user.phone_exists_register', status: 422 })
    );
    const id = await generateUserId();
    ctx.log(type, { userId: id });

    await insertUser({ id, primaryPhone: phone, lastSignInAt: Date.now() });
    await assignInteractionResults(ctx, provider, { login: { accountId: id } });

    return next();
  });

  router.post(`${registerRoute}/email`, async (ctx, next) => {
    const { result } = await provider.interactionDetails(ctx.req, ctx.res);
    const verificationStorage = parseVerificationStorage(result);

    const { email, flow, expiresAt } = verificationStorage;
    assertThat(email, new RequestError({ code: 'session.passwordless_not_verified', status: 401 }));

    const type = getPasswordlessRelatedLogType(PasscodeType.Register, 'email');
    ctx.log(type, { email, flow, expiresAt });

    checkVerificationSessionByFlow(PasscodeType.Register, verificationStorage);

    assertThat(
      !(await hasUserWithEmail(email)),
      new RequestError({ code: 'user.email_exists_register', status: 422 })
    );
    const id = await generateUserId();
    ctx.log(type, { userId: id });

    await insertUser({ id, primaryEmail: email, lastSignInAt: Date.now() });
    await assignInteractionResults(ctx, provider, { login: { accountId: id } });

    return next();
  });
}
