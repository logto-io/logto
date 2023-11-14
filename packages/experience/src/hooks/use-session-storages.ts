/**
 * Provides a hook to access the session storage.
 */
import { type SsoConnectorMetadata } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import { useCallback } from 'react';

const logtoStorageKeyPrefix = `logto:${window.location.origin}`;

export enum StorageKeys {
  SsoEmail = 'sso-email',
  SsoConnectors = 'sso-connectors',
}

const valueType = Object.freeze({
  [StorageKeys.SsoEmail]: 'string',
  [StorageKeys.SsoConnectors]: 'object',
} satisfies { [key in StorageKeys]: 'string' | 'object' });

type StorageValue<K extends StorageKeys> = K extends StorageKeys.SsoEmail
  ? string
  : K extends StorageKeys.SsoConnectors
  ? SsoConnectorMetadata[]
  : never;

const useSessionStorage = () => {
  const set = useCallback(<T extends StorageKeys>(key: T, value: StorageValue<T>) => {
    if (typeof value === 'object') {
      sessionStorage.setItem(`${logtoStorageKeyPrefix}:${key}`, JSON.stringify(value));
      return;
    }

    sessionStorage.setItem(`${logtoStorageKeyPrefix}:${key}`, value);
  }, []);

  const get = useCallback(<T extends StorageKeys>(key: T): StorageValue<T> | undefined => {
    const value = sessionStorage.getItem(`${logtoStorageKeyPrefix}:${key}`);

    if (value === null) {
      return;
    }

    if (valueType[key] === 'object') {
      return trySafe(
        // eslint-disable-next-line no-restricted-syntax
        () => JSON.parse(value) as StorageValue<T>
      );
    }

    // eslint-disable-next-line no-restricted-syntax
    return value as StorageValue<T>;
  }, []);

  const remove = useCallback((key: StorageKeys) => {
    sessionStorage.removeItem(`${logtoStorageKeyPrefix}:${key}`);
  }, []);

  return { set, get, remove };
};

export default useSessionStorage;
