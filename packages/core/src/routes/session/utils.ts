import { logTypeGuard, LogType, PasscodeType } from '@logto/schemas';
import { Truthy } from '@silverhand/essentials';
import dayjs from 'dayjs';
import { Context } from 'koa';
import { Provider } from 'oidc-provider';

import RequestError from '@/errors/RequestError';
import assertThat from '@/utils/assert-that';

import { verificationTimeout } from './consts';
import {
  verificationResultGuard,
  Method,
  Operation,
  VerificationStorage,
  VerificationResult,
  VerifiedIdentity,
} from './types';

export const getRoutePrefix = (
  type: 'sign-in' | 'register' | 'forgot-password',
  method?: 'passwordless' | 'username-password' | 'social'
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

const parseVerificationStorage = (data: unknown): VerificationStorage => {
  const verificationResult = verificationResultGuard.safeParse(data);

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

export const getVerificationStorageFromInteraction = async (
  ctx: Context,
  provider: Provider
): Promise<VerificationStorage> => {
  const { result } = await provider.interactionDetails(ctx.req, ctx.res);

  return parseVerificationStorage(result);
};

export const checkVerificationSessionByFlow = (
  currentFlow: PasscodeType,
  payload: VerificationStorage
) => {
  const { flow, expiresAt } = payload;

  assertThat(
    flow === currentFlow,
    new RequestError({ code: 'session.passwordless_not_verified', status: 401 })
  );

  assertThat(
    dayjs(expiresAt).isValid() && dayjs(expiresAt).isAfter(dayjs()),
    new RequestError({ code: 'session.verification_expired', status: 401 })
  );
};

export const smsSignInSessionGuard = (payload: VerificationStorage) => {
  checkVerificationSessionByFlow(PasscodeType.SignIn, payload);

  const { phone } = payload;
  assertThat(
    phone,
    new RequestError(
      { code: 'session.passwordless_not_verified', status: 401 },
      { method: 'sms', flow: PasscodeType.SignIn }
    )
  );

  return { phone };
};

export const emailSignInSessionGuard = (payload: VerificationStorage) => {
  checkVerificationSessionByFlow(PasscodeType.SignIn, payload);

  const { email } = payload;
  assertThat(
    email,
    new RequestError(
      { code: 'session.passwordless_not_verified', status: 401 },
      { method: 'email', flow: PasscodeType.SignIn }
    )
  );

  return { email };
};

export const smsRegisterSessionGuard = (payload: VerificationStorage) => {
  checkVerificationSessionByFlow(PasscodeType.Register, payload);

  const { phone } = payload;
  assertThat(
    phone,
    new RequestError(
      { code: 'session.passwordless_not_verified', status: 401 },
      { method: 'sms', flow: PasscodeType.Register }
    )
  );

  return { phone };
};

export const emailRegisterSessionGuard = (payload: VerificationStorage) => {
  checkVerificationSessionByFlow(PasscodeType.Register, payload);

  const { email } = payload;
  assertThat(
    email,
    new RequestError(
      { code: 'session.passwordless_not_verified', status: 401 },
      { method: 'email', flow: PasscodeType.Register }
    )
  );

  return { email };
};

export const assignVerificationResult = async (
  ctx: Context,
  provider: Provider,
  flow: PasscodeType,
  identity: VerifiedIdentity
) => {
  const verificationStorage: VerificationResult = {
    verification: {
      flow,
      expiresAt: dayjs().add(verificationTimeout, 'second').toISOString(),
      ...identity,
    },
  };
  await provider.interactionResult(ctx.req, ctx.res, verificationStorage);
};
