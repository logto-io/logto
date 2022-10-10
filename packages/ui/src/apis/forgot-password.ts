import { PasscodeType } from '@logto/schemas';

import api from './api';

type Response = {
  redirectTo: string;
};

const forgotPasswordApiPrefix = '/api/session/forgot-password';

export const sendForgotPasswordSmsPasscode = async (phone: string) => {
  await api
    .post('/api/session/passwordless/sms/send', {
      json: {
        phone,
        flow: PasscodeType.ForgotPassword,
      },
    })
    .json();

  return { success: true };
};

export const verifyForgotPasswordSmsPasscode = async (phone: string, code: string) =>
  api
    .post('/api/session/passwordless/sms/verify', {
      json: {
        phone,
        code,
        flow: PasscodeType.ForgotPassword,
      },
    })
    .json<Response>();

export const sendForgotPasswordEmailPasscode = async (email: string) => {
  await api
    .post('/api/session/passwordless/email/send', {
      json: {
        email,
        flow: PasscodeType.ForgotPassword,
      },
    })
    .json();

  return { success: true };
};

export const verifyForgotPasswordEmailPasscode = async (email: string, code: string) =>
  api
    .post('/api/session/passwordless/email/verify', {
      json: {
        email,
        code,
        flow: PasscodeType.ForgotPassword,
      },
    })
    .json<Response>();

export const resetPassword = async (password: string) =>
  api
    .post(`${forgotPasswordApiPrefix}/reset`, {
      json: { password },
    })
    .json<Response>();
