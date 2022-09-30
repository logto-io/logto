import { logTypeGuard, LogType, PasscodeType } from '@logto/schemas';
import { Truthy } from '@silverhand/essentials';
import camelcase from 'camelcase';
import dayjs from 'dayjs';
import { Context } from 'koa';
import { Provider } from 'oidc-provider';
import { z } from 'zod';

import RequestError from '@/errors/RequestError';
import { LogContext } from '@/middleware/koa-log';
import assertThat from '@/utils/assert-that';

import { verificationStorageGuard, FlowType, Operation, VerificationStorage, Via } from './types';

export const getRoutePrefix = (
  type: FlowType,
  method?: 'passwordless' | 'username-password' | 'social'
) => {
  return ['session', type, method]
    .filter((value): value is Truthy<typeof value> => value !== undefined)
    .map((value) => '/' + value)
    .join('');
};

export const getPasscodeType = (type: FlowType) => {
  switch (type) {
    case 'sign-in':
      return PasscodeType.SignIn;
    case 'register':
      return PasscodeType.Register;
    case 'forgot-password':
      return PasscodeType.ForgotPassword;
    default:
      throw new RequestError({ code: 'guard.invalid_input' });
  }
};

export const getPasswordlessRelatedLogType = (
  flow: FlowType,
  via: Via,
  operation?: Operation
): LogType => {
  const prefix = camelcase(flow, { pascalCase: true });
  const body = via === 'email' ? 'Email' : 'Sms';
  const suffix = operation === 'send' ? 'SendPasscode' : '';

  const result = logTypeGuard.safeParse(prefix + body + suffix);
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

export const verificationSessionCheckByFlow = (
  currentFlow: FlowType,
  payload: Pick<VerificationStorage, 'flow' | 'expiresAt'>
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

export const getAndCheckVerificationStorage = async (
  ctx: Context & LogContext,
  provider: Provider,
  logType: LogType,
  flowType: FlowType
): Promise<Pick<VerificationStorage, 'email' | 'phone'>> => {
  const { result } = await provider.interactionDetails(ctx.req, ctx.res);
  const { email, phone, flow, expiresAt } = parseVerificationStorage(result);

  ctx.log(logType, { email, phone, flow, expiresAt });

  verificationSessionCheckByFlow(flowType, { flow, expiresAt });

  return { email, phone };
};
