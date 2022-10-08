import { logTypeGuard, LogType, PasscodeType } from '@logto/schemas';
import { Truthy } from '@silverhand/essentials';
import dayjs from 'dayjs';
import { Context } from 'koa';
import { InteractionResults, Provider } from 'oidc-provider';
import { z } from 'zod';

import RequestError from '@/errors/RequestError';
import { generateUserId } from '@/lib/user';
import {
  findUserByEmail,
  findUserByPhone,
  hasUserWithEmail,
  hasUserWithPhone,
} from '@/queries/user';
import assertThat from '@/utils/assert-that';

import { verificationStorageGuard, Medium, Operation, VerificationStorage } from './types';

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
  medium: Medium,
  operation?: Operation
): LogType => {
  const body = medium === 'email' ? 'Email' : 'Sms';
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

export const checkVerificationSessionByFlowAndMedium = (
  currentFlow: PasscodeType,
  medium: Medium,
  payload: VerificationStorage
) => {
  const { flow, expiresAt, email, phone } = payload;

  assertThat(
    flow === currentFlow && ((medium === 'email' && email) || (medium === 'sms' && phone)),
    new RequestError({ code: 'session.passwordless_not_verified', status: 401 })
  );

  assertThat(
    dayjs(expiresAt).isValid() && dayjs(expiresAt).isAfter(dayjs()),
    new RequestError({ code: 'session.verification_expired', status: 401 })
  );
};

export const checkAndGetUserIdFromPayload = async (
  flow: PasscodeType,
  medium: Medium,
  payload: Pick<VerificationStorage, 'email' | 'phone'>
): Promise<string> => {
  const { email, phone } = payload;

  switch (flow + medium) {
    case PasscodeType.SignIn + 'sms':
      assertThat(
        phone && (await hasUserWithPhone(phone)),
        new RequestError({ code: 'user.phone_not_exists', status: 422 })
      );

      // eslint-disable-next-line unicorn/no-await-expression-member
      return (await findUserByPhone(phone)).id;
    case PasscodeType.SignIn + 'email':
      assertThat(
        email && (await hasUserWithEmail(email)),
        new RequestError({ code: 'user.email_not_exists', status: 422 })
      );

      // eslint-disable-next-line unicorn/no-await-expression-member
      return (await findUserByEmail(email)).id;
    case PasscodeType.Register + 'sms':
      assertThat(
        phone && !(await hasUserWithPhone(phone)),
        new RequestError({ code: 'user.phone_exists_register', status: 422 })
      );

      return generateUserId();
    case PasscodeType.Register + 'email':
      assertThat(
        email && !(await hasUserWithEmail(email)),
        new RequestError({ code: 'user.email_exists_register', status: 422 })
      );

      return generateUserId();
    default:
      throw new Error('Not implemented');
  }
};

export const assignVerificationStorageResult = async (
  ctx: Context,
  provider: Provider,
  result: InteractionResults & { verification: VerificationStorage }
) => {
  await provider.interactionResult(ctx.req, ctx.res, result);
};
