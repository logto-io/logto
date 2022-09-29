import api from './api';

const apiPrefix = '/api/session';

export const register = async (username: string, password: string) => {
  type Response = {
    redirectTo: string;
  };

  return api
    .post(`${apiPrefix}/register/username-password`, {
      json: {
        username,
        password,
      },
    })
    .json<Response>();
};

export const sendRegisterSmsPasscode = async (phone: string) => {
  await api
    .post(`${apiPrefix}/passwordless/sms/send`, {
      json: {
        phone,
        flow: 'register',
      },
    })
    .json();

  return { success: true };
};

export const verifyRegisterSmsPasscode = async (phone: string, code: string) => {
  type Response = {
    redirectTo: string;
  };

  await api.post(`${apiPrefix}/passwordless/sms/verify`, {
    json: {
      phone,
      code,
      flow: 'register',
    },
  });

  return api.post(`${apiPrefix}/register/passwordless/sms`).json<Response>();
};

export const sendRegisterEmailPasscode = async (email: string) => {
  await api
    .post(`${apiPrefix}/passwordless/email/send`, {
      json: {
        email,
        flow: 'register',
      },
    })
    .json();

  return { success: true };
};

export const verifyRegisterEmailPasscode = async (email: string, code: string) => {
  type Response = {
    redirectTo: string;
  };

  await api.post(`${apiPrefix}/passwordless/email/verify`, {
    json: {
      email,
      code,
      flow: 'register',
    },
  });

  return api.post(`${apiPrefix}/register/passwordless/email`).json<Response>();
};
