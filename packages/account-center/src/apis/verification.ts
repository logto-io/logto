import ky from 'ky';

export const verifyPassword = async (password: string) => {
  return ky.post('/api/verifications/password', { json: { password } }).json<{
    verificationRecordId: string;
    expiresAt: string;
  }>();
};
