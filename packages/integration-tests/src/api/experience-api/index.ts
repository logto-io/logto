import { type IdentificationApiPayload } from '@logto/schemas';

import api from '../api.js';

import { experienceApiPrefix, experienceIdentificationApiRoutesPrefix } from './const.js';

type RedirectResponse = {
  redirectTo: string;
};

export const identifyUser = async (cookie: string, payload: IdentificationApiPayload) =>
  api
    .post(experienceIdentificationApiRoutesPrefix, {
      headers: { cookie },
      json: payload,
    })
    .json();

export const submit = async (cookie: string) =>
  api.post(`${experienceApiPrefix}/submit`, { headers: { cookie } }).json<RedirectResponse>();
