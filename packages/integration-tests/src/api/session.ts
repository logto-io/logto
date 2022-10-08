import { PasscodeType } from '@logto/schemas';

import api from './api';

type RedirectResponse = {
  redirectTo: string;
};

export const registerUserWithUsernameAndPassword = async (
  username: string,
  password: string,
  interactionCookie: string
) =>
  api
    .post('session/register/username-password', {
      headers: {
        cookie: interactionCookie,
      },
      json: {
        username,
        password,
      },
      followRedirect: false,
    })
    .json<RedirectResponse>();

export const signInWithUsernameAndPassword = async (
  username: string,
  password: string,
  interactionCookie: string
) =>
  api
    .post('session/sign-in/username-password', {
      headers: {
        cookie: interactionCookie,
      },
      json: {
        username,
        password,
      },
      followRedirect: false,
    })
    .json<RedirectResponse>();

export const consent = async (interactionCookie: string) =>
  api
    .post('session/consent', {
      headers: {
        cookie: interactionCookie,
      },
      followRedirect: false,
    })
    .json<RedirectResponse>();

export const sendRegisterUserWithEmailPasscode = (email: string, interactionCookie: string) =>
  api.post('session/passwordless/email/send', {
    headers: {
      cookie: interactionCookie,
    },
    json: {
      email,
      flow: PasscodeType.Register,
    },
  });

export const verifyRegisterUserWithEmailPasscode = (
  email: string,
  code: string,
  interactionCookie: string
) =>
  api.post('session/passwordless/email/verify', {
    headers: {
      cookie: interactionCookie,
    },
    json: {
      email,
      code,
      flow: PasscodeType.Register,
    },
  });

export const checkVerificationSessionAndRegisterWithEmail = (interactionCookie: string) =>
  api
    .post('session/register/passwordless/email', {
      headers: {
        cookie: interactionCookie,
      },
    })
    .json<RedirectResponse>();

export const sendSignInUserWithEmailPasscode = (email: string, interactionCookie: string) =>
  api.post('session/passwordless/email/send', {
    headers: {
      cookie: interactionCookie,
    },
    json: {
      email,
      flow: PasscodeType.SignIn,
    },
  });

export const verifySignInUserWithEmailPasscode = (
  email: string,
  code: string,
  interactionCookie: string
) =>
  api.post('session/passwordless/email/verify', {
    headers: {
      cookie: interactionCookie,
    },
    json: {
      email,
      code,
      flow: PasscodeType.SignIn,
    },
  });

export const checkVerificationSessionAndSignInWithEmail = (interactionCookie: string) =>
  api
    .post('session/sign-in/passwordless/email', {
      headers: {
        cookie: interactionCookie,
      },
    })
    .json<RedirectResponse>();

export const sendRegisterUserWithSmsPasscode = (phone: string, interactionCookie: string) =>
  api.post('session/passwordless/sms/send', {
    headers: {
      cookie: interactionCookie,
    },
    json: {
      phone,
      flow: PasscodeType.Register,
    },
  });

export const verifyRegisterUserWithSmsPasscode = (
  phone: string,
  code: string,
  interactionCookie: string
) =>
  api.post('session/passwordless/sms/verify', {
    headers: {
      cookie: interactionCookie,
    },
    json: {
      phone,
      code,
      flow: PasscodeType.Register,
    },
  });

export const checkVerificationSessionAndRegisterWithSms = (interactionCookie: string) =>
  api
    .post('session/register/passwordless/sms', {
      headers: {
        cookie: interactionCookie,
      },
    })
    .json<RedirectResponse>();

export const sendSignInUserWithSmsPasscode = (phone: string, interactionCookie: string) =>
  api.post('session/passwordless/sms/send', {
    headers: {
      cookie: interactionCookie,
    },
    json: {
      phone,
      flow: PasscodeType.SignIn,
    },
  });

export const verifySignInUserWithSmsPasscode = (
  phone: string,
  code: string,
  interactionCookie: string
) =>
  api.post('session/passwordless/sms/verify', {
    headers: {
      cookie: interactionCookie,
    },
    json: {
      phone,
      code,
      flow: PasscodeType.SignIn,
    },
  });

export const checkVerificationSessionAndSignInWithSms = (interactionCookie: string) =>
  api
    .post('session/sign-in/passwordless/sms', {
      headers: {
        cookie: interactionCookie,
      },
    })
    .json<RedirectResponse>();

export const signInWithSocial = (
  payload: {
    connectorId: string;
    state: string;
    redirectUri: string;
  },
  interactionCookie: string
) =>
  api
    .post('session/sign-in/social', { headers: { cookie: interactionCookie }, json: payload })
    .json<RedirectResponse>();

export const getAuthWithSocial = (
  payload: { connectorId: string; data: unknown },
  interactionCookie: string
) =>
  api
    .post('session/sign-in/social/auth', {
      headers: { cookie: interactionCookie },
      json: payload,
    })
    .json<RedirectResponse>();

export const registerWithSocial = (connectorId: string, interactionCookie: string) =>
  api
    .post('session/register/social', {
      headers: { cookie: interactionCookie },
      json: { connectorId },
    })
    .json<RedirectResponse>();

export const bindWithSocial = (connectorId: string, interactionCookie: string) =>
  api
    .post('session/bind-social', {
      headers: { cookie: interactionCookie },
      json: { connectorId },
    })
    .json<RedirectResponse>();
