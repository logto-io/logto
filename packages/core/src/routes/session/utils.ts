import { logTypeGuard, LogType, PasscodeType } from '@logto/schemas';
import { Truthy } from '@silverhand/essentials';
import dayjs from 'dayjs';
import { Context } from 'koa';
import { Provider } from 'oidc-provider';
import { z, ZodType } from 'zod';

import RequestError from '@/errors/RequestError';
import assertThat from '@/utils/assert-that';

import { verificationTimeout } from './consts';
import { Method, Operation, VerificationResult, VerificationStorage } from './types';

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
  assertThat(
    dayjs(expiresAt).isValid() && dayjs(expiresAt).isAfter(dayjs()),
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
    expiresAt: dayjs().add(verificationTimeout, 'second').toISOString(),
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
