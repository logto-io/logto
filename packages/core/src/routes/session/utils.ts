import { logTypeGuard, LogType, PasscodeType } from '@logto/schemas';
import { Truthy } from '@silverhand/essentials';
import camelcase from 'camelcase';
import dayjs from 'dayjs';

import RequestError from '@/errors/RequestError';
import assertThat from '@/utils/assert-that';

import { FlowType, Operation, VerificationStorage, Via } from './types';

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
  if (type === 'sign-in') {
    return PasscodeType.SignIn;
  }

  if (type === 'register') {
    return PasscodeType.Register;
  }

  return PasscodeType.ForgotPassword;
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
