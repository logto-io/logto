import * as s from 'superstruct';

const verificationRecordStorageKey = 'logto:account-center:verification-record';

export type StoredVerificationRecord = {
  verificationId: string;
  expiresAt: string;
};

const storedVerificationRecordGuard: s.Describe<StoredVerificationRecord> = s.object({
  verificationId: s.string(),
  expiresAt: s.string(),
});

const getStoredVerificationRecord = (): StoredVerificationRecord | undefined => {
  if (typeof window === 'undefined') {
    return;
  }

  const raw = window.localStorage.getItem(verificationRecordStorageKey);

  if (!raw) {
    return;
  }

  const [, record] = s.validate(JSON.parse(raw), storedVerificationRecordGuard);

  if (!record) {
    window.localStorage.removeItem(verificationRecordStorageKey);
    return;
  }

  return record;
};

export const getStoredVerificationId = () => {
  const record = getStoredVerificationRecord();

  if (!record) {
    return;
  }

  const expiresAt = new Date(record.expiresAt).getTime();

  if (Number.isNaN(expiresAt) || expiresAt <= Date.now()) {
    window.localStorage.removeItem(verificationRecordStorageKey);
    return;
  }

  return record.verificationId;
};

export const persistVerificationRecord = ({
  verificationId,
  expiresAt,
}: StoredVerificationRecord) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    verificationRecordStorageKey,
    JSON.stringify({ verificationId, expiresAt })
  );
};

export const clearVerificationRecord = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(verificationRecordStorageKey);
};
