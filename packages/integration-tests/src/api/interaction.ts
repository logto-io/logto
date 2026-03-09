import type { ConsentInfoResponse } from '@logto/schemas';

import api from './api.js';

export type RedirectResponse = {
  redirectTo: string;
};

export const consent = async (cookie: string, payload: { organizationIds?: string[] } = {}) =>
  api
    .post('interaction/consent', {
      headers: {
        cookie,
      },
      redirect: 'manual',
      throwHttpErrors: false,
      json: payload,
    })
    .json<RedirectResponse>();

export const getConsentInfo = async (cookie: string) =>
  api
    .get('interaction/consent', {
      headers: { cookie },
    })
    .json<ConsentInfoResponse>();
