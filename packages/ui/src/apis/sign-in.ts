import ky from 'ky';

import { bindSocialAccount } from './social';

export const signInBasic = async (username: string, password: string, socialToBind?: string) => {
  type Response = {
    redirectTo: string;
  };

  const result = await ky
    .post('/api/session/sign-in/username-password', {
      json: {
        username,
        password,
      },
    })
    .json<Response>();

  if (result.redirectTo && socialToBind) {
    await bindSocialAccount(socialToBind);
  }

  return result;
};

export const sendSignInSmsPasscode = async (phone: string) => {
  return ky
    .post('/api/session/sign-in/passwordless/sms/send-passcode', {
      json: {
        phone,
      },
    })
    .json();
};

export const verifySignInSmsPasscode = async (
  phone: string,
  passcode: string,
  socialToBind?: string
) => {
  type Response = {
    redirectTo: string;
  };

  const result = await ky
    .post('/api/session/sign-in/passwordless/sms/verify-passcode', {
      json: {
        phone,
        passcode,
      },
    })
    .json<Response>();

  if (result.redirectTo && socialToBind) {
    await bindSocialAccount(socialToBind);
  }

  return result;
};

export const sendSignInEmailPasscode = async (email: string) => {
  return ky
    .post('/api/session/sign-in/passwordless/email/send-passcode', {
      json: {
        email,
      },
    })
    .json();
};

export const verifySignInEmailPasscode = async (
  email: string,
  passcode: string,
  socialToBind?: string
) => {
  type Response = {
    redirectTo: string;
  };

  const result = await ky
    .post('/api/session/sign-in/passwordless/email/verify-passcode', {
      json: {
        email,
        passcode,
      },
    })
    .json<Response>();

  if (result.redirectTo && socialToBind) {
    await bindSocialAccount(socialToBind);
  }

  return result;
};
