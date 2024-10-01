import { type UserProfileResponse } from '@logto/schemas';
import { type KyInstance } from 'ky';

export const updatePassword = async (
  api: KyInstance,
  verificationRecordId: string,
  password: string
) => api.post('api/profile/password', { json: { password, verificationRecordId } });

export const updateUser = async (api: KyInstance, body: Record<string, unknown>) =>
  api.patch('api/profile', { json: body }).json<Partial<UserProfileResponse>>();

export const getUserInfo = async (api: KyInstance) =>
  api.get('api/profile').json<Partial<UserProfileResponse>>();
