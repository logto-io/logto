import api from './api';

type Response = {
  redirectTo: string;
};

const forgotPasswordApiPrefix = '/api/session/forgot-password';

export const sendForgotPasswordSmsPasscode = async (phone: string) => {
  await api
    .post(`${forgotPasswordApiPrefix}/sms/send-passcode`, {
      json: {
        phone,
      },
    })
    .json();

  return { success: true };
};

export const verifyForgotPasswordSmsPasscode = async (phone: string, code: string) =>
  api
    .post(`${forgotPasswordApiPrefix}/sms/verify-passcode`, {
      json: {
        phone,
        code,
      },
    })
    .json<Response>();

export const sendForgotPasswordEmailPasscode = async (email: string) => {
  await api
    .post(`${forgotPasswordApiPrefix}/email/send-passcode`, {
      json: {
        email,
      },
    })
    .json();

  return { success: true };
};

export const verifyForgotPasswordEmailPasscode = async (email: string, code: string) =>
  api
    .post(`${forgotPasswordApiPrefix}/email/verify-passcode`, {
      json: {
        email,
        code,
      },
    })
    .json<Response>();

export const resetPassword = async (password: string) =>
  api
    .post(`${forgotPasswordApiPrefix}/reset`, {
      json: { password },
    })
    .json<Response>();
