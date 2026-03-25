import { accountStorage } from '@ac/utils/session-storage';

export const getStoredVerificationId = () => {
  return accountStorage.verificationRecord.get()?.verificationId;
};

export const persistVerificationRecord = ({
  verificationId,
  expiresAt,
}: {
  verificationId: string;
  expiresAt: string;
}) => {
  accountStorage.verificationRecord.set({ verificationId, expiresAt });
};

export const clearVerificationRecord = () => {
  accountStorage.verificationRecord.clear();
};
