import type {
  LogPayload,
  LogType,
  PasscodeType,
  SignInExperience,
  SignInIdentifier,
  User,
} from '@logto/schemas';
import { SignUpIdentifier, logTypeGuard } from '@logto/schemas';
import type { Nullable, Truthy } from '@silverhand/essentials';
import { addSeconds, isAfter, isValid } from 'date-fns';
import type { Context } from 'koa';
import type { Provider } from 'oidc-provider';
import type { ZodType } from 'zod';
import { z } from 'zod';

import RequestError from '@/errors/RequestError';
import { assignInteractionResults } from '@/lib/session';
import { verifyUserPassword } from '@/lib/user';
import type { LogContext } from '@/middleware/koa-log';
import { findDefaultSignInExperience } from '@/queries/sign-in-experience';
import { hasUser, hasUserWithEmail, hasUserWithPhone, updateUserById } from '@/queries/user';
import assertThat from '@/utils/assert-that';

import { continueSignInTimeout, verificationTimeout } from './consts';
import type { Method, Operation, VerificationResult, VerificationStorage } from './types';
import { continueSignInStorageGuard } from './types';

export const getRoutePrefix = (
  type: 'sign-in' | 'register' | 'forgot-password',
  method?: 'passwordless' | 'password' | 'social' | 'continue'
) => {
  return ['session', type, method]
    .filter((value): value is Truthy<typeof value> => value !== undefined)
    .map((value) => '/' + value)
    .join('');
};

export const getPasswordlessRelatedLogType = (
  flow: PasscodeType,
  method: Method,
  operation?: Operation
): LogType => {
  const body = method === 'email' ? 'Email' : 'Sms';
  const suffix = operation === 'send' ? 'SendPasscode' : '';

  const result = logTypeGuard.safeParse(flow + body + suffix);
  assertThat(result.success, new RequestError('log.invalid_type'));

  return result.data;
};

export const getVerificationStorageFromInteraction = async <T = VerificationStorage>(
  ctx: Context,
  provider: Provider,
  resultGuard: ZodType<VerificationResult<T>>
): Promise<T> => {
  const { result } = await provider.interactionDetails(ctx.req, ctx.res);

  const verificationResult = resultGuard.safeParse(result);

  if (!verificationResult.success) {
    throw new RequestError(
      {
        code: 'session.verification_session_not_found',
        status: 404,
      },
      verificationResult.error
    );
  }

  return verificationResult.data.verification;
};

export const checkValidateExpiration = (expiresAt: string) => {
  const parsed = new Date(expiresAt);
  assertThat(
    isValid(parsed) && isAfter(parsed, Date.now()),
    new RequestError({ code: 'session.verification_expired', status: 401 })
  );
};

type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never;

export const assignVerificationResult = async (
  ctx: Context,
  provider: Provider,
  verificationData: DistributiveOmit<VerificationStorage, 'expiresAt'>
) => {
  const verification: VerificationStorage = {
    ...verificationData,
    expiresAt: addSeconds(Date.now(), verificationTimeout).toISOString(),
  };

  await provider.interactionResult(ctx.req, ctx.res, {
    verification,
  });
};

export const clearVerificationResult = async (ctx: Context, provider: Provider) => {
  const { result } = await provider.interactionDetails(ctx.req, ctx.res);

  const verificationGuard = z.object({ verification: z.unknown() });
  const verificationGuardResult = verificationGuard.safeParse(result);

  if (result && verificationGuardResult.success) {
    const { verification, ...rest } = result;
    await provider.interactionResult(ctx.req, ctx.res, rest);
  }
};

export const assignContinueSignInResult = async (
  ctx: Context,
  provider: Provider,
  payload: { userId: string }
) => {
  await provider.interactionResult(ctx.req, ctx.res, {
    continueSignIn: {
      ...payload,
      expiresAt: addSeconds(Date.now(), continueSignInTimeout).toISOString(),
    },
  });
};

export const getContinueSignInResult = async (
  ctx: Context,
  provider: Provider
): Promise<{ userId: string }> => {
  const { result } = await provider.interactionDetails(ctx.req, ctx.res);

  const signInResult = z
    .object({
      continueSignIn: continueSignInStorageGuard,
    })
    .safeParse(result);

  if (!signInResult.success) {
    throw new RequestError({
      code: 'session.unauthorized',
      status: 401,
    });
  }

  const { expiresAt, ...rest } = signInResult.data.continueSignIn;

  const parsed = new Date(expiresAt);
  assertThat(
    isValid(parsed) && isAfter(parsed, Date.now()),
    new RequestError({ code: 'session.unauthorized', status: 401 })
  );

  return rest;
};

