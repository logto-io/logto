import ky from 'ky';

export const signInBasic = async (username: string, password: string) => {
  type Response = {
    redirectTo: string;
  };

  return ky
    .post('/api/session/sign-in/username-password', {
      json: {
        username,
        password,
      },
    })
    .json<Response>();
};

export const sendPhonePasscode = async (phone: string) => {
  return ky
    .post('/api/session/sign-in/passwordless/sms/send-passcode', {
      json: {
        phone,
      },
    })
    .json();
};

export const verifyPhonePasscode = async (phone: string, passcode: string) => {
  type Response = {
    redirectTo: string;
  };

  return ky
    .post('/api/session/sign-in/passwordless/sms/verify-passcode', {
      json: {
        phone,
        passcode,
      },
    })
    .json<Response>();
};

export const sendEmailPasscode = async (email: string) => {
  return ky
    .post('/api/session/sign-in/passwordless/email/send-passcode', {
      json: {
        email,
      },
    })
    .json();
};

export const verifyEmailPasscode = async (email: string, passcode: string) => {
  type Response = {
    redirectTo: string;
  };

  return ky
    .post('/api/session/sign-in/passwordless/email/verify-passcode', {
      json: {
        email,
        passcode,
      },
    })
    .json<Response>();
};
