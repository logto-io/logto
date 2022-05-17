import api from './api';
import { bindSocialAccount } from './social';

export const signInBasic = async (username: string, password: string, socialToBind?: string) => {
  type Response = {
    redirectTo: string;
  };

  const result = await api
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
  await api
    .post('/api/session/sign-in/passwordless/sms/send-passcode', {
      json: {
        phone,
      },
    })
    .json();

  return { success: true };
};

export const verifySignInSmsPasscode = async (
  phone: string,
  code: string,
  socialToBind?: string
) => {
  type Response = {
    redirectTo: string;
  };

  const result = await api
    .post('/api/session/sign-in/passwordless/sms/verify-passcode', {
      json: {
        phone,
        code,
      },
    })
    .json<Response>();

  if (result.redirectTo && socialToBind) {
    await bindSocialAccount(socialToBind);
  }

  return result;
};

export const sendSignInEmailPasscode = async (email: string) => {
  await api
    .post('/api/session/sign-in/passwordless/email/send-passcode', {
      json: {
        email,
      },
    })
    .json();

  return { success: true };
};

export const verifySignInEmailPasscode = async (
  email: string,
  code: string,
  socialToBind?: string
) => {
  type Response = {
    redirectTo: string;
  };

  const result = await api
    .post('/api/session/sign-in/passwordless/email/verify-passcode', {
      json: {
        email,
        code,
      },
    })
    .json<Response>();

  if (result.redirectTo && socialToBind) {
    await bindSocialAccount(socialToBind);
  }

  return result;
};
