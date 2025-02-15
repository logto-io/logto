import {
  type SamlApplicationResponse,
  type CreateSamlApplication,
  type PatchSamlApplication,
  type SamlApplicationSecretResponse,
} from '@logto/schemas';

import api, { authedAdminApi } from './api.js';

export const createSamlApplication = async (createSamlApplication: CreateSamlApplication) =>
  authedAdminApi
    .post('saml-applications', {
      json: createSamlApplication,
    })
    .json<SamlApplicationResponse>();

export const deleteSamlApplication = async (id: string) =>
  authedAdminApi.delete(`saml-applications/${id}`);

export const updateSamlApplication = async (
  id: string,
  patchSamlApplication: PatchSamlApplication
) =>
  authedAdminApi
    .patch(`saml-applications/${id}`, { json: patchSamlApplication })
    .json<SamlApplicationResponse>();

export const getSamlApplication = async (id: string) =>
  authedAdminApi.get(`saml-applications/${id}`).json<SamlApplicationResponse>();

export const createSamlApplicationSecret = async (id: string, lifeSpanInYears: number) =>
  authedAdminApi
    .post(`saml-applications/${id}/secrets`, { json: { lifeSpanInYears } })
    .json<SamlApplicationSecretResponse>();

export const getSamlApplicationSecrets = async (id: string) =>
  authedAdminApi.get(`saml-applications/${id}/secrets`).json<SamlApplicationSecretResponse[]>();

export const deleteSamlApplicationSecret = async (id: string, secretId: string) =>
  authedAdminApi.delete(`saml-applications/${id}/secrets/${secretId}`);

export const updateSamlApplicationSecret = async (id: string, secretId: string, active: boolean) =>
  authedAdminApi
    .patch(`saml-applications/${id}/secrets/${secretId}`, { json: { active } })
    .json<SamlApplicationSecretResponse>();

// Anonymous endpoints
export const getSamlApplicationMetadata = async (id: string) =>
  api
    .get(`saml-applications/${id}/metadata`, {
      headers: {
        Accept: 'text/xml',
      },
    })
    .text();
