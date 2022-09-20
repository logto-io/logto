import { emailRegEx, phoneRegEx } from '@logto/core-kit';
import { PasscodeType } from '@logto/schemas';
import { Provider } from 'oidc-provider';
import { z } from 'zod';

import { createPasscode, sendPasscode } from '@/lib/passcode';
import koaGuard from '@/middleware/koa-guard';

import { AnonymousRouter } from '../types';
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
}
