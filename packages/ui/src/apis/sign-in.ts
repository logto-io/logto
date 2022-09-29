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
    .post('/api/session/passwordless/sms/send', {
      json: {
        phone,
        flow: 'sign-in',
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

  await api.post('/api/session/passwordless/sms/verify', {
    json: {
      phone,
      code,
      flow: 'sign-in',
    },
  });

  const result = await api.post('/api/session/sign-in/passwordless/sms').json<Response>();

  if (result.redirectTo && socialToBind) {
    await bindSocialAccount(socialToBind);
  }

  return result;
};

export const sendSignInEmailPasscode = async (email: string) => {
  await api
    .post('/api/session/passwordless/email/send', {
      json: {
        email,
        flow: 'sign-in',
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

  await api.post('/api/session/passwordless/email/verify', {
    json: {
      email,
      code,
      flow: 'sign-in',
    },
  });

  const result = await api.post('/api/session/sign-in/passwordless/email').json<Response>();

  if (result.redirectTo && socialToBind) {
    await bindSocialAccount(socialToBind);
  }

  return result;
};
