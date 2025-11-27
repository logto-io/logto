import { createAuthenticatedKy } from './base-ky';

export const verificationRecordIdHeader = 'logto-verification-id';

export const updatePrimaryEmail = async (
  accessToken: string,
  verificationRecordId: string,
  payload: { email: string; newIdentifierVerificationRecordId: string }
) => {
  await createAuthenticatedKy(accessToken).post('/api/my-account/primary-email', {
    json: payload,
    headers: { [verificationRecordIdHeader]: verificationRecordId },
  });
};
