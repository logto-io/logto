/* eslint-disable max-lines -- Account Center session and local storage helpers share the same schema guards. */
import * as s from 'superstruct';

const storagePrefix = 'logto:account-center:';
const pendingReturnTtl = 10 * 60 * 1000;
const routeRestoreTtl = 10 * 60 * 1000;
/** A step-up left unfinished for longer than this is treated as abandoned. */
const pendingStepUpTtl = 10 * 60 * 1000;

const storageKeys = Object.freeze({
  routeRestore: `${storagePrefix}route-restore`,
  showSuccess: `${storagePrefix}show-success`,
  uiLocales: `${storagePrefix}ui-locales`,
  identifier: `${storagePrefix}identifier`,
  verificationRecord: `${storagePrefix}verification-record`,
  socialFlow: `${storagePrefix}social-verification`,
  pendingReturn: `${storagePrefix}pending-return`,
  pendingVerifiedAction: `${storagePrefix}pending-verified-action`,
  pendingStepUp: `${storagePrefix}pending-step-up`,
  pendingSocialRemoveConnectorId: `${storagePrefix}pending-social-remove-connector-id`,
  pendingPersonalAccessTokenCreate: `${storagePrefix}pending-personal-access-token-create`,
  pendingPersonalAccessTokenRename: `${storagePrefix}pending-personal-access-token-rename`,
  pendingPersonalAccessTokenRevokeName: `${storagePrefix}pending-personal-access-token-revoke-name`,
});

export type StoredVerificationRecord = {
  verificationId: string;
  expiresAt: string;
};

export type StoredPendingPersonalAccessTokenCreate = {
  name: string;
  expiryDays: number;
};

export type StoredPendingPersonalAccessTokenRename = {
  currentName: string;
  name: string;
};

const pendingStepUpActionsWithoutInput = Object.freeze([
  'enable-mfa',
  'disable-mfa',
  'enable-passkey-prompt',
  'disable-passkey-prompt',
  'remove-username',
  'remove-email',
  'remove-phone',
  'load-sessions',
  'load-trusted-devices',
] as const);

type PendingStepUpActionWithoutInput = (typeof pendingStepUpActionsWithoutInput)[number];

/**
 * A sensitive Account Center action that is waiting for an OIDC step-up. It carries only the input
 * needed to run the action again: never a credential, a one-time code, a WebAuthn payload, or a
 * token.
 */
export type PendingStepUpAction =
  | { [Type in PendingStepUpActionWithoutInput]: { type: Type } }[PendingStepUpActionWithoutInput]
  | { type: 'remove-social'; connectorId: string }
  | { type: 'create-personal-access-token'; name: string; expiryDays: number }
  | { type: 'rename-personal-access-token'; currentName: string; name: string }
  | { type: 'revoke-personal-access-token'; name: string }
  | { type: 'revoke-session'; sessionId: string }
  | { type: 'revoke-grant'; applicationId: string; grantIds: string[] }
  | { type: 'remove-trusted-device'; trustedDeviceId: string }
  | { type: 'update-username'; username: string }
  | { type: 'rename-passkey'; id: string; name: string }
  | { type: 'delete-passkey'; id: string };

/**
 * - `authorizing`: Account Center redirected to the authorization endpoint for the step-up.
 * - `authorized`: the callback exchanged the code, and the elevated token set replaced the old one.
 * - `resumable`: the page that loaded after the callback may run the action, once.
 */
export type PendingStepUpPhase = 'authorizing' | 'authorized' | 'resumable';

export type StoredPendingStepUp = {
  action: PendingStepUpAction;
  /** The Account Center pathname to return to, including the base path. */
  route: string;
  phase: PendingStepUpPhase;
  createdAt: number;
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
      mode: 'add' | 'change';
    }
  | {
      status: 'verified';
      verificationRecordId: string;
      expiresAt: string;
      mode: 'add' | 'change';
    };

type StoredSocialFlowRecordData =
  | {
      status: 'pending';
      verificationRecordId: string;
      expiresAt: string;
      state: string;
      mode?: 'add' | 'change';
    }
  | {
      status: 'verified';
      verificationRecordId: string;
      expiresAt: string;
      mode?: 'add' | 'change';
    };

