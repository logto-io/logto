import type { GetAccountUserSessionsResponse } from '@logto/schemas';

import { verificationRecordIdHeader } from './account';
import { createAuthenticatedKy } from './base-ky';

export const getSessions = async (
  accessToken: string,
  verificationRecordId: string
): Promise<GetAccountUserSessionsResponse> => {
  return createAuthenticatedKy(accessToken)
    .get('/api/my-account/sessions', {
      headers: { [verificationRecordIdHeader]: verificationRecordId },
    })
    .json<GetAccountUserSessionsResponse>();
};

export const revokeSession = async (
  accessToken: string,
  verificationRecordId: string,
  sessionId: string
): Promise<void> => {
  await createAuthenticatedKy(accessToken).delete(`/api/my-account/sessions/${sessionId}`, {
    headers: { [verificationRecordIdHeader]: verificationRecordId },
    searchParams: { revokeGrantsTarget: 'all' },
  });
};
