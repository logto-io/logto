import api from './api';

type Response = {
  redirectTo: string;
};

export const sendResetPasswordSmsPasscode = async (phone: string) => {
  await api
    .post('/api/session/forgot-password/sms/send-passcode', {
      json: {
        phone,
      },
    })
    .json();

  return { success: true };
};

export const verifyResetPasswordSmsPasscode = async (phone: string, code: string) =>
  api
    .post('/api/session/forgot-password/sms/verify-passcode', {
      json: {
        phone,
        code,
      },
    })
    .json<Response>();

export const sendResetPasswordEmailPasscode = async (email: string) => {
  await api
    .post('/api/session/forgot-password/email/send-passcode', {
      json: {
        email,
      },
    })
    .json();

  return { success: true };
};

export const verifyResetPasswordEmailPasscode = async (email: string, code: string) =>
  api
    .post('/api/session/forgot-password/email/verify-passcode', {
      json: {
        email,
        code,
      },
    })
    .json<Response>();

export const resetPassword = async (password: string) =>
  api
    .post('/api/session/forgot-password/reset', {
      json: { password },
    })
    .json<Response>();
