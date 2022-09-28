import { logTypeGuard, LogType, PasscodeType } from '@logto/schemas';
import { Truthy } from '@silverhand/essentials';

import RequestError from '@/errors/RequestError';
import assertThat from '@/utils/assert-that';

import { FlowType, Operation, Via } from './types';

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
  return type === 'sign-in'
    ? PasscodeType.SignIn
    : type === 'register'
    ? PasscodeType.Register
    : PasscodeType.ForgotPassword;
};

export const getPasswordlessRelatedLogType = (
  flow: FlowType,
  via: Via,
  operation?: Operation
): LogType => {
  const prefix =
    flow === 'register' ? 'Register' : flow === 'sign-in' ? 'SignIn' : 'ForgotPassword';
  const body = via === 'email' ? 'Email' : 'Sms';
  const suffix = operation === 'send' ? 'SendPasscode' : '';

  const result = logTypeGuard.safeParse(prefix + body + suffix);
  assertThat(result.success, new RequestError('log.invalid_type'));

  return result.data;
};
