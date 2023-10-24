import {
  type Application,
  type CreateApplication,
  type ApplicationType,
  type OidcClientMetadata,
  type Role,
} from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

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

export const getApplications = async (types?: ApplicationType[]) => {
  const searchParams = new URLSearchParams(
    conditional(types && types.length > 0 && types.map((type) => ['types', type]))
  );

  return authedAdminApi.get('applications', { searchParams }).json<Application[]>();
};

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

/**
 * Get roles assigned to the m2m app.
 *
 * @param applicationId Concerned m2m app id
 * @param keyword Search among all roles (on `id`, `name` and `description` fields) assigned to the m2m app with `keyword`
 * @returns All roles which contains the keyword assigned to the m2m app
 */
export const getApplicationRoles = async (applicationId: string, keyword?: string) => {
  const searchParams = new URLSearchParams(conditional(keyword && [['search', `%${keyword}%`]]));
  return authedAdminApi.get(`applications/${applicationId}/roles`, { searchParams }).json<Role[]>();
};

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
