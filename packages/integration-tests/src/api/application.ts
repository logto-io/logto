import type {
  Application,
  CreateApplication,
  ApplicationType,
  OidcClientMetadata,
  Role,
} from '@logto/schemas';

import { authedAdminApi } from './api.js';

export const createApplication = async (
  name: string,
  type: ApplicationType,
  rest?: Partial<CreateApplication>
) =>
  authedAdminApi
    .post('applications', {
      json: {
        name,
        type,
        ...rest,
      },
    })
    .json<Application>();

export const getApplications = async () => authedAdminApi.get('applications').json<Application[]>();

export const getApplication = async (applicationId: string) =>
  authedAdminApi.get(`applications/${applicationId}`).json<Application & { isAdmin: boolean }>();

export const updateApplication = async (
  applicationId: string,
  payload: Partial<
    Omit<CreateApplication, 'id' | 'created_at' | 'oidcClientMetadata'> & {
      oidcClientMetadata: Partial<OidcClientMetadata>;
    }
  > & { isAdmin?: boolean }
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

export const getApplicationRoles = async (applicationId: string) =>
  authedAdminApi.get(`applications/${applicationId}/roles`).json<Role[]>();

export const assignRolesToApplication = async (applicationId: string, roleIds: string[]) =>
  authedAdminApi.post(`applications/${applicationId}/roles`, {
    json: { roleIds },
  });

export const putRolesToApplication = async (applicationId: string, roleIds: string[]) =>
  authedAdminApi.put(`applications/${applicationId}/roles`, {
    json: { roleIds },
  });

export const deleteRoleFromApplication = async (applicationId: string, roleId: string) =>
  authedAdminApi.delete(`applications/${applicationId}/roles/${roleId}`);