const storedVerificationRecordGuard = s.object({
  verificationId: s.string(),
  expiresAt: s.string(),
});

const storedPathStateGuard = s.object({
  path: s.string(),
  createdAt: s.number(),
});

const storedPendingPersonalAccessTokenCreateGuard = s.object({
  name: s.string(),
  expiryDays: s.number(),
});

const storedPendingPersonalAccessTokenRenameGuard = s.object({
  currentName: s.string(),
  name: s.string(),
});

const storedSocialFlowRecordGuard = s.union([
  s.object({
    status: s.literal('pending'),
    verificationRecordId: s.string(),
    expiresAt: s.string(),
    state: s.string(),
    mode: s.optional(s.union([s.literal('add'), s.literal('change')])),
  }),
  s.object({
    status: s.literal('verified'),
    verificationRecordId: s.string(),
    expiresAt: s.string(),
    mode: s.optional(s.union([s.literal('add'), s.literal('change')])),
  }),
]);

const pendingStepUpActionGuard = s.union([
  s.object({ type: s.enums(pendingStepUpActionsWithoutInput) }),
  s.object({ type: s.literal('remove-social'), connectorId: s.string() }),
  s.object({
    type: s.literal('create-personal-access-token'),
    name: s.string(),
    expiryDays: s.number(),
  }),
  s.object({
    type: s.literal('rename-personal-access-token'),
    currentName: s.string(),
    name: s.string(),
  }),
  s.object({ type: s.literal('revoke-personal-access-token'), name: s.string() }),
  s.object({ type: s.literal('revoke-session'), sessionId: s.string() }),
  s.object({
    type: s.literal('revoke-grant'),
    applicationId: s.string(),
    grantIds: s.array(s.string()),
  }),
  s.object({ type: s.literal('remove-trusted-device'), trustedDeviceId: s.string() }),
  s.object({ type: s.literal('update-username'), username: s.string() }),
  s.object({ type: s.literal('rename-passkey'), id: s.string(), name: s.string() }),
  s.object({ type: s.literal('delete-passkey'), id: s.string() }),
]);

const storedPendingStepUpGuard = s.object({
  action: pendingStepUpActionGuard,
  route: s.string(),
  phase: s.enums(['authorizing', 'authorized', 'resumable']),
  createdAt: s.number(),
});

const pendingVerifiedActions = Object.freeze([
  'enable-mfa',
  'disable-mfa',
  'enable-passkey-prompt',
  'disable-passkey-prompt',
  'remove-username',
  'remove-email',
  'remove-phone',
  'remove-social',
  'load-sessions',
  'load-trusted-devices',
  'create-personal-access-token',
  'rename-personal-access-token',
  'revoke-personal-access-token',
] as const);

