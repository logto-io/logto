import { type Organization } from '@logto/schemas';

import { authedAdminApi } from './api.js';

export const createOrganization = async (name: string, description?: string) => {
  return authedAdminApi
    .post('organizations', {
      json: {
        name,
        description,
      },
    })
    .json<Organization>();
};

export const getOrganizations = async (params?: URLSearchParams) => {
  return authedAdminApi.get('organizations?' + (params?.toString() ?? '')).json<Organization[]>();
};

export const getOrganization = async (id: string) => {
  return authedAdminApi.get('organizations/' + id).json<Organization>();
};

export const updateOrganization = async (id: string, name: string, description?: string) => {
  return authedAdminApi
    .patch('organizations/' + id, {
      json: {
        name,
        description,
      },
    })
    .json<Organization>();
};

export const deleteOrganization = async (id: string) => {
  return authedAdminApi.delete('organizations/' + id);
};
