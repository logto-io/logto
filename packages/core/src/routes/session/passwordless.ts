import { emailRegEx, phoneRegEx } from '@logto/core-kit';
import { PasscodeType } from '@logto/schemas';
import type { Provider } from 'oidc-provider';
import { object, string } from 'zod';

import RequestError from '@/errors/RequestError';
import { createPasscode, sendPasscode, verifyPasscode } from '@/lib/passcode';
import koaGuard from '@/middleware/koa-guard';
import { findUserByEmail, findUserByPhone } from '@/queries/user';
import { passcodeTypeGuard } from '@/routes/session/types';
import assertThat from '@/utils/assert-that';

import type { AnonymousRouter } from '../types';
import {
  smsSignInAction,
  emailSignInAction,
  smsRegisterAction,
  emailRegisterAction,
} from './middleware/passwordless-action';
import { assignVerificationResult, getPasswordlessRelatedLogType, getRoutePrefix } from './utils';

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

      if (flow === PasscodeType.ForgotPassword) {
        const user = await findUserByPhone(phone);
        assertThat(user, new RequestError({ code: 'user.phone_not_exists', status: 404 }));

        await assignVerificationResult(ctx, provider, { flow, userId: user.id });
        ctx.status = 204;

        return next();
      }

      if (flow === PasscodeType.SignIn) {
        await assignVerificationResult(ctx, provider, { flow, phone });

        return smsSignInAction(provider)(ctx, next);
      }

      if (flow === PasscodeType.Register) {
        await assignVerificationResult(ctx, provider, { flow, phone });

        return smsRegisterAction(provider)(ctx, next);
      }

      await assignVerificationResult(ctx, provider, { flow, phone });

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

      if (flow === PasscodeType.ForgotPassword) {
        const user = await findUserByEmail(email);

        assertThat(user, new RequestError({ code: 'user.email_not_exists', status: 404 }));

        await assignVerificationResult(ctx, provider, { flow, userId: user.id });
        ctx.status = 204;

        return next();
      }

      if (flow === PasscodeType.SignIn) {
        await assignVerificationResult(ctx, provider, { flow, email });

        return emailSignInAction(provider)(ctx, next);
      }

      if (flow === PasscodeType.Register) {
        await assignVerificationResult(ctx, provider, { flow, email });

        return emailRegisterAction(provider)(ctx, next);
      }

      await assignVerificationResult(ctx, provider, { flow, email });

      return next();
    }
  );

  router.post(`${signInRoute}/sms`, smsSignInAction(provider));

  router.post(`${signInRoute}/email`, emailSignInAction(provider));

  router.post(`${registerRoute}/sms`, smsRegisterAction(provider));

  router.post(`${registerRoute}/email`, emailRegisterAction(provider));
}
