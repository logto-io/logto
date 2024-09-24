import { type KyInstance } from 'ky';

export const updatePassword = async (
  api: KyInstance,
  verificationRecordId: string,
  password: string
) => api.post('profile/password', { json: { password, verificationRecordId } });