/* eslint-disable complexity */
export const checkRequiredProfile = async (
  ctx: Context,
  provider: Provider,
  user: User,
  signInExperience: SignInExperience
) => {
  const { signUp } = signInExperience;
  const { passwordEncrypted, id, username, primaryEmail, primaryPhone } = user;

  // If check failed, save the sign in result, the user can continue after requirements are meet

  if (signUp.password && !passwordEncrypted) {
    await assignContinueSignInResult(ctx, provider, { userId: id });
    throw new RequestError({ code: 'user.require_password', status: 422 });
  }

  if (signUp.identifier === SignUpIdentifier.Username && !username) {
    await assignContinueSignInResult(ctx, provider, { userId: id });
    throw new RequestError({ code: 'user.require_username', status: 422 });
  }

  if (signUp.identifier === SignUpIdentifier.Email && !primaryEmail) {
    await assignContinueSignInResult(ctx, provider, { userId: id });
    throw new RequestError({ code: 'user.require_email', status: 422 });
  }

  if (signUp.identifier === SignUpIdentifier.Sms && !primaryPhone) {
    await assignContinueSignInResult(ctx, provider, { userId: id });
    throw new RequestError({ code: 'user.require_sms', status: 422 });
  }

  if (signUp.identifier === SignUpIdentifier.EmailOrSms && !primaryEmail && !primaryPhone) {
    await assignContinueSignInResult(ctx, provider, { userId: id });
    throw new RequestError({ code: 'user.require_email_or_sms', status: 422 });
  }
};

export const checkRequiredSignUpIdentifiers = async (identifiers: {
  username?: string;
  primaryEmail?: string;
  primaryPhone?: string;
}) => {
  const { username, primaryEmail, primaryPhone } = identifiers;

  const { signUp } = await findDefaultSignInExperience();

  if (signUp.identifier === SignUpIdentifier.Username && !username) {
    throw new RequestError({ code: 'user.require_username', status: 422 });
  }

  if (signUp.identifier === SignUpIdentifier.Email && !primaryEmail) {
    throw new RequestError({ code: 'user.require_email', status: 422 });
  }

  if (signUp.identifier === SignUpIdentifier.Sms && !primaryPhone) {
    throw new RequestError({ code: 'user.require_sms', status: 422 });
  }

  if (signUp.identifier === SignUpIdentifier.EmailOrSms && !primaryEmail && !primaryPhone) {
    throw new RequestError({ code: 'user.require_email_or_sms', status: 422 });
  }
};
/* eslint-enable complexity */

export const checkExistingSignUpIdentifiers = async (identifiers: {
  username?: string;
  primaryEmail?: string;
  primaryPhone?: string;
}) => {
  const { username, primaryEmail, primaryPhone } = identifiers;

  if (username && (await hasUser(username))) {
    throw new RequestError({ code: 'user.username_exists', status: 422 });
  }

  if (primaryEmail && (await hasUserWithEmail(primaryEmail))) {
    throw new RequestError({ code: 'user.email_exists', status: 422 });
  }

  if (primaryPhone && (await hasUserWithPhone(primaryPhone))) {
    throw new RequestError({ code: 'user.sms_exists', status: 422 });
  }
};

type SignInWithPasswordParameter = {
  identifier: SignInIdentifier;
  password: string;
  logType: LogType;
  logPayload: LogPayload;
  findUser: () => Promise<Nullable<User>>;
};

export const signInWithPassword = async (
  ctx: Context & LogContext,
  provider: Provider,
  { identifier, findUser, password, logType, logPayload }: SignInWithPasswordParameter
) => {
  const signInExperience = await findDefaultSignInExperience();
  assertThat(
    signInExperience.signIn.methods.some(
      (method) => method.password && method.identifier === identifier
    ),
    new RequestError({
      code: 'user.sign_in_method_not_enabled',
      status: 422,
    })
  );

  await provider.interactionDetails(ctx.req, ctx.res);
  ctx.log(logType, logPayload);

  const user = await findUser();
  const verifiedUser = await verifyUserPassword(user, password);
  const { id } = verifiedUser;

  ctx.log(logType, { userId: id });
  await updateUserById(id, { lastSignInAt: Date.now() });
  await checkRequiredProfile(ctx, provider, verifiedUser, signInExperience);
  await assignInteractionResults(ctx, provider, { login: { accountId: id } }, true);
};
