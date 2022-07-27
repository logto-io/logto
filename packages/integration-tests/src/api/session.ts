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
