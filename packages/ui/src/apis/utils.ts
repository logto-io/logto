import { UserFlow } from '@/types';

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
  if (type === 'reset-password' && method === 'email') {
    // TODO: update using reset-password verification api
    return async () => ({ success: true });
  }

  if (type === 'reset-password' && method === 'sms') {
    // TODO: update using reset-password verification api
    return async () => ({ success: true });
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
    // TODO: update using reset-password verification api
    return async () => ({ redirectTo: '' });
  }

  if (type === 'reset-password' && method === 'sms') {
    // TODO: update using reset-password verification api
    return async () => ({ redirectTo: '' });
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
