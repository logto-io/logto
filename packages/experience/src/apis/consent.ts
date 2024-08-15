import { type ConsentInfoResponse } from '@logto/schemas';

import api from './api';

export const consent = async (organizationId?: string) => {
  type Response = {
    redirectTo: string;
  };

  return api
    .post('/api/interaction/consent', {
      json: {
        organizationIds: organizationId && [organizationId],
      },
    })
    .json<Response>();
};

export const getConsentInfo = async () => {
  return api.get('/api/interaction/consent').json<ConsentInfoResponse>();
};
