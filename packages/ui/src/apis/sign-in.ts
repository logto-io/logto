import { PasscodeType } from '@logto/schemas';

import api from './api';
import { bindSocialAccount } from './social';

const apiPrefix = '/api/session';

type Response = {
  redirectTo: string;
};

export const signInBasic = async (username: string, password: string, socialToBind?: string) => {
  const result = await api
    .post(`${apiPrefix}/sign-in/username-password`, {
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

export const signInWithSms = async (socialToBind?: string) => {
  const result = await api.post(`${apiPrefix}/sign-in/passwordless/sms`).json<Response>();

  if (result.redirectTo && socialToBind) {
    await bindSocialAccount(socialToBind);
  }

  return result;
};

export const signInWithEmail = async (socialToBind?: string) => {
  const result = await api.post(`${apiPrefix}/sign-in/passwordless/email`).json<Response>();

  if (result.redirectTo && socialToBind) {
    await bindSocialAccount(socialToBind);
  }

  return result;
};

export const sendSignInSmsPasscode = async (phone: string) => {
  await api
    .post(`${apiPrefix}/passwordless/sms/send`, {
      json: {
        phone,
        flow: PasscodeType.SignIn,
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
  const result = await api
    .post(`${apiPrefix}/passwordless/sms/verify`, {
      json: {
        phone,
        code,
        flow: PasscodeType.SignIn,
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
    .post(`${apiPrefix}/passwordless/email/send`, {
      json: {
        email,
        flow: PasscodeType.SignIn,
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
    .post(`${apiPrefix}/passwordless/email/verify`, {
      json: {
        email,
        code,
        flow: PasscodeType.SignIn,
      },
    })
    .json<Response>();

  if (result.redirectTo && socialToBind) {
    await bindSocialAccount(socialToBind);
  }

  return result;
};
