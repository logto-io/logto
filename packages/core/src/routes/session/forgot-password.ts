import { emailRegEx, passwordRegEx, phoneRegEx } from '@logto/core-kit';
import { PasscodeType } from '@logto/schemas';
import dayjs from 'dayjs';
import { argon2Verify } from 'hash-wasm';
import { Provider } from 'oidc-provider';
import { z } from 'zod';

import RequestError from '@/errors/RequestError';
import { createPasscode, sendPasscode, verifyPasscode } from '@/lib/passcode';
import { encryptUserPassword } from '@/lib/user';
import koaGuard from '@/middleware/koa-guard';
import {
  findUserByEmail,
  findUserById,
  findUserByPhone,
  hasUserWithEmail,
  hasUserWithPhone,
  updateUserById,
} from '@/queries/user';
import assertThat from '@/utils/assert-that';

import { AnonymousRouter } from '../types';
import { forgotPasswordVerificationTimeout } from './consts';
import { getRoutePrefix } from './utils';

export const forgotPasswordRoute = getRoutePrefix('forgot-password');

const forgotPasswordVerificationGuard = z.object({
  forgotPassword: z.object({ userId: z.string(), expiresAt: z.string() }),
});

export default function forgotPasswordRoutes<T extends AnonymousRouter>(
  router: T,
  provider: Provider
) {
  router.post(
    `${forgotPasswordRoute}/sms/send-passcode`,
    koaGuard({ body: z.object({ phone: z.string().regex(phoneRegEx) }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const { phone } = ctx.guard.body;
      const type = 'ForgotPasswordSmsSendPasscode';
      ctx.log(type, { phone });

      const passcode = await createPasscode(jti, PasscodeType.ForgotPassword, { phone });
      const { dbEntry } = await sendPasscode(passcode);
      ctx.log(type, { connectorId: dbEntry.id });
      ctx.status = 204;

      return next();
    }
  );

  router.post(
    `${forgotPasswordRoute}/sms/verify-passcode`,
    koaGuard({ body: z.object({ phone: z.string().regex(phoneRegEx), code: z.string() }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const { phone, code } = ctx.guard.body;
      const type = 'ForgotPasswordSms';
      ctx.log(type, { phone, code });

      assertThat(
        await hasUserWithPhone(phone),
        new RequestError({ code: 'user.phone_not_exists', status: 422 })
      );

      await verifyPasscode(jti, PasscodeType.ForgotPassword, code, { phone });
      const { id } = await findUserByPhone(phone);
      ctx.log(type, { userId: id });

      await provider.interactionResult(ctx.req, ctx.res, {
        forgotPassword: {
          userId: id,
          expiresAt: dayjs().add(forgotPasswordVerificationTimeout, 'second').toISOString(),
        },
      });
      ctx.status = 204;

      return next();
    }
  );

  router.post(
    `${forgotPasswordRoute}/email/send-passcode`,
    koaGuard({ body: z.object({ email: z.string().regex(emailRegEx) }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const { email } = ctx.guard.body;
      const type = 'ForgotPasswordEmailSendPasscode';
      ctx.log(type, { email });

      const passcode = await createPasscode(jti, PasscodeType.ForgotPassword, { email });
      const { dbEntry } = await sendPasscode(passcode);
      ctx.log(type, { connectorId: dbEntry.id });
      ctx.status = 204;

      return next();
    }
  );

  router.post(
    `${forgotPasswordRoute}/email/verify-passcode`,
    koaGuard({ body: z.object({ email: z.string().regex(emailRegEx), code: z.string() }) }),
    async (ctx, next) => {
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      const { email, code } = ctx.guard.body;
      const type = 'ForgotPasswordEmail';
      ctx.log(type, { email, code });

      assertThat(
        await hasUserWithEmail(email),
        new RequestError({ code: 'user.email_not_exists', status: 422 })
      );

      await verifyPasscode(jti, PasscodeType.ForgotPassword, code, { email });
      const { id } = await findUserByEmail(email);
      await provider.interactionResult(ctx.req, ctx.res, {
        forgotPassword: {
          userId: id,
          expiresAt: dayjs().add(forgotPasswordVerificationTimeout, 'second').toISOString(),
        },
      });
      ctx.status = 204;

      return next();
    }
  );

  router.post(
    `${forgotPasswordRoute}/reset`,
    koaGuard({ body: z.object({ password: z.string().regex(passwordRegEx) }) }),
    async (ctx, next) => {
      const { result } = await provider.interactionDetails(ctx.req, ctx.res);
      const { password } = ctx.guard.body;
      const forgotPasswordVerificationResult = forgotPasswordVerificationGuard.safeParse(result);

      assertThat(
        forgotPasswordVerificationResult.success,
        new RequestError({ code: 'session.forgot_password_session_not_found', status: 404 })
      );

      const {
        forgotPassword: { userId: id, expiresAt },
      } = forgotPasswordVerificationResult.data;

      assertThat(
        dayjs(expiresAt).isValid() && dayjs(expiresAt).isAfter(dayjs()),
        new RequestError({ code: 'session.forgot_password_verification_expired', status: 401 })
      );

      const { passwordEncrypted: oldPasswordEncrypted } = await findUserById(id);

      assertThat(
        !oldPasswordEncrypted ||
          (oldPasswordEncrypted && !(await argon2Verify({ password, hash: oldPasswordEncrypted }))),
        new RequestError({ code: 'user.same_password', status: 400 })
      );

      const { passwordEncrypted, passwordEncryptionMethod } = await encryptUserPassword(password);

      const type = 'ForgotPasswordReset';
      ctx.log(type, { userId: id });

      await updateUserById(id, { passwordEncrypted, passwordEncryptionMethod });
      ctx.status = 204;

      return next();
    }
  );
}
