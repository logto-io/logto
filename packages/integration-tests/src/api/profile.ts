import { type UserProfileResponse } from '@logto/schemas';
import { type KyInstance } from 'ky';

const verificationRecordIdHeader = 'logto-verification-id';

export const updatePassword = async (
  api: KyInstance,
  verificationRecordId: string,
  password: string
) =>
  api.post('api/profile/password', {
    json: { password },
    headers: { [verificationRecordIdHeader]: verificationRecordId },
  });

export const updatePrimaryEmail = async (
  api: KyInstance,
  email: string,
  verificationRecordId: string,
  newIdentifierVerificationRecordId: string
) =>
  api.post('api/profile/primary-email', {
    json: { email, newIdentifierVerificationRecordId },
    headers: { [verificationRecordIdHeader]: verificationRecordId },
  });

export const deletePrimaryEmail = async (api: KyInstance, verificationRecordId: string) =>
  api.delete('api/profile/primary-email', {
    headers: { [verificationRecordIdHeader]: verificationRecordId },
  });

export const updatePrimaryPhone = async (
  api: KyInstance,
  phone: string,
  verificationRecordId: string,
  newIdentifierVerificationRecordId: string
) =>
  api.post('api/profile/primary-phone', {
    json: { phone, newIdentifierVerificationRecordId },
    headers: { [verificationRecordIdHeader]: verificationRecordId },
  });

export const deletePrimaryPhone = async (api: KyInstance, verificationRecordId: string) =>
  api.delete('api/profile/primary-phone', {
    headers: { [verificationRecordIdHeader]: verificationRecordId },
  });

export const updateIdentities = async (
  api: KyInstance,
  verificationRecordId: string,
  newIdentifierVerificationRecordId: string
) =>
  api.post('api/profile/identities', {
    json: { newIdentifierVerificationRecordId },
    headers: { [verificationRecordIdHeader]: verificationRecordId },
  });

export const deleteIdentity = async (
  api: KyInstance,
  target: string,
  verificationRecordId: string
) =>
  api.delete(`api/profile/identities/${target}`, {
    headers: { [verificationRecordIdHeader]: verificationRecordId },
  });

export const updateUser = async (api: KyInstance, body: Record<string, unknown>) =>
  api.patch('api/profile', { json: body }).json<Partial<UserProfileResponse>>();

export const updateOtherProfile = async (api: KyInstance, body: Record<string, unknown>) =>
  api.patch('api/profile/profile', { json: body }).json<Partial<UserProfileResponse['profile']>>();

export const getUserInfo = async (api: KyInstance) =>
  api.get('api/profile').json<Partial<UserProfileResponse>>();
