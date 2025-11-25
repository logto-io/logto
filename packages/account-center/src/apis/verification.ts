import { createAuthenticatedKy } from './base-ky';

export const verifyPassword = async (accessToken: string, password: string) => {
  return createAuthenticatedKy(accessToken)
    .post('/api/verifications/password', {
      json: { password },
    })
    .json<{
      verificationRecordId: string;
      expiresAt: string;
    }>();
};
