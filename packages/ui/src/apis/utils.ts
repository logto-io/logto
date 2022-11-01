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
  if (type === UserFlow.forgotPassword && method === 'email') {
    return sendForgotPasswordEmailPasscode;
  }

  if (type === UserFlow.forgotPassword && method === 'sms') {
    return sendForgotPasswordSmsPasscode;
  }

  if (type === UserFlow.signIn && method === 'email') {
    return sendSignInEmailPasscode;
  }

  if (type === UserFlow.signIn && method === 'sms') {
    return sendSignInSmsPasscode;
  }

  if (type === UserFlow.register && method === 'email') {
    return sendRegisterEmailPasscode;
  }

  return sendRegisterSmsPasscode;
};

export const getVerifyPasscodeApi = (
  type: UserFlow,
  method: PasscodeChannel
): ((
  _address: string,
  code: string,
  socialToBind?: string
) => Promise<{ redirectTo?: string; success?: boolean }>) => {
  if (type === UserFlow.forgotPassword && method === 'email') {
    return verifyForgotPasswordEmailPasscode;
  }

  if (type === UserFlow.forgotPassword && method === 'sms') {
    return verifyForgotPasswordSmsPasscode;
  }

  if (type === UserFlow.signIn && method === 'email') {
    return verifySignInEmailPasscode;
  }

  if (type === UserFlow.signIn && method === 'sms') {
    return verifySignInSmsPasscode;
  }

  if (type === UserFlow.register && method === 'email') {
    return verifyRegisterEmailPasscode;
  }

  return verifyRegisterSmsPasscode;
};
