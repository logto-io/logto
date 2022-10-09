import { logTypeGuard, LogType, PasscodeType } from '@logto/schemas';
import { Truthy } from '@silverhand/essentials';
import dayjs from 'dayjs';
import { Context } from 'koa';
import { InteractionResults, Provider } from 'oidc-provider';
import { z } from 'zod';

import RequestError from '@/errors/RequestError';
import assertThat from '@/utils/assert-that';

import { verificationStorageGuard, Method, Operation, VerificationStorage } from './types';

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

export const parseVerificationStorage = (data: unknown): VerificationStorage => {
  const verificationResult = z
    .object({
      verification: verificationStorageGuard,
    })
    .safeParse(data);

  assertThat(
    verificationResult.success,
    new RequestError({
      code: 'session.verification_session_not_found',
      status: 404,
    })
  );

  return verificationResult.data.verification;
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

export const assignVerificationResult = async (
  ctx: Context,
  provider: Provider,
  result: InteractionResults & { verification: VerificationStorage }
) => {
  await provider.interactionResult(ctx.req, ctx.res, result);
};
