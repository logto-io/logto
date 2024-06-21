import { type PasswordSignInPayload } from '@logto/schemas';

import api from '../api.js';

import { experienceApiPrefix } from './const.js';

type RedirectResponse = {
  redirectTo: string;
};

export const signInWithPassword = async (cookie: string, payload: PasswordSignInPayload) =>
  api
    .post(`${experienceApiPrefix}/sign-in/password`, { headers: { cookie }, json: payload })
    .json();

export const submit = async (cookie: string) =>
  api.post(`${experienceApiPrefix}/submit`, { headers: { cookie } }).json<RedirectResponse>();
