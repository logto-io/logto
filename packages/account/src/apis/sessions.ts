import type {
  GetAccountUserSessionsResponse,
  GetUserApplicationGrantsResponse,
} from '@logto/schemas';

import { createAuthenticatedKy } from './base-ky';

export const getSessions = async (accessToken: string): Promise<GetAccountUserSessionsResponse> => {
  return createAuthenticatedKy(accessToken)
    .get('/api/my-account/sessions')
    .json<GetAccountUserSessionsResponse>();
};

export const revokeSession = async (accessToken: string, sessionId: string): Promise<void> => {
  await createAuthenticatedKy(accessToken).delete(`/api/my-account/sessions/${sessionId}`, {
    searchParams: { revokeGrantsTarget: 'all' },
  });
};

export const getGrants = async (accessToken: string): Promise<GetUserApplicationGrantsResponse> => {
  return createAuthenticatedKy(accessToken)
    .get('/api/my-account/grants', {
      searchParams: { appType: 'thirdParty' },
    })
    .json<GetUserApplicationGrantsResponse>();
};

export const revokeGrant = async (accessToken: string, grantId: string): Promise<void> => {
  await createAuthenticatedKy(accessToken).delete(`/api/my-account/grants/${grantId}`);
};
