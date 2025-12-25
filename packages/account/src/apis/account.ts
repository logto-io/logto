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

export const updatePrimaryPhone = async (
  accessToken: string,
  verificationRecordId: string,
  payload: { phone: string; newIdentifierVerificationRecordId: string }
) => {
  await createAuthenticatedKy(accessToken).post('/api/my-account/primary-phone', {
    json: payload,
    headers: { [verificationRecordIdHeader]: verificationRecordId },
  });
};

export const updateUsername = async (
  accessToken: string,
  verificationRecordId: string,
  payload: { username: string }
) => {
  await createAuthenticatedKy(accessToken).patch('/api/my-account', {
    json: payload,
    headers: { [verificationRecordIdHeader]: verificationRecordId },
  });
};

export const updatePassword = async (
  accessToken: string,
  verificationRecordId: string,
  payload: { password: string }
) => {
  await createAuthenticatedKy(accessToken).post('/api/my-account/password', {
    json: payload,
    headers: { [verificationRecordIdHeader]: verificationRecordId },
  });
};
