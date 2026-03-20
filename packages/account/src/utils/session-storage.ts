import * as s from 'superstruct';

const storagePrefix = 'logto:account-center:';

const storageKeys = Object.freeze({
  route: `${storagePrefix}route-cache`,
  redirectUrl: `${storagePrefix}redirect-url`,
  showSuccess: `${storagePrefix}show-success`,
  uiLocales: `${storagePrefix}ui-locales`,
  verificationRecord: `${storagePrefix}verification-record`,
  socialVerification: `${storagePrefix}social-verification`,
});

export type StoredVerificationRecord = {
  verificationId: string;
  expiresAt: string;
};

export type StoredSocialVerificationRecord = {
  verificationRecordId: string;
  expiresAt: string;
  state?: string;
  isVerified?: boolean;
};

const storedVerificationRecordGuard: s.Describe<StoredVerificationRecord> = s.object({
  verificationId: s.string(),
  expiresAt: s.string(),
});

const storedSocialVerificationRecordGuard: s.Describe<StoredSocialVerificationRecord> = s.object({
  verificationRecordId: s.string(),
  expiresAt: s.string(),
  state: s.optional(s.string()),
  isVerified: s.optional(s.boolean()),
});

const getStorage = (type: 'session' | 'local'): Storage | undefined => {
  if (typeof window === 'undefined') {
    return;
  }

  return type === 'session' ? window.sessionStorage : window.localStorage;
};

const getString = (key: string, type: 'session' | 'local'): string | undefined => {
  return getStorage(type)?.getItem(key) ?? undefined;
};

const setString = (key: string, value: string, type: 'session' | 'local') => {
  getStorage(type)?.setItem(key, value);
};

const removeItem = (key: string, type: 'session' | 'local') => {
  getStorage(type)?.removeItem(key);
};

const getStructuredValue = <T>(
  key: string,
  guard: s.Describe<T>,
  type: 'session' | 'local'
): T | undefined => {
  const raw = getString(key, type);

  if (!raw) {
    return;
  }

  try {
    const [, result] = s.validate(JSON.parse(raw), guard);

    if (!result) {
      removeItem(key, type);
      return;
    }

    return result;
  } catch {
    removeItem(key, type);
  }
};

const setStructuredValue = (key: string, value: unknown, type: 'session' | 'local') => {
  setString(key, JSON.stringify(value), type);
};

const isNotExpired = (expiresAt: string) => {
  const expiresAtTimestamp = new Date(expiresAt).getTime();

  return !Number.isNaN(expiresAtTimestamp) && expiresAtTimestamp > Date.now();
};

export const accountStorage = Object.freeze({
  route: {
    get: () => getString(storageKeys.route, 'session'),
    set: (value: string) => {
      setString(storageKeys.route, value, 'session');
    },
    clear: () => {
      removeItem(storageKeys.route, 'session');
    },
  },
  redirectUrl: {
    get: () => getString(storageKeys.redirectUrl, 'session'),
    set: (url: string): boolean => {
      try {
        const parsed = new URL(url);

        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          return false;
        }

        setString(storageKeys.redirectUrl, url, 'session');
        return true;
      } catch {
        return false;
      }
    },
    clear: () => {
      removeItem(storageKeys.redirectUrl, 'session');
    },
  },
  showSuccess: {
    get: () => getString(storageKeys.showSuccess, 'session') === 'true',
    set: (value: boolean) => {
      if (value) {
        setString(storageKeys.showSuccess, 'true', 'session');
        return;
      }

      removeItem(storageKeys.showSuccess, 'session');
    },
    clear: () => {
      removeItem(storageKeys.showSuccess, 'session');
    },
  },
  uiLocales: {
    get: () => getString(storageKeys.uiLocales, 'session'),
    set: (value: string) => {
      setString(storageKeys.uiLocales, value, 'session');
    },
    clear: () => {
      removeItem(storageKeys.uiLocales, 'session');
    },
  },
  verificationRecord: {
    get: (): StoredVerificationRecord | undefined => {
      const record = getStructuredValue(
        storageKeys.verificationRecord,
        storedVerificationRecordGuard,
        'local'
      );

      if (!record || !isNotExpired(record.expiresAt)) {
        removeItem(storageKeys.verificationRecord, 'local');
        return;
      }

      return record;
    },
    set: (record: StoredVerificationRecord) => {
      setStructuredValue(storageKeys.verificationRecord, record, 'local');
    },
    clear: () => {
      removeItem(storageKeys.verificationRecord, 'local');
    },
  },
  socialVerification: {
    get: (connectorId: string): StoredSocialVerificationRecord | undefined => {
      const record = getStructuredValue(
        `${storageKeys.socialVerification}:${connectorId}`,
        storedSocialVerificationRecordGuard,
        'session'
      );

      if (!record || !isNotExpired(record.expiresAt)) {
        removeItem(`${storageKeys.socialVerification}:${connectorId}`, 'session');
        return;
      }

      return record;
    },
    set: (connectorId: string, record: StoredSocialVerificationRecord) => {
      setStructuredValue(`${storageKeys.socialVerification}:${connectorId}`, record, 'session');
    },
    clear: (connectorId: string) => {
      removeItem(`${storageKeys.socialVerification}:${connectorId}`, 'session');
    },
  },
});

export const sessionStorage = Object.freeze({
  getRoute: accountStorage.route.get,
  setRoute: accountStorage.route.set,
  clearRoute: accountStorage.route.clear,
  getRedirectUrl: accountStorage.redirectUrl.get,
  setRedirectUrl: accountStorage.redirectUrl.set,
  clearRedirectUrl: accountStorage.redirectUrl.clear,
  getShowSuccess: accountStorage.showSuccess.get,
  setShowSuccess: accountStorage.showSuccess.set,
  clearShowSuccess: accountStorage.showSuccess.clear,
  getUiLocales: accountStorage.uiLocales.get,
  setUiLocales: accountStorage.uiLocales.set,
  clearUiLocales: accountStorage.uiLocales.clear,
});
