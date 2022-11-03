import { SignInIdentifier } from '@logto/schemas';

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

export type PasscodeChannel = SignInIdentifier.Email | SignInIdentifier.Sms;

export const getSendPasscodeApi = (
  type: UserFlow,
  method: PasscodeChannel
): ((_address: string) => Promise<{ success: boolean }>) => {
  if (type === UserFlow.forgotPassword && method === SignInIdentifier.Email) {
    return sendForgotPasswordEmailPasscode;
  }

  if (type === UserFlow.forgotPassword && method === SignInIdentifier.Sms) {
    return sendForgotPasswordSmsPasscode;
  }

  if (type === UserFlow.signIn && method === SignInIdentifier.Email) {
    return sendSignInEmailPasscode;
  }

  if (type === UserFlow.signIn && method === SignInIdentifier.Sms) {
    return sendSignInSmsPasscode;
  }

  if (type === UserFlow.register && method === SignInIdentifier.Email) {
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
  if (type === UserFlow.forgotPassword && method === SignInIdentifier.Email) {
    return verifyForgotPasswordEmailPasscode;
  }

  if (type === UserFlow.forgotPassword && method === SignInIdentifier.Sms) {
    return verifyForgotPasswordSmsPasscode;
  }

  if (type === UserFlow.signIn && method === SignInIdentifier.Email) {
    return verifySignInEmailPasscode;
  }

  if (type === UserFlow.signIn && method === SignInIdentifier.Sms) {
    return verifySignInSmsPasscode;
  }

  if (type === UserFlow.register && method === SignInIdentifier.Email) {
    return verifyRegisterEmailPasscode;
  }

  return verifyRegisterSmsPasscode;
};
