import * as s from 'superstruct';

const storagePrefix = 'logto:account-center:';
const pendingReturnTtl = 10 * 60 * 1000;
const routeRestoreTtl = 10 * 60 * 1000;

const storageKeys = Object.freeze({
  routeRestore: `${storagePrefix}route-restore`,
  showSuccess: `${storagePrefix}show-success`,
  uiLocales: `${storagePrefix}ui-locales`,
  identifier: `${storagePrefix}identifier`,
  verificationRecord: `${storagePrefix}verification-record`,
  socialFlow: `${storagePrefix}social-verification`,
  pendingReturn: `${storagePrefix}pending-return`,
  sessionVerified: `${storagePrefix}session-verified`,
});

export type StoredVerificationRecord = {
  verificationId: string;
  expiresAt: string;
};

type StoredPathState = {
  path: string;
  createdAt: number;
};

export type StoredSocialFlowRecord =
  | {
      status: 'pending';
      verificationRecordId: string;
      expiresAt: string;
      state: string;
    }
  | {
      status: 'verified';
      verificationRecordId: string;
      expiresAt: string;
    };

const storedVerificationRecordGuard = s.object({
  verificationId: s.string(),
  expiresAt: s.string(),
});

const storedPathStateGuard = s.object({
  path: s.string(),
  createdAt: s.number(),
});

const storedSocialFlowRecordGuard = s.union([
  s.object({
    status: s.literal('pending'),
    verificationRecordId: s.string(),
    expiresAt: s.string(),
    state: s.string(),
  }),
  s.object({
    status: s.literal('verified'),
    verificationRecordId: s.string(),
    expiresAt: s.string(),
  }),
]);

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
  guard: s.Struct<T>,
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

const isWithinTtl = (createdAt: number, ttl: number) => {
  return Number.isFinite(createdAt) && createdAt > Date.now() - ttl;
};

const createTtlPathStorage = (key: string, ttl: number) => ({
  get: (): string | undefined => {
    const record = getStructuredValue(key, storedPathStateGuard, 'session');

    if (!record || !isWithinTtl(record.createdAt, ttl)) {
      removeItem(key, 'session');
      return;
    }

    return record.path;
  },
  set: (path: string) => {
    setStructuredValue(key, { path, createdAt: Date.now() }, 'session');
  },
  clear: () => {
    removeItem(key, 'session');
  },
});

export const accountStorage = Object.freeze({
  /** Saves the in-app route before sign-in; restored after OIDC callback. TTL: 10min. */
  routeRestore: createTtlPathStorage(storageKeys.routeRestore, routeRestoreTtl),
  /** Saves the return URL for multi-step flows (password, social linking); used after completion. TTL: 10min. */
  pendingReturn: createTtlPathStorage(storageKeys.pendingReturn, pendingReturnTtl),
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
  socialFlow: {
    get: (connectorId: string): StoredSocialFlowRecord | undefined => {
      const record = getStructuredValue(
        `${storageKeys.socialFlow}:${connectorId}`,
        storedSocialFlowRecordGuard,
        'session'
      );

      if (!record || !isNotExpired(record.expiresAt)) {
        removeItem(`${storageKeys.socialFlow}:${connectorId}`, 'session');
        return;
      }

      return record;
    },
    setPending: (
      connectorId: string,
      record: Omit<Extract<StoredSocialFlowRecord, { status: 'pending' }>, 'status'>
    ) => {
      setStructuredValue(
        `${storageKeys.socialFlow}:${connectorId}`,
        { ...record, status: 'pending' } satisfies StoredSocialFlowRecord,
        'session'
      );
    },
    setVerified: (
      connectorId: string,
      record: Omit<Extract<StoredSocialFlowRecord, { status: 'verified' }>, 'status'>
    ) => {
      setStructuredValue(
        `${storageKeys.socialFlow}:${connectorId}`,
        { ...record, status: 'verified' } satisfies StoredSocialFlowRecord,
        'session'
      );
    },
    clear: (connectorId: string) => {
      removeItem(`${storageKeys.socialFlow}:${connectorId}`, 'session');
    },
  },
  /**
   * One-time flag set by Callback.tsx after a successful OIDC callback.
   * App.tsx consumes (reads and removes) it on the next page load to decide
   * whether to clear cached tokens and force a fresh OIDC flow.
   * This prevents infinite redirect loops while ensuring stale tokens from
   * a previous user are always cleared on initial navigation.
   */
  sessionVerified: {
    /** Consume the flag: returns `true` if it was set, and removes it. */
    consume: (): boolean => {
      const value = getString(storageKeys.sessionVerified, 'session') === 'true';

      if (value) {
        removeItem(storageKeys.sessionVerified, 'session');
      }

      return value;
    },
    set: () => {
      setString(storageKeys.sessionVerified, 'true', 'session');
    },
  },
});

export const sessionStorage = Object.freeze({
  getRouteRestore: accountStorage.routeRestore.get,
  setRouteRestore: accountStorage.routeRestore.set,
  clearRouteRestore: accountStorage.routeRestore.clear,
  getPendingReturn: accountStorage.pendingReturn.get,
  setPendingReturn: accountStorage.pendingReturn.set,
  clearPendingReturn: accountStorage.pendingReturn.clear,
  getShowSuccess: accountStorage.showSuccess.get,
  setShowSuccess: accountStorage.showSuccess.set,
  clearShowSuccess: accountStorage.showSuccess.clear,
  getUiLocales: accountStorage.uiLocales.get,
  setUiLocales: accountStorage.uiLocales.set,
  clearUiLocales: accountStorage.uiLocales.clear,
  getIdentifier: () => getString(storageKeys.identifier, 'session'),
  setIdentifier: (value: string) => {
    setString(storageKeys.identifier, value, 'session');
  },
  clearIdentifier: () => {
    removeItem(storageKeys.identifier, 'session');
  },
});
