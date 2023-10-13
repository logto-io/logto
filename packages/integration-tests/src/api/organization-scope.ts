import { type OrganizationScope } from '@logto/schemas';

import { authedAdminApi } from './api.js';

export const createOrganizationScope = async (name: string, description?: string) => {
  return authedAdminApi
    .post('organization-scopes', {
      json: {
        name,
        description,
      },
    })
    .json<OrganizationScope>();
};

export const getOrganizationScopes = async (params?: URLSearchParams) => {
  return authedAdminApi
    .get('organization-scopes?' + (params?.toString() ?? ''))
    .json<OrganizationScope[]>();
};

export const getOrganizationScope = async (id: string) => {
  return authedAdminApi.get('organization-scopes/' + id).json<OrganizationScope>();
};

export const updateOrganizationScope = async (id: string, name: string, description?: string) => {
  return authedAdminApi
    .patch('organization-scopes/' + id, {
      json: {
        name,
        description,
      },
    })
    .json<OrganizationScope>();
};

export const deleteOrganizationScope = async (id: string) => {
  return authedAdminApi.delete('organization-scopes/' + id);
};
