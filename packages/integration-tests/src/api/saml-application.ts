import { type SamlApplicationResponse, type CreateSamlApplication } from '@logto/schemas';

import { authedAdminApi } from './api.js';

export const createSamlApplication = async (createSamlApplication: CreateSamlApplication) =>
  authedAdminApi
    .post('saml-applications', {
      json: createSamlApplication,
    })
    .json<SamlApplicationResponse>();

export const deleteSamlApplication = async (id: string) =>
  authedAdminApi.delete(`saml-applications/${id}`);
