import { type UserScope } from '@logto/core-kit';
import {
  type ApplicationUserConsentScopesResponse,
  type ApplicationUserConsentScopeType,
} from '@logto/schemas';

import { authedAdminApi } from './api.js';

export const getCimdUserConsentScopes = async () =>
  authedAdminApi.get('cimd/user-consent-scopes').json<ApplicationUserConsentScopesResponse>();

export const assignCimdUserConsentScopes = async (payload: {
  organizationScopes?: string[];
  resourceScopes?: string[];
  organizationResourceScopes?: string[];
  userScopes?: UserScope[];
}) => authedAdminApi.post('cimd/user-consent-scopes', { json: payload });

export const deleteCimdUserConsentScope = async (
  scopeType: ApplicationUserConsentScopeType,
  scopeId: string
) => authedAdminApi.delete(`cimd/user-consent-scopes/${scopeType}/${scopeId}`);
