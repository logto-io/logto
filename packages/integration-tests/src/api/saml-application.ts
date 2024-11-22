import {
  type SamlApplicationResponse,
  type CreateSamlApplication,
  type PatchSamlApplication,
} from '@logto/schemas';

import { authedAdminApi } from './api.js';

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
