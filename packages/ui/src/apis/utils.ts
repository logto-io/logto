import {
  verifyEmailPasscode as verifyRegisterEmailPasscode,
  verifyPhonePasscode as verifyRegisterPhonePasscode,
  sendEmailPasscode as sendRegisterEmailPasscode,
  sendPhonePasscode as sendRegisterPhonePasscode,
} from './register';
import {
  verifyEmailPasscode as verifySignInEmailPasscode,
  verifyPhonePasscode as verifySignInPhonePasscode,
  sendEmailPasscode as sendSignInEmailPasscode,
  sendPhonePasscode as sendSignInPhonePasscode,
} from './sign-in';

export type PasscodeType = 'sign-in' | 'register';
export type PasscodeChannel = 'phone' | 'email';

export const getSendPasscodeApi = (type: PasscodeType, channel: PasscodeChannel) => {
  if (type === 'sign-in' && channel === 'email') {
    return sendSignInEmailPasscode;
  }

  if (type === 'sign-in' && channel === 'phone') {
    return sendSignInPhonePasscode;
  }

  if (type === 'register' && channel === 'email') {
    return sendRegisterEmailPasscode;
  }

  return sendRegisterPhonePasscode;
};

export const getVerifyPasscodeApi = (type: PasscodeType, channel: PasscodeChannel) => {
  if (type === 'sign-in' && channel === 'email') {
    return verifySignInEmailPasscode;
  }

  if (type === 'sign-in' && channel === 'phone') {
    return verifySignInPhonePasscode;
  }

  if (type === 'register' && channel === 'email') {
    return verifyRegisterEmailPasscode;
  }

  return verifyRegisterPhonePasscode;
};
