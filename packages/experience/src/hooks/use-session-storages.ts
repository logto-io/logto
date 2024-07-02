/**
 * Provides a hook to access the session storage.
 */
import { useCallback } from 'react';
import * as s from 'superstruct';

import { identifierInputValueGuard, ssoConnectorMetadataGuard } from '@/types/guard';

const logtoStorageKeyPrefix = `logto:${window.location.origin}`;

export enum StorageKeys {
  SsoEmail = 'sso-email',
  SsoConnectors = 'sso-connectors',
  IdentifierInputValue = 'identifier-input-value',
  ForgotPasswordIdentifierInputValue = 'forgot-password-identifier-input-value',
}

const valueGuard = Object.freeze({
  [StorageKeys.SsoEmail]: s.string(),
  [StorageKeys.SsoConnectors]: s.array(ssoConnectorMetadataGuard),
  [StorageKeys.IdentifierInputValue]: identifierInputValueGuard,
  [StorageKeys.ForgotPasswordIdentifierInputValue]: identifierInputValueGuard,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- we  don't care about the superstruct details
} satisfies { [key in StorageKeys]: s.Struct<any> });

type StorageValueType<K extends StorageKeys> = s.Infer<(typeof valueGuard)[K]>;

const useSessionStorage = () => {
  const set = useCallback(<T extends StorageKeys>(key: T, value: StorageValueType<T>) => {
    if (typeof value === 'object') {
      sessionStorage.setItem(`${logtoStorageKeyPrefix}:${key}`, JSON.stringify(value));
      return;
    }

    sessionStorage.setItem(`${logtoStorageKeyPrefix}:${key}`, value);
  }, []);

  const remove = useCallback((key: StorageKeys) => {
    sessionStorage.removeItem(`${logtoStorageKeyPrefix}:${key}`);
  }, []);

  const get = useCallback(
    <T extends StorageKeys>(key: T): StorageValueType<T> | undefined => {
      const value = sessionStorage.getItem(`${logtoStorageKeyPrefix}:${key}`);

      if (value === null) {
        return;
      }

      const [error, rawValue] = valueGuard[key].validate(
        (() => {
          try {
            // eslint-disable-next-line no-restricted-syntax -- we use superstruct to validate the value
            return JSON.parse(value) as unknown;
          } catch {
            return value;
          }
        })()
      );

      if (error) {
        // Clear the invalid value
        remove(key);
        return;
      }

      return rawValue;
    },
    [remove]
  );

  return { set, get, remove };
};

export default useSessionStorage;
