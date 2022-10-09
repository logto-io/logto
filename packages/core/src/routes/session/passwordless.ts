import { emailRegEx, phoneRegEx } from '@logto/core-kit';
import { PasscodeType } from '@logto/schemas';
import dayjs from 'dayjs';
import { Provider } from 'oidc-provider';
import { object, string, z } from 'zod';

import { createPasscode, sendPasscode, verifyPasscode } from '@/lib/passcode';
import { assignInteractionResults } from '@/lib/session';
import { insertUser } from '@/lib/user';
import koaGuard from '@/middleware/koa-guard';
import { updateUserById } from '@/queries/user';
import { methodGuard, passcodeTypeGuard } from '@/routes/session/types';

import { AnonymousRouter } from '../types';
import { verificationTimeout } from './consts';
import {
  assignVerificationResult,
  getPasswordlessRelatedLogType,
  getRoutePrefix,
  parseVerificationStorage,
  checkAvailabilityByMethodAndGenerateUserId,
  checkExistenceAndGetUserIdByMethod,
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

  router.post(
    '/session/:flow/passwordless/:method',
    koaGuard({
      params: object({
        flow: z.enum(['sign-in', 'register']),
        method: methodGuard,
      }),
    }),
    async (ctx, next) => {
      const { result } = await provider.interactionDetails(ctx.req, ctx.res);
      const verificationStorage = parseVerificationStorage(result);

      const { flow, method } = ctx.guard.params;
      const flowType: PasscodeType =
        flow === 'sign-in' ? PasscodeType.SignIn : PasscodeType.Register;

      const type = getPasswordlessRelatedLogType(flowType, method);
      ctx.log(type, verificationStorage);

      checkVerificationSessionByFlow(flowType, verificationStorage);

      if (flow === 'sign-in') {
        const id = await checkExistenceAndGetUserIdByMethod(method, verificationStorage);
        ctx.log(type, { userId: id });

        await updateUserById(id, { lastSignInAt: Date.now() });
        await assignInteractionResults(ctx, provider, { login: { accountId: id } });
      } else {
        const userProfile = await checkAvailabilityByMethodAndGenerateUserId(
          method,
          verificationStorage
        );
        ctx.log(type, { userId: userProfile.id });

        await insertUser({
          lastSignInAt: Date.now(),
          ...userProfile,
        });
        await assignInteractionResults(ctx, provider, { login: { accountId: userProfile.id } });
      }

      return next();
    }
  );
}
