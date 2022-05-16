import api from './api';

export const register = async (username: string, password: string) => {
  type Response = {
    redirectTo: string;
  };

  return api
    .post('/api/session/register/username-password', {
      json: {
        username,
        password,
      },
    })
    .json<Response>();
};

export const sendRegisterSmsPasscode = async (phone: string) => {
  await api
    .post('/api/session/register/passwordless/sms/send-passcode', {
      json: {
        phone,
      },
    })
    .json();

  return { success: true };
};

export const verifyRegisterSmsPasscode = async (phone: string, passcode: string) => {
  type Response = {
    redirectTo: string;
  };

  return api
    .post('/api/session/register/passwordless/sms/verify-passcode', {
      json: {
        phone,
        passcode,
      },
    })
    .json<Response>();
};

export const sendRegisterEmailPasscode = async (email: string) => {
  await api
    .post('/api/session/register/passwordless/email/send-passcode', {
      json: {
        email,
      },
    })
    .json();

  return { success: true };
};

export const verifyRegisterEmailPasscode = async (email: string, passcode: string) => {
  type Response = {
    redirectTo: string;
  };

  return api
    .post('/api/session/register/passwordless/email/verify-passcode', {
      json: {
        email,
        passcode,
      },
    })
    .json<Response>();
};
