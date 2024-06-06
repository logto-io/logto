import { type SignInPayload } from '@logto/schemas';

import api from './api.js';

type RedirectResponse = {
  redirectTo: string;
};

const experienceApiPrefix = 'experience';

export const signIn = async (cookie: string, payload: SignInPayload) =>
  api.post(`${experienceApiPrefix}/sign-in`, { headers: { cookie }, json: payload }).json();

export const submit = async (cookie: string) =>
  api.post(`${experienceApiPrefix}/submit`, { headers: { cookie } }).json<RedirectResponse>();
