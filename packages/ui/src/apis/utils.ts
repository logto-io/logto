import { UserFlow } from '@/types';

import {
  sendForgotPasswordEmailPasscode,
  sendForgotPasswordSmsPasscode,
  verifyForgotPasswordEmailPasscode,
  verifyForgotPasswordSmsPasscode,
} from './forgot-password';
import {
  verifyRegisterEmailPasscode,
  verifyRegisterSmsPasscode,
  sendRegisterEmailPasscode,
  sendRegisterSmsPasscode,
} from './register';
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
  if (type === 'forgot-password' && method === 'email') {
    return sendForgotPasswordEmailPasscode;
  }

  if (type === 'forgot-password' && method === 'sms') {
    return sendForgotPasswordSmsPasscode;
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
  if (type === 'forgot-password' && method === 'email') {
    return verifyForgotPasswordEmailPasscode;
  }

  if (type === 'forgot-password' && method === 'sms') {
    return verifyForgotPasswordSmsPasscode;
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
