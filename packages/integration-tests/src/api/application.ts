import {
  ApplicationType,
  type Application,
  type CreateApplication,
  type OidcClientMetadata,
  type Role,
  type ProtectedAppMetadata,
  type OrganizationWithRoles,
} from '@logto/schemas';
import { formUrlEncodedHeaders } from '@logto/shared';
import { conditional } from '@silverhand/essentials';

import { authedAdminApi, oidcApi } from './api.js';

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

export const getApplications = async (
  types?: ApplicationType[],
  searchParameters?: Record<string, string>,
  isThirdParty?: 'true' | 'false'
) => {
  const searchParams = new URLSearchParams([
    ...(conditional(types && types.length > 0 && types.map((type) => ['types', type])) ?? []),
    ...(conditional(
      searchParameters &&
        Object.keys(searchParameters).length > 0 &&
        Object.entries(searchParameters).map(([key, value]) => [key, value])
    ) ?? []),
    ...(conditional(isThirdParty && [['isThirdParty', isThirdParty]]) ?? []),
  ]);

  return authedAdminApi.get('applications', { searchParams }).json<Application[]>();
};

export const getApplication = async (applicationId: string) =>
  authedAdminApi.get(`applications/${applicationId}`).json<Application & { isAdmin: boolean }>();

export const updateApplication = async (
  applicationId: string,
  payload: Partial<
    Omit<CreateApplication, 'id' | 'created_at' | 'oidcClientMetadata' | 'protectedAppMetadata'> & {
      oidcClientMetadata: Partial<OidcClientMetadata>;
    } & { protectedAppMetadata: Partial<ProtectedAppMetadata> }
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

export const generateM2mLog = async (applicationId: string) => {
  const { id, secret, type, isThirdParty } = await getApplication(applicationId);

  if (type !== ApplicationType.MachineToMachine || isThirdParty) {
    return;
  }

  // This is a token request with insufficient parameters and should fail. We make the request to generate a log for the current machine to machine app.
  return oidcApi.post('token', {
    body: new URLSearchParams({
      client_id: id,
      client_secret: secret,
      grant_type: 'client_credentials',
    }),
  });
};

/** Get organizations that an application is associated with. */
export const getOrganizations = async (applicationId: string, page?: number, pageSize?: number) => {
  const searchParams = new URLSearchParams();

  if (page) {
    searchParams.append('page', String(page));
  }

  if (pageSize) {
    searchParams.append('page_size', String(pageSize));
  }

  return authedAdminApi
    .get(`applications/${applicationId}/organizations`, {
      searchParams,
    })
    .json<OrganizationWithRoles[]>();
};
