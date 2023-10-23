import { MfaFactor, type User, type UserMfaVerificationResponse } from '@logto/schemas';

export const transpileUserMfaVerifications = (
  mfaVerifications: User['mfaVerifications']
): UserMfaVerificationResponse => {
  return mfaVerifications.map((verification) => {
    const { id, createdAt, type } = verification;

    if (type === MfaFactor.BackupCode) {
      const { codes } = verification;

      return { id, createdAt, type, remainCodes: codes.filter((code) => !code.usedAt).length };
    }

    if (type === MfaFactor.WebAuthn) {
      const { agent } = verification;

      return { id, createdAt, type, agent };
    }

    return { id, createdAt, type };
  });
};
