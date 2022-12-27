import { MessageTypes } from '@logto/connector-kit';

import api from './api';
import { bindSocialAccount } from './social';

const apiPrefix = '/api/session';

type Response = {
  redirectTo: string;
};

export const signInWithUsername = async (
  username: string,
  password: string,
  socialToBind?: string
) => {
  const result = await api
    .post(`${apiPrefix}/sign-in/password/username`, {
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

export const signInWithEmailPassword = async (
  email: string,
  password: string,
  socialToBind?: string
) => {
  const result = await api
    .post(`${apiPrefix}/sign-in/password/email`, {
      json: {
        email,
        password,
      },
    })
    .json<Response>();

  if (result.redirectTo && socialToBind) {
    await bindSocialAccount(socialToBind);
  }

  return result;
};

export const signInWithPhonePassword = async (
  phone: string,
  password: string,
  socialToBind?: string
) => {
  const result = await api
    .post(`${apiPrefix}/sign-in/password/sms`, {
      json: {
        phone,
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
        flow: MessageTypes.SignIn,
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
        flow: MessageTypes.SignIn,
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
        flow: MessageTypes.SignIn,
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
  const result = await api
    .post(`${apiPrefix}/passwordless/email/verify`, {
      json: {
        email,
        code,
        flow: MessageTypes.SignIn,
      },
    })
    .json<Response>();

  if (result.redirectTo && socialToBind) {
    await bindSocialAccount(socialToBind);
  }

  return result;
};
