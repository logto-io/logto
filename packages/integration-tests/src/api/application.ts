import type {
  Application,
  CreateApplication,
  ApplicationType,
  OidcClientMetadata,
} from '@logto/schemas';

import { authedAdminApi } from './api.js';

export const createApplication = async (name: string, type: ApplicationType) =>
  authedAdminApi
    .post('applications', {
      json: {
        name,
        type,
      },
    })
    .json<Application>();

export const getApplication = async (applicationId: string) =>
  authedAdminApi.get(`applications/${applicationId}`).json<Application>();

export const updateApplication = async (
  applicationId: string,
  payload: Partial<
    Omit<CreateApplication, 'id' | 'created_at' | 'oidcClientMetadata'> & {
      oidcClientMetadata: Partial<OidcClientMetadata>;
    }
  >
) =>
  authedAdminApi
    .patch(`applications/${applicationId}`, {
      json: {
        ...payload,
      },
    })
    .json<Application>();

export const deleteApplication = async (applicationId: string) =>
  authedAdminApi.delete(`applications/${applicationId}`);
