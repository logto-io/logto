import { emailRegEx, phoneRegEx } from '@logto/core-kit';
import { PasscodeType } from '@logto/schemas';
import dayjs from 'dayjs';
import { Provider } from 'oidc-provider';
import { z } from 'zod';

import RequestError from '@/errors/RequestError';
import { createPasscode, sendPasscode, verifyPasscode } from '@/lib/passcode';
import { assignInteractionResults } from '@/lib/session';
import koaGuard from '@/middleware/koa-guard';
import {
  findUserByEmail,
  findUserByPhone,
  hasUserWithEmail,
  hasUserWithPhone,
} from '@/queries/user';
import assertThat from '@/utils/assert-that';

import { AnonymousRouter } from '../types';
import { forgotPasswordReAuthenticationTimeout } from './consts';
import { getRoutePrefix } from './utils';

export const forgotPasswordRoute = getRoutePrefix('forgot-password');

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

      await assignInteractionResults(ctx, provider, {
        login: { accountId: id },
        forgotPassword: {
          expiresAt: dayjs().add(forgotPasswordReAuthenticationTimeout, 'second'),
        },
      });

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
      await assignInteractionResults(ctx, provider, {
        login: { accountId: id },
        forgotPassword: {
          expiresAt: dayjs().add(forgotPasswordReAuthenticationTimeout, 'second'),
        },
      });

      return next();
    }
  );
}
