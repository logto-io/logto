import type {
  GetAccountUserSessionsResponse,
  GetUserApplicationGrantsResponse,
} from '@logto/schemas';

import { getVerificationRecordHeaders } from './account';
import { createAuthenticatedKy } from './base-ky';

export const getSessions = async (
  accessToken: string,
  verificationRecordId: string | undefined
): Promise<GetAccountUserSessionsResponse> => {
  return createAuthenticatedKy(accessToken)
    .get('/api/my-account/sessions', {
      headers: getVerificationRecordHeaders(verificationRecordId),
    })
    .json<GetAccountUserSessionsResponse>();
};

export const revokeSession = async (
  accessToken: string,
  verificationRecordId: string | undefined,
  sessionId: string
): Promise<void> => {
  await createAuthenticatedKy(accessToken).delete(`/api/my-account/sessions/${sessionId}`, {
    headers: getVerificationRecordHeaders(verificationRecordId),
    searchParams: { revokeGrantsTarget: 'all' },
  });
};

export const getGrants = async (
  accessToken: string,
  verificationRecordId: string | undefined
): Promise<GetUserApplicationGrantsResponse> => {
  return createAuthenticatedKy(accessToken)
    .get('/api/my-account/grants', {
      headers: getVerificationRecordHeaders(verificationRecordId),
      searchParams: { appType: 'thirdParty' },
    })
    .json<GetUserApplicationGrantsResponse>();
};

export const revokeGrant = async (
  accessToken: string,
  verificationRecordId: string | undefined,
  grantId: string
): Promise<void> => {
  await createAuthenticatedKy(accessToken).delete(`/api/my-account/grants/${grantId}`, {
    headers: getVerificationRecordHeaders(verificationRecordId),
  });
};