export type PendingVerifiedAction = (typeof pendingVerifiedActions)[number];

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
      const record = getStructuredValue<StoredSocialFlowRecordData>(
        `${storageKeys.socialFlow}:${connectorId}`,
        storedSocialFlowRecordGuard,
        'session'
      );

      if (!record || !isNotExpired(record.expiresAt)) {
        removeItem(`${storageKeys.socialFlow}:${connectorId}`, 'session');
        return;
      }

      return { ...record, mode: record.mode ?? 'add' };
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
  pendingVerifiedAction: {
    get: (): PendingVerifiedAction | undefined => {
      const value = getString(storageKeys.pendingVerifiedAction, 'session');
      return pendingVerifiedActions.find((action) => action === value);
    },
    set: (value: PendingVerifiedAction) => {
      setString(storageKeys.pendingVerifiedAction, value, 'session');
    },
    clear: () => {
      removeItem(storageKeys.pendingVerifiedAction, 'session');
    },
  },
  /** The action waiting for an OIDC step-up; see `utils/step-up.ts`. TTL: 10min. */
  pendingStepUp: {
    get: (): StoredPendingStepUp | undefined => {
      const record = getStructuredValue(
        storageKeys.pendingStepUp,
        storedPendingStepUpGuard,
        'session'
      );

      if (!record || !isWithinTtl(record.createdAt, pendingStepUpTtl)) {
        removeItem(storageKeys.pendingStepUp, 'session');
        return;
      }

      return record;
    },
    set: (record: StoredPendingStepUp) => {
      setStructuredValue(storageKeys.pendingStepUp, record, 'session');
    },
    clear: () => {
      removeItem(storageKeys.pendingStepUp, 'session');
    },
  },
  pendingSocialRemoveConnectorId: {
    get: (): string | undefined => getString(storageKeys.pendingSocialRemoveConnectorId, 'session'),
    set: (connectorId: string) => {
      setString(storageKeys.pendingSocialRemoveConnectorId, connectorId, 'session');
    },
    clear: () => {
      removeItem(storageKeys.pendingSocialRemoveConnectorId, 'session');
    },
  },
  pendingPersonalAccessTokenCreate: {
    get: (): StoredPendingPersonalAccessTokenCreate | undefined =>
      getStructuredValue(
        storageKeys.pendingPersonalAccessTokenCreate,
        storedPendingPersonalAccessTokenCreateGuard,
        'session'
      ),
    set: (payload: StoredPendingPersonalAccessTokenCreate) => {
      setStructuredValue(storageKeys.pendingPersonalAccessTokenCreate, payload, 'session');
    },
    clear: () => {
      removeItem(storageKeys.pendingPersonalAccessTokenCreate, 'session');
    },
  },
  pendingPersonalAccessTokenRename: {
    get: (): StoredPendingPersonalAccessTokenRename | undefined =>
      getStructuredValue(
        storageKeys.pendingPersonalAccessTokenRename,
        storedPendingPersonalAccessTokenRenameGuard,
        'session'
      ),
    set: (payload: StoredPendingPersonalAccessTokenRename) => {
      setStructuredValue(storageKeys.pendingPersonalAccessTokenRename, payload, 'session');
    },
    clear: () => {
      removeItem(storageKeys.pendingPersonalAccessTokenRename, 'session');
    },
  },
  pendingPersonalAccessTokenRevokeName: {
    get: (): string | undefined =>
      getString(storageKeys.pendingPersonalAccessTokenRevokeName, 'session'),
    set: (name: string) => {
      setString(storageKeys.pendingPersonalAccessTokenRevokeName, name, 'session');
    },
    clear: () => {
      removeItem(storageKeys.pendingPersonalAccessTokenRevokeName, 'session');
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
  getPendingVerifiedAction: accountStorage.pendingVerifiedAction.get,
  setPendingVerifiedAction: accountStorage.pendingVerifiedAction.set,
  clearPendingVerifiedAction: accountStorage.pendingVerifiedAction.clear,
  getPendingSocialRemoveConnectorId: accountStorage.pendingSocialRemoveConnectorId.get,
  setPendingSocialRemoveConnectorId: accountStorage.pendingSocialRemoveConnectorId.set,
  clearPendingSocialRemoveConnectorId: accountStorage.pendingSocialRemoveConnectorId.clear,
  getPendingPersonalAccessTokenCreate: accountStorage.pendingPersonalAccessTokenCreate.get,
  setPendingPersonalAccessTokenCreate: accountStorage.pendingPersonalAccessTokenCreate.set,
  clearPendingPersonalAccessTokenCreate: accountStorage.pendingPersonalAccessTokenCreate.clear,
  getPendingPersonalAccessTokenRename: accountStorage.pendingPersonalAccessTokenRename.get,
  setPendingPersonalAccessTokenRename: accountStorage.pendingPersonalAccessTokenRename.set,
  clearPendingPersonalAccessTokenRename: accountStorage.pendingPersonalAccessTokenRename.clear,
  getPendingPersonalAccessTokenRevokeName: accountStorage.pendingPersonalAccessTokenRevokeName.get,
  setPendingPersonalAccessTokenRevokeName: accountStorage.pendingPersonalAccessTokenRevokeName.set,
  clearPendingPersonalAccessTokenRevokeName:
    accountStorage.pendingPersonalAccessTokenRevokeName.clear,
  getIdentifier: () => getString(storageKeys.identifier, 'session'),
  setIdentifier: (value: string) => {
    setString(storageKeys.identifier, value, 'session');
  },
  clearIdentifier: () => {
    removeItem(storageKeys.identifier, 'session');
  },
});
/* eslint-enable max-lines */
