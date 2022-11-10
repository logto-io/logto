import { SignInIdentifier } from '@logto/schemas';

import { UserFlow } from '@/types';

import { sendContinueSetEmailPasscode, sendContinueSetPhonePasscode } from './continue';
import { sendForgotPasswordEmailPasscode, sendForgotPasswordSmsPasscode } from './forgot-password';
import { sendRegisterEmailPasscode, sendRegisterSmsPasscode } from './register';
import { sendSignInEmailPasscode, sendSignInSmsPasscode } from './sign-in';

export type PasscodeChannel = SignInIdentifier.Email | SignInIdentifier.Sms;

// TODO: @simeng-li merge in to one single api

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

  if (type === UserFlow.register && method === SignInIdentifier.Sms) {
    return sendRegisterSmsPasscode;
  }

  if (type === UserFlow.continue && method === SignInIdentifier.Email) {
    return sendContinueSetEmailPasscode;
  }

  return sendContinueSetPhonePasscode;
};
