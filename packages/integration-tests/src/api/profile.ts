import { type UserProfileResponse } from '@logto/schemas';
import { type KyInstance } from 'ky';

export const updatePassword = async (
  api: KyInstance,
  verificationRecordId: string,
  password: string
) => api.post('api/profile/password', { json: { password, verificationRecordId } });

export const updatePrimaryEmail = async (
  api: KyInstance,
  email: string,
  verificationRecordId: string,
  newIdentifierVerificationRecordId: string
) =>
  api.post('api/profile/primary-email', {
    json: { email, verificationRecordId, newIdentifierVerificationRecordId },
  });

export const updatePrimaryPhone = async (
  api: KyInstance,
  phone: string,
  verificationRecordId: string,
  newIdentifierVerificationRecordId: string
) =>
  api.post('api/profile/primary-phone', {
    json: { phone, verificationRecordId, newIdentifierVerificationRecordId },
  });

export const updateIdentities = async (
  api: KyInstance,
  verificationRecordId: string,
  newIdentifierVerificationRecordId: string
) =>
  api.post('api/profile/identities', {
    json: { verificationRecordId, newIdentifierVerificationRecordId },
  });

export const deleteIdentity = async (
  api: KyInstance,
  target: string,
  verificationRecordId: string
) =>
  api.delete(`api/profile/identities/${target}`, {
    searchParams: { verificationRecordId },
  });

export const updateUser = async (api: KyInstance, body: Record<string, unknown>) =>
  api.patch('api/profile', { json: body }).json<Partial<UserProfileResponse>>();

export const updateOtherProfile = async (api: KyInstance, body: Record<string, unknown>) =>
  api.patch('api/profile/profile', { json: body }).json<Partial<UserProfileResponse['profile']>>();

export const getUserInfo = async (api: KyInstance) =>
  api.get('api/profile').json<Partial<UserProfileResponse>>();
