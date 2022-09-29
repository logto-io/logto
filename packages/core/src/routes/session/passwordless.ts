import { emailRegEx, phoneRegEx } from '@logto/core-kit';
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
  findUserByEmail,
  findUserByPhone,
  hasUserWithEmail,
  hasUserWithPhone,
} from '@/queries/user';
import { flowTypeGuard } from '@/routes/session/types';
import assertThat from '@/utils/assert-that';

import { AnonymousRouter } from '../types';
import { verificationTimeout } from './consts';
import {
  getAndCheckVerificationStorage,
  getRoutePrefix,
  getPasscodeType,
  getPasswordlessRelatedLogType,
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

  router.post(`${signInRoute}/sms`, async (ctx, next) => {
    const type = getPasswordlessRelatedLogType('sign-in', 'sms');
    const { phone } = await getAndCheckVerificationStorage(ctx, provider, type, 'sign-in');

    assertThat(
      phone && (await hasUserWithPhone(phone)),
      new RequestError({ code: 'user.phone_not_exists', status: 422 })
    );

    const { id } = await findUserByPhone(phone);
    ctx.log(type, { userId: id });

    await updateUserById(id, { lastSignInAt: Date.now() });
    await assignInteractionResults(ctx, provider, { login: { accountId: id } }, true);

    return next();
  });

  router.post(`${signInRoute}/email`, async (ctx, next) => {
    const type = getPasswordlessRelatedLogType('sign-in', 'email');
    const { email } = await getAndCheckVerificationStorage(ctx, provider, type, 'sign-in');

    assertThat(
      email && (await hasUserWithEmail(email)),
      new RequestError({ code: 'user.email_not_exists', status: 422 })
    );
    const { id } = await findUserByEmail(email);

    ctx.log(type, { userId: id });

    await updateUserById(id, { lastSignInAt: Date.now() });
    await assignInteractionResults(ctx, provider, { login: { accountId: id } }, true);

    return next();
  });

  router.post(`${registerRoute}/sms`, async (ctx, next) => {
    const type = getPasswordlessRelatedLogType('register', 'sms');
    const { phone } = await getAndCheckVerificationStorage(ctx, provider, type, 'register');

    assertThat(
      phone && !(await hasUserWithPhone(phone)),
      new RequestError({ code: 'user.phone_exists_register', status: 422 })
    );

    const id = await generateUserId();
    ctx.log(type, { userId: id });

    await insertUser({ id, primaryPhone: phone, lastSignInAt: Date.now() });
    await assignInteractionResults(ctx, provider, { login: { accountId: id } }, true);

    return next();
  });

  router.post(`${registerRoute}/email`, async (ctx, next) => {
    const type = getPasswordlessRelatedLogType('register', 'email');
    const { email } = await getAndCheckVerificationStorage(ctx, provider, type, 'register');

    assertThat(
      email && !(await hasUserWithEmail(email)),
      new RequestError({ code: 'user.email_exists_register', status: 422 })
    );

    const id = await generateUserId();
    ctx.log(type, { userId: id });

    await insertUser({ id, primaryEmail: email, lastSignInAt: Date.now() });
    await assignInteractionResults(ctx, provider, { login: { accountId: id } }, true);

    return next();
  });
}
