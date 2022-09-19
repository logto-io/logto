import { UserFlow } from '@/types';

import {
  verifyRegisterEmailPasscode,
  verifyRegisterSmsPasscode,
  sendRegisterEmailPasscode,
  sendRegisterSmsPasscode,
} from './register';
import {
  sendResetPasswordEmailPasscode,
  sendResetPasswordSmsPasscode,
  verifyResetPasswordEmailPasscode,
  verifyResetPasswordSmsPasscode,
} from './reset-password';
import {
  verifySignInEmailPasscode,
  verifySignInSmsPasscode,
  sendSignInEmailPasscode,
  sendSignInSmsPasscode,
} from './sign-in';

export type PasscodeChannel = 'sms' | 'email';

export const getSendPasscodeApi = (
  type: UserFlow,
  method: PasscodeChannel
): ((_address: string) => Promise<{ success: boolean }>) => {
  if (type === 'reset-password' && method === 'email') {
    return sendResetPasswordEmailPasscode;
  }

  if (type === 'reset-password' && method === 'sms') {
    return sendResetPasswordSmsPasscode;
  }

  if (type === 'sign-in' && method === 'email') {
    return sendSignInEmailPasscode;
  }

  if (type === 'sign-in' && method === 'sms') {
    return sendSignInSmsPasscode;
  }

  if (type === 'register' && method === 'email') {
    return sendRegisterEmailPasscode;
  }

  return sendRegisterSmsPasscode;
};

export const getVerifyPasscodeApi = (
  type: UserFlow,
  method: PasscodeChannel
): ((_address: string, code: string, socialToBind?: string) => Promise<{ redirectTo: string }>) => {
  if (type === 'reset-password' && method === 'email') {
    return verifyResetPasswordEmailPasscode;
  }

  if (type === 'reset-password' && method === 'sms') {
    return verifyResetPasswordSmsPasscode;
  }

  if (type === 'sign-in' && method === 'email') {
    return verifySignInEmailPasscode;
  }

  if (type === 'sign-in' && method === 'sms') {
    return verifySignInSmsPasscode;
  }

  if (type === 'register' && method === 'email') {
    return verifyRegisterEmailPasscode;
  }

  return verifyRegisterSmsPasscode;
};
