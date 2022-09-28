import { PasscodeType } from '@logto/schemas';
import { Truthy } from '@silverhand/essentials';

import { FlowType } from './types';

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
