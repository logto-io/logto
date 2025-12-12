import { type UserMfaVerificationResponse, MfaFactor } from '@logto/schemas';

import { verificationRecordIdHeader } from './account';
import { createAuthenticatedKy } from './base-ky';

export type TotpSecretResponse = {
  secret: string;
};

export const getMfaVerifications = async (
  accessToken: string
): Promise<UserMfaVerificationResponse> => {
  return createAuthenticatedKy(accessToken)
    .get('/api/my-account/mfa-verifications')
    .json<UserMfaVerificationResponse>();
};

export const generateTotpSecret = async (accessToken: string): Promise<TotpSecretResponse> => {
  return createAuthenticatedKy(accessToken)
    .post('/api/my-account/mfa-verifications/totp-secret/generate')
    .json<TotpSecretResponse>();
};

export const addTotpMfa = async (
  accessToken: string,
  verificationRecordId: string,
  payload: { secret: string; code?: string }
) => {
  await createAuthenticatedKy(accessToken).post('/api/my-account/mfa-verifications', {
    json: { type: MfaFactor.TOTP, ...payload },
    headers: { [verificationRecordIdHeader]: verificationRecordId },
  });
};
