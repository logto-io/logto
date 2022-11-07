import type { LogType, PasscodeType } from '@logto/schemas';
import { logTypeGuard } from '@logto/schemas';
import type { Truthy } from '@silverhand/essentials';
import { addSeconds, isAfter, isValid } from 'date-fns';
import type { Context } from 'koa';
import type { Provider } from 'oidc-provider';
import type { ZodType } from 'zod';
import { z } from 'zod';

import RequestError from '@/errors/RequestError';
import assertThat from '@/utils/assert-that';

import { verificationTimeout } from './consts';
import type { Method, Operation, VerificationResult, VerificationStorage } from './types';

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
