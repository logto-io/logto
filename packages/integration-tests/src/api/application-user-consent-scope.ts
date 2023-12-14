import { type UserScope } from '@logto/core-kit';

import { authedAdminApi } from './api.js';

export const assignUserConsentScopes = async (
  applicationId: string,
  payload: {
    organizationScopes?: string[];
    resourceScopes?: string[];
    userScopes?: UserScope[];
  }
) => authedAdminApi.post(`applications/${applicationId}/user-consent-scopes`, { json: payload });
