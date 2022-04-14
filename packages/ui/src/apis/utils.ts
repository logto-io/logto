import { UserFlow } from '@/types';

import {
  verifyEmailPasscode as verifyRegisterEmailPasscode,
  verifySmsPasscode as verifyRegisterSmsPasscode,
  sendEmailPasscode as sendRegisterEmailPasscode,
  sendSmsPasscode as sendRegisterSmsPasscode,
} from './register';
import {
  verifyEmailPasscode as verifySignInEmailPasscode,
  verifySmsPasscode as verifySignInSmsPasscode,
  sendEmailPasscode as sendSignInEmailPasscode,
  sendSmsPasscode as sendSignInSmsPasscode,
} from './sign-in';

export type PasscodeChannel = 'sms' | 'email';

export const getSendPasscodeApi = (type: UserFlow, channel: PasscodeChannel) => {
  if (type === 'sign-in' && channel === 'email') {
    return sendSignInEmailPasscode;
  }

  if (type === 'sign-in' && channel === 'sms') {
    return sendSignInSmsPasscode;
  }

  if (type === 'register' && channel === 'email') {
    return sendRegisterEmailPasscode;
  }

  return sendRegisterSmsPasscode;
};

export const getVerifyPasscodeApi = (type: UserFlow, channel: PasscodeChannel) => {
  if (type === 'sign-in' && channel === 'email') {
    return verifySignInEmailPasscode;
  }

  if (type === 'sign-in' && channel === 'sms') {
    return verifySignInSmsPasscode;
  }

  if (type === 'register' && channel === 'email') {
    return verifyRegisterEmailPasscode;
  }

  return verifyRegisterSmsPasscode;
};
