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

export const updateUser = async (api: KyInstance, body: Record<string, string>) =>
  api.patch('api/profile', { json: body }).json<{
    name?: string;
    avatar?: string;
    username?: string;
  }>();

export const getUserInfo = async (api: KyInstance) =>
  api.get('api/profile').json<Partial<UserProfileResponse>>();
