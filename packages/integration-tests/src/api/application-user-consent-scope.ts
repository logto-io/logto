import { type UserScope } from '@logto/core-kit';
import {
  type ApplicationUserConsentScopeType,
  type ApplicationUserConsentScopesResponse,
} from '@logto/schemas';

import { authedAdminApi } from './api.js';

export const assignUserConsentScopes = async (
  applicationId: string,
  payload: {
    organizationScopes?: string[];
    resourceScopes?: string[];
    organizationResourceScopes?: string[];
    userScopes?: UserScope[];
  }
) => authedAdminApi.post(`applications/${applicationId}/user-consent-scopes`, { json: payload });

export const getUserConsentScopes = async (applicationId: string) =>
  authedAdminApi
    .get(`applications/${applicationId}/user-consent-scopes`)
    .json<ApplicationUserConsentScopesResponse>();

export const deleteUserConsentScopes = async (
  applicationId: string,
  scopeType: ApplicationUserConsentScopeType,
  scopeId: string
) =>
  authedAdminApi.delete(
    `applications/${applicationId}/user-consent-scopes/${scopeType}/${scopeId}`
  );
