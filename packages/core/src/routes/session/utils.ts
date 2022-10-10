import { logTypeGuard, LogType, PasscodeType } from '@logto/schemas';
import { Truthy } from '@silverhand/essentials';
import dayjs from 'dayjs';
import { Context } from 'koa';
import { Provider } from 'oidc-provider';
import { ZodType, ZodTypeDef } from 'zod';

import RequestError from '@/errors/RequestError';
import assertThat from '@/utils/assert-that';

import { verificationTimeout } from './consts';
import { Method, Operation, VerificationResult, VerifiedIdentity } from './types';

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

const parseVerificationStorage = <T = unknown>(
  data: unknown,
  resultGuard: ZodType<VerificationResult<T>, ZodTypeDef, unknown>
): T => {
  const verificationResult = resultGuard.safeParse(data);

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

export const validateAndCheckWhetherVerificationExpires = (expiresAt: string) => {
  assertThat(
    dayjs(expiresAt).isValid() && dayjs(expiresAt).isAfter(dayjs()),
    new RequestError({ code: 'session.verification_expired', status: 401 })
  );
};

export const getVerificationStorageFromInteraction = async <T = unknown>(
  ctx: Context,
  provider: Provider,
  resultGuard: ZodType<VerificationResult<T>, ZodTypeDef, unknown>
): Promise<T> => {
  const { result } = await provider.interactionDetails(ctx.req, ctx.res);

  return parseVerificationStorage<T>(result, resultGuard);
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
