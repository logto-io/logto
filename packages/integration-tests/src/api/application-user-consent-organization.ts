import { type Organization } from '@logto/schemas';

import { authedAdminApi } from './api.js';

export const postApplicationUserConsentOrganization = async (
  applicationId: string,
  userId: string,
  payload: {
    organizationIds: string[];
  }
) =>
  authedAdminApi.post(`applications/${applicationId}/users/${userId}/consent-organizations`, {
    json: payload,
  });

export const putApplicationUserConsentOrganization = async (
  applicationId: string,
  userId: string,
  payload: {
    organizationIds: string[];
  }
) =>
  authedAdminApi.put(`applications/${applicationId}/users/${userId}/consent-organizations`, {
    json: payload,
  });

export const getApplicationUserConsentOrganization = async (
  applicationId: string,
  userId: string
) =>
  authedAdminApi.get(`applications/${applicationId}/users/${userId}/consent-organizations`).json<{
    organizations: Organization[];
  }>();

export const deleteApplicationUserConsentOrganization = async (
  applicationId: string,
  userId: string,
  organizationId: string
) =>
  authedAdminApi.delete(
    `applications/${applicationId}/users/${userId}/consent-organizations/${organizationId}`
  );
