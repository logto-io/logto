import { emailRegEx, phoneRegEx } from '@logto/core-kit';
import { PasscodeType, SignInIdentifier } from '@logto/schemas';
import { Provider } from 'oidc-provider';
import { object, string } from 'zod';

import RequestError from '@/errors/RequestError';
import { createPasscode, sendPasscode, verifyPasscode } from '@/lib/passcode';
import koaGuard from '@/middleware/koa-guard';
import { findDefaultSignInExperience } from '@/queries/sign-in-experience';
import {
  findUserByEmail,
  findUserByPhone,
  hasUserWithEmail,
  hasUserWithPhone,
} from '@/queries/user';
import { passcodeTypeGuard } from '@/routes/session/types';
import assertThat from '@/utils/assert-that';

import { AnonymousRouter } from '../types';
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
      const signInExperience = await findDefaultSignInExperience();
      assertThat(
        signInExperience.signIn.methods.some(
          ({ identifier, verificationCode }) =>
            identifier === SignInIdentifier.Phone && verificationCode
        ),
        new RequestError({
          code: 'user.sign_in_method_not_enabled',
          status: 422,
        })
      );

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
      const signInExperience = await findDefaultSignInExperience();
      assertThat(
        signInExperience.signIn.methods.some(
          ({ identifier, verificationCode }) =>
            identifier === SignInIdentifier.Email && verificationCode
        ),
        new RequestError({
          code: 'user.sign_in_method_not_enabled',
          status: 422,
        })
      );

      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);

      const {
        body: { phone, code, flow },
      } = ctx.guard;

      const type = getPasswordlessRelatedLogType(flow, 'sms', 'verify');
      ctx.log(type, { phone });

      await verifyPasscode(jti, flow, code, { phone });

      if (flow === PasscodeType.ForgotPassword) {
        assertThat(
          await hasUserWithPhone(phone),
          new RequestError({ code: 'user.phone_not_exists', status: 404 })
        );

        const { id } = await findUserByPhone(phone);
        await assignVerificationResult(ctx, provider, { flow, userId: id });
        ctx.status = 204;

        return next();
      }

      await assignVerificationResult(ctx, provider, { flow, phone });

      if (flow === PasscodeType.SignIn) {
        return smsSignInAction(provider)(ctx, next);
      }

      return smsRegisterAction(provider)(ctx, next);
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
        assertThat(
          await hasUserWithEmail(email),
          new RequestError({ code: 'user.email_not_exists', status: 404 })
        );

        const { id } = await findUserByEmail(email);

        await assignVerificationResult(ctx, provider, { flow, userId: id });
        ctx.status = 204;

        return next();
      }

      await assignVerificationResult(ctx, provider, { flow, email });

      if (flow === PasscodeType.SignIn) {
        return emailSignInAction(provider)(ctx, next);
      }

      return emailRegisterAction(provider)(ctx, next);
    }
  );

  router.post(`${signInRoute}/sms`, smsSignInAction(provider));

  router.post(`${signInRoute}/email`, emailSignInAction(provider));

  router.post(`${registerRoute}/sms`, smsRegisterAction(provider));

  router.post(`${registerRoute}/email`, emailRegisterAction(provider));
}
