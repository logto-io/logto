import { emailRegEx, phoneRegEx } from '@logto/core-kit';
import { PasscodeType, LogType, User } from '@logto/schemas';
import camelcase from 'camelcase';
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
import assertThat from '@/utils/assert-that';

import { AnonymousRouter } from '../types';
import { passwordlessVerificationTimeout } from './consts';
import { flowTypeGuard, viaGuard, passwordlessVerificationGuard, PasscodePayload } from './types';
import { getRoutePrefix, getPasscodeType } from './utils';

export const registerRoute = getRoutePrefix('register', 'passwordless');
export const signInRoute = getRoutePrefix('sign-in', 'passwordless');

export default function passwordlessRoutes<T extends AnonymousRouter>(
  router: T,
  provider: Provider
) {
  router.post(
    `/passwordless/:via/send`,
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

      const type: LogType = `${camelcase(flow, { pascalCase: true })}${camelcase(via, {
        pascalCase: true,
      })}SendPasscode`;
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
    `/passwordless/:via/verify`,
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

      const type: LogType = `${camelcase(flow, { pascalCase: true })}${camelcase(via, {
        pascalCase: true,
      })}`;
      ctx.log(type, payload);

      const passcodeType = getPasscodeType(flow);
      await verifyPasscode(jti, passcodeType, code, payload);

      await provider.interactionResult(ctx.req, ctx.res, {
        passwordlessVerification: {
          flow,
          expiresAt: dayjs().add(passwordlessVerificationTimeout, 'second').toISOString(),
          ...payload,
        },
      });
      ctx.status = 204;

      return next();
    }
  );

  router.post(
    `${signInRoute}/:via`,
    koaGuard({ params: object({ via: viaGuard }) }),
    async (ctx, next) => {
      const { result } = await provider.interactionDetails(ctx.req, ctx.res);
      const { via } = ctx.guard.params;

      const passwordlessVerificationResult = passwordlessVerificationGuard.safeParse(result);
      assertThat(
        passwordlessVerificationResult.success,
        new RequestError({
          code: 'session.passwordless_verification_session_not_found',
          status: 404,
        })
      );

      const {
        passwordlessVerification: { email, phone, flow, expiresAt },
      } = passwordlessVerificationResult.data;

      const type = `SignIn${camelcase(via, { pascalCase: true })}`;
      ctx.log(type, { email, phone, flow, expiresAt });

      assertThat(
        flow === 'sign-in',
        new RequestError({ code: 'session.passwordless_not_verified', status: 401 })
      );

      assertThat(
        dayjs(expiresAt).isValid() && dayjs(expiresAt).isAfter(dayjs()),
        new RequestError({ code: 'session.passwordless_verification_expired', status: 401 })
      );

      // eslint-disable-next-line @silverhand/fp/no-let
      let user: User;

      if (via === 'sms') {
        assertThat(
          phone && (await hasUserWithPhone(phone)),
          new RequestError({ code: 'user.phone_not_exists', status: 422 })
        );
        // eslint-disable-next-line @silverhand/fp/no-mutation
        user = await findUserByPhone(phone);
      } else {
        assertThat(
          email && (await hasUserWithEmail(email)),
          new RequestError({ code: 'user.email_not_exists', status: 422 })
        );
        // eslint-disable-next-line @silverhand/fp/no-mutation
        user = await findUserByEmail(email);
      }

      const { id } = user;
      ctx.log(type, { userId: id });

      await updateUserById(id, { lastSignInAt: Date.now() });
      await assignInteractionResults(ctx, provider, { login: { accountId: id } }, true);

      return next();
    }
  );

  // Router.post(
  //   `${signInRoute}/sms/send-passcode`,
  //   koaGuard({ body: object({ phone: string().regex(phoneRegEx) }) }),
  //   async (ctx, next) => {
  //     const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
  //     const { phone } = ctx.guard.body;
  //     const type = 'SignInSmsSendPasscode';
  //     ctx.log(type, { phone });

  //     assertThat(
  //       await hasUserWithPhone(phone),
  //       new RequestError({ code: 'user.phone_not_exists', status: 422 })
  //     );

  //     const passcode = await createPasscode(jti, PasscodeType.SignIn, { phone });
  //     const { dbEntry } = await sendPasscode(passcode);
  //     ctx.log(type, { connectorId: dbEntry.id });
  //     ctx.status = 204;

  //     return next();
  //   }
  // );

  // router.post(
  //   `${signInRoute}/sms/verify-passcode`,
  //   koaGuard({ body: object({ phone: string().regex(phoneRegEx), code: string() }) }),
  //   async (ctx, next) => {
  //     const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
  //     const { phone, code } = ctx.guard.body;
  //     const type = 'SignInSms';
  //     ctx.log(type, { phone, code });

  //     assertThat(
  //       await hasUserWithPhone(phone),
  //       new RequestError({ code: 'user.phone_not_exists', status: 422 })
  //     );

  //     await verifyPasscode(jti, PasscodeType.SignIn, code, { phone });
  //     const { id } = await findUserByPhone(phone);
  //     ctx.log(type, { userId: id });

  //     await updateUserById(id, { lastSignInAt: Date.now() });
  //     await assignInteractionResults(ctx, provider, { login: { accountId: id } }, true);

  //     return next();
  //   }
  // );

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
