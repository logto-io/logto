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
import {
  verificationGuard,
  flowTypeGuard,
  viaGuard,
  PasscodePayload,
} from '@/routes/session/types';
import assertThat from '@/utils/assert-that';

import { AnonymousRouter } from '../types';
import { verificationTimeout } from './consts';
import { getRoutePrefix, getPasscodeType, getPasswordlessRelatedLogType } from './utils';

export const registerRoute = getRoutePrefix('register', 'passwordless');
export const signInRoute = getRoutePrefix('sign-in', 'passwordless');

export default function passwordlessRoutes<T extends AnonymousRouter>(
  router: T,
  provider: Provider
) {
  router.post(
    '/session/passwordless/:via/send',
    koaGuard({
      body: object({
        phone: string().regex(phoneRegEx).optional(),
        email: string().regex(emailRegEx).optional(),
        flow: flowTypeGuard,
      }),
      params: object({ via: viaGuard }),
    }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const {
        body: { email, phone, flow },
        params: { via },
      } = ctx.guard;

      // eslint-disable-next-line @silverhand/fp/no-let
      let payload: PasscodePayload;

      if (via === 'email') {
        assertThat(email && !phone, new RequestError({ code: 'guard.invalid_input' }));
        // eslint-disable-next-line @silverhand/fp/no-mutation
        payload = { email };
      } else {
        assertThat(!email && phone, new RequestError({ code: 'guard.invalid_input' }));
        // eslint-disable-next-line @silverhand/fp/no-mutation
        payload = { phone };
      }

      const type = getPasswordlessRelatedLogType(flow, via, 'send');
      ctx.log(type, payload);

      const passcodeType = getPasscodeType(flow);
      const passcode = await createPasscode(jti, passcodeType, payload);
      const { dbEntry } = await sendPasscode(passcode);
      ctx.log(type, { connectorId: dbEntry.id });
      ctx.status = 204;

      return next();
    }
  );

  router.post(
    '/session/passwordless/:via/verify',
    koaGuard({
      body: object({
        phone: string().regex(phoneRegEx).optional(),
        email: string().regex(emailRegEx).optional(),
        code: string(),
        flow: flowTypeGuard,
      }),
      params: object({ via: viaGuard }),
    }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const {
        body: { email, phone, code, flow },
        params: { via },
      } = ctx.guard;

      // eslint-disable-next-line @silverhand/fp/no-let
      let payload: PasscodePayload;

      if (via === 'email') {
        assertThat(email && !phone, new RequestError({ code: 'guard.invalid_input' }));
        // eslint-disable-next-line @silverhand/fp/no-mutation
        payload = { email };
      } else {
        assertThat(!email && phone, new RequestError({ code: 'guard.invalid_input' }));
        // eslint-disable-next-line @silverhand/fp/no-mutation
        payload = { phone };
      }

      const type = getPasswordlessRelatedLogType(flow, via, 'verify');
      ctx.log(type, payload);

      const passcodeType = getPasscodeType(flow);
      await verifyPasscode(jti, passcodeType, code, payload);

      await provider.interactionResult(ctx.req, ctx.res, {
        verification: {
          flow,
          expiresAt: dayjs().add(verificationTimeout, 'second').toISOString(),
          ...payload,
        },
      });
      ctx.status = 204;

      return next();
    }
  );

  router.post(`${signInRoute}/sms`, async (ctx, next) => {
    const { result } = await provider.interactionDetails(ctx.req, ctx.res);

    console.log(result);
    const verificationResult = verificationGuard.safeParse(result);
    assertThat(
      verificationResult.success,
      new RequestError({
        code: 'session.verification_session_not_found',
        status: 404,
      })
    );

    const {
      verification: { phone, flow, expiresAt },
    } = verificationResult.data;

    const type = getPasswordlessRelatedLogType('sign-in', 'sms');
    ctx.log(type, { phone, flow, expiresAt });

    assertThat(
      flow === 'sign-in',
      new RequestError({ code: 'session.passwordless_not_verified', status: 401 })
    );

    assertThat(
      dayjs(expiresAt).isValid() && dayjs(expiresAt).isAfter(dayjs()),
      new RequestError({ code: 'session.verification_expired', status: 401 })
    );

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
    const { result } = await provider.interactionDetails(ctx.req, ctx.res);

    const verificationResult = verificationGuard.safeParse(result);
    assertThat(
      verificationResult.success,
      new RequestError({
        code: 'session.verification_session_not_found',
        status: 404,
      })
    );

    const {
      verification: { email, flow, expiresAt },
    } = verificationResult.data;

    const type = getPasswordlessRelatedLogType('sign-in', 'email');
    ctx.log(type, { email, flow, expiresAt });

    assertThat(
      flow === 'sign-in',
      new RequestError({ code: 'session.passwordless_not_verified', status: 401 })
    );

    assertThat(
      dayjs(expiresAt).isValid() && dayjs(expiresAt).isAfter(dayjs()),
      new RequestError({ code: 'session.verification_expired', status: 401 })
    );

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
    const { result } = await provider.interactionDetails(ctx.req, ctx.res);

    const verificationResult = verificationGuard.safeParse(result);
    assertThat(
      verificationResult.success,
      new RequestError({
        code: 'session.verification_session_not_found',
        status: 404,
      })
    );

    const {
      verification: { phone, flow, expiresAt },
    } = verificationResult.data;

    const type = getPasswordlessRelatedLogType('register', 'sms');
    ctx.log(type, { phone, flow, expiresAt });

    assertThat(
      flow === 'register',
      new RequestError({ code: 'session.passwordless_not_verified', status: 401 })
    );

    assertThat(
      dayjs(expiresAt).isValid() && dayjs(expiresAt).isAfter(dayjs()),
      new RequestError({ code: 'session.verification_expired', status: 401 })
    );

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
    const { result } = await provider.interactionDetails(ctx.req, ctx.res);

    const verificationResult = verificationGuard.safeParse(result);
    assertThat(
      verificationResult.success,
      new RequestError({
        code: 'session.verification_session_not_found',
        status: 404,
      })
    );

    const {
      verification: { email, flow, expiresAt },
    } = verificationResult.data;

    const type = getPasswordlessRelatedLogType('register', 'email');
    ctx.log(type, { email, flow, expiresAt });

    assertThat(
      flow === 'register',
      new RequestError({ code: 'session.passwordless_not_verified', status: 401 })
    );

    assertThat(
      dayjs(expiresAt).isValid() && dayjs(expiresAt).isAfter(dayjs()),
      new RequestError({ code: 'session.verification_expired', status: 401 })
    );

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
