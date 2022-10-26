import { PasscodeType, SignInIdentifier } from '@logto/schemas';
import type { MiddlewareType } from 'koa';
import type { Provider } from 'oidc-provider';

import RequestError from '@/errors/RequestError';
import { assignInteractionResults } from '@/lib/session';
import { generateUserId, insertUser } from '@/lib/user';
import type { WithLogContext } from '@/middleware/koa-log';
import { findDefaultSignInExperience } from '@/queries/sign-in-experience';
import {
  hasUserWithPhone,
  hasUserWithEmail,
  findUserByPhone,
  findUserByEmail,
  updateUserById,
} from '@/queries/user';
import assertThat from '@/utils/assert-that';

import { smsSessionResultGuard, emailSessionResultGuard } from '../types';
import {
  getVerificationStorageFromInteraction,
  getPasswordlessRelatedLogType,
  checkValidateExpiration,
} from '../utils';

export const smsSignInAction = <StateT, ContextT extends WithLogContext, ResponseBodyT>(
  provider: Provider
): MiddlewareType<StateT, ContextT, ResponseBodyT> => {
  return async (ctx, next) => {
    const signInExperience = await findDefaultSignInExperience();
    assertThat(
      signInExperience.signIn.methods.some(
        ({ identifier, verificationCode }) =>
          identifier === SignInIdentifier.Sms && verificationCode
      ),
      new RequestError({
        code: 'user.sign_in_method_not_enabled',
        status: 422,
      })
    );

    const verificationStorage = await getVerificationStorageFromInteraction(
      ctx,
      provider,
      smsSessionResultGuard
    );

    const type = getPasswordlessRelatedLogType(PasscodeType.SignIn, 'sms');
    ctx.log(type, verificationStorage);

    const { phone, expiresAt } = verificationStorage;

    checkValidateExpiration(expiresAt);

    assertThat(
      await hasUserWithPhone(phone),
      new RequestError({ code: 'user.phone_not_exists', status: 404 })
    );

    const { id } = await findUserByPhone(phone);
    ctx.log(type, { userId: id });

    await updateUserById(id, { lastSignInAt: Date.now() });
    await assignInteractionResults(ctx, provider, { login: { accountId: id } });

    return next();
  };
};

export const emailSignInAction = <StateT, ContextT extends WithLogContext, ResponseBodyT>(
  provider: Provider
): MiddlewareType<StateT, ContextT, ResponseBodyT> => {
  return async (ctx, next) => {
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

    const verificationStorage = await getVerificationStorageFromInteraction(
      ctx,
      provider,
      emailSessionResultGuard
    );

    const type = getPasswordlessRelatedLogType(PasscodeType.SignIn, 'email');
    ctx.log(type, verificationStorage);

    const { email, expiresAt } = verificationStorage;

    checkValidateExpiration(expiresAt);

    assertThat(
      await hasUserWithEmail(email),
      new RequestError({ code: 'user.email_not_exists', status: 404 })
    );

    const { id } = await findUserByEmail(email);
    ctx.log(type, { userId: id });

    await updateUserById(id, { lastSignInAt: Date.now() });
    await assignInteractionResults(ctx, provider, { login: { accountId: id } });

    return next();
  };
};

export const smsRegisterAction = <StateT, ContextT extends WithLogContext, ResponseBodyT>(
  provider: Provider
): MiddlewareType<StateT, ContextT, ResponseBodyT> => {
  return async (ctx, next) => {
    const signInExperience = await findDefaultSignInExperience();
    assertThat(
      signInExperience.signUp.methods.some(({ identifier }) => identifier === SignInIdentifier.Sms),
      new RequestError({
        code: 'user.sign_up_method_not_enabled',
        status: 422,
      })
    );

    const verificationStorage = await getVerificationStorageFromInteraction(
      ctx,
      provider,
      smsSessionResultGuard
    );

    const type = getPasswordlessRelatedLogType(PasscodeType.Register, 'sms');
    ctx.log(type, verificationStorage);

    const { phone, expiresAt } = verificationStorage;

    checkValidateExpiration(expiresAt);

    assertThat(
      !(await hasUserWithPhone(phone)),
      new RequestError({ code: 'user.phone_exists_register', status: 422 })
    );
    const id = await generateUserId();
    ctx.log(type, { userId: id });

    await insertUser({ id, primaryPhone: phone, lastSignInAt: Date.now() });
    await assignInteractionResults(ctx, provider, { login: { accountId: id } });

    return next();
  };
};

export const emailRegisterAction = <StateT, ContextT extends WithLogContext, ResponseBodyT>(
  provider: Provider
): MiddlewareType<StateT, ContextT, ResponseBodyT> => {
  return async (ctx, next) => {
    const signInExperience = await findDefaultSignInExperience();
    assertThat(
      signInExperience.signUp.methods.some(
        ({ identifier }) => identifier === SignInIdentifier.Email
      ),
      new RequestError({
        code: 'user.sign_up_method_not_enabled',
        status: 422,
      })
    );

    const verificationStorage = await getVerificationStorageFromInteraction(
      ctx,
      provider,
      emailSessionResultGuard
    );

    const type = getPasswordlessRelatedLogType(PasscodeType.Register, 'email');
    ctx.log(type, verificationStorage);

    const { email, expiresAt } = verificationStorage;

    checkValidateExpiration(expiresAt);

    assertThat(
      !(await hasUserWithEmail(email)),
      new RequestError({ code: 'user.email_exists_register', status: 422 })
    );
    const id = await generateUserId();
    ctx.log(type, { userId: id });

    await insertUser({ id, primaryEmail: email, lastSignInAt: Date.now() });
    await assignInteractionResults(ctx, provider, { login: { accountId: id } });

    return next();
  };
};
