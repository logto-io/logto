import { UserFlow } from '@/types';

import {
  verifyEmailPasscode as verifyRegisterEmailPasscode,
  verifySMSPasscode as verifyRegisterSMSPasscode,
  sendEmailPasscode as sendRegisterEmailPasscode,
  sendSMSPasscode as sendRegisterSMSPasscode,
} from './register';
import {
  verifyEmailPasscode as verifySignInEmailPasscode,
  verifySMSPasscode as verifySignInSMSPasscode,
  sendEmailPasscode as sendSignInEmailPasscode,
  sendSMSPasscode as sendSignInSMSPasscode,
} from './sign-in';

export type PasscodeChannel = 'sms' | 'email';

export const getSendPasscodeApi = (type: UserFlow, channel: PasscodeChannel) => {
  if (type === 'sign-in' && channel === 'email') {
    return sendSignInEmailPasscode;
  }

  if (type === 'sign-in' && channel === 'sms') {
    return sendSignInSMSPasscode;
  }

  if (type === 'register' && channel === 'email') {
    return sendRegisterEmailPasscode;
  }

  return sendRegisterSMSPasscode;
};

export const getVerifyPasscodeApi = (type: UserFlow, channel: PasscodeChannel) => {
  if (type === 'sign-in' && channel === 'email') {
    return verifySignInEmailPasscode;
  }

  if (type === 'sign-in' && channel === 'sms') {
    return verifySignInSMSPasscode;
  }

  if (type === 'register' && channel === 'email') {
    return verifyRegisterEmailPasscode;
  }

  return verifyRegisterSMSPasscode;
};
