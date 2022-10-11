import { logTypeGuard, LogType, PasscodeType } from '@logto/schemas';
import { Truthy } from '@silverhand/essentials';
import dayjs from 'dayjs';
import { Context } from 'koa';
import { Provider } from 'oidc-provider';
import { ZodType, ZodTypeDef } from 'zod';

import RequestError from '@/errors/RequestError';
import assertThat from '@/utils/assert-that';

import { verificationTimeout } from './consts';
import { Method, Operation, VerificationStorage, verificationSessionGuard } from './types';

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

export const validateAndCheckWhetherVerificationExpires = (expiresAt: string) => {
  assertThat(
    dayjs(expiresAt).isValid() && dayjs(expiresAt).isAfter(dayjs()),
    new RequestError({ code: 'session.verification_expired', status: 401 })
  );
};

export const getVerificationStorageFromInteraction = async <
  T extends VerificationStorage<F, M>,
  F extends PasscodeType,
  M extends Method
>(
  ctx: Context,
  provider: Provider,
  storageGuard: ZodType<T, ZodTypeDef, unknown>
): Promise<T> => {
  const { result } = await provider.interactionDetails(ctx.req, ctx.res);
  console.log(result);

  try {
    const verificationStorage = storageGuard.parse(
      verificationSessionGuard.parse(result).verification
    );

    return verificationStorage;
  } catch (error: unknown) {
    throw new RequestError(
      {
        code: 'session.verification_session_not_found',
        status: 404,
      },
      error
    );
  }
};

export const assignVerificationResult = async <
  T extends VerificationStorage<F, M>,
  F extends PasscodeType,
  M extends Method
>(
  ctx: Context,
  provider: Provider,
  verification: T
) => provider.interactionResult(ctx.req, ctx.res, { verification });

export const generateVerificationExpirationTime = () =>
  dayjs().add(verificationTimeout, 'second').toISOString();
