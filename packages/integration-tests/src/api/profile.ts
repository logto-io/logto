import { type UserInfoResponse } from '@logto/js';
import { type KyInstance } from 'ky';

export const updatePassword = async (
  api: KyInstance,
  verificationRecordId: string,
  password: string
) => api.post('api/profile/password', { json: { password, verificationRecordId } });

export const updateUser = async (api: KyInstance, body: Record<string, string>) =>
  api.patch('api/profile', { json: body }).json<{
    name?: string;
    avatar?: string;
    username?: string;
  }>();

export const getUserInfo = async (api: KyInstance) => api.get('oidc/me').json<UserInfoResponse>();
