import { MessageTypes } from '@logto/connector-kit';

import api from './api';

const apiPrefix = '/api/session';

type Response = {
  redirectTo: string;
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
        flow: MessageTypes.Register,
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
        flow: MessageTypes.Register,
      },
    })
    .json<Response>();

export const sendRegisterEmailPasscode = async (email: string) => {
  await api
    .post(`${apiPrefix}/passwordless/email/send`, {
      json: {
        email,
        flow: MessageTypes.Register,
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
        flow: MessageTypes.Register,
      },
    })
    .json<Response>();
