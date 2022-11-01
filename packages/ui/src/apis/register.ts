import { PasscodeType } from '@logto/schemas';

import api from './api';

const apiPrefix = '/api/session';

type Response = {
  redirectTo: string;
};

export const register = async (username: string, password: string) => {
  return api
    .post(`${apiPrefix}/register/password/username`, {
      json: {
        username,
        password,
      },
    })
    .json<Response>();
};

export const registerWithSms = async () =>
  api.post(`${apiPrefix}/register/passwordless/sms`).json<Response>();

export const registerWithEmail = async () =>
  api.post(`${apiPrefix}/register/passwordless/email`).json<Response>();

export const sendRegisterSmsPasscode = async (phone: string) => {
  await api
    .post(`${apiPrefix}/passwordless/sms/send`, {
      json: {
        phone,
        flow: PasscodeType.Register,
      },
    })
    .json();

  return { success: true };
};

export const verifyRegisterSmsPasscode = async (phone: string, code: string) =>
  api
    .post(`${apiPrefix}/passwordless/sms/verify`, {
      json: {
        phone,
        code,
        flow: PasscodeType.Register,
      },
    })
    .json<Response>();

export const sendRegisterEmailPasscode = async (email: string) => {
  await api
    .post(`${apiPrefix}/passwordless/email/send`, {
      json: {
        email,
        flow: PasscodeType.Register,
      },
    })
    .json();

  return { success: true };
};

export const verifyRegisterEmailPasscode = async (email: string, code: string) =>
  api
    .post(`${apiPrefix}/passwordless/email/verify`, {
      json: {
        email,
        code,
        flow: PasscodeType.Register,
      },
    })
    .json<Response>();

export const checkUsername = async (username: string) => {
  await api
    .post(`${apiPrefix}/register/password/check-username`, {
      json: {
        username,
      },
    })
    .json();

  return { success: true };
};
