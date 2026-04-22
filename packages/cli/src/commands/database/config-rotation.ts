import {
  LogtoOidcConfigKey,
  LogtoTenantConfigKey,
  type SupportedSigningKeyAlgorithm,
  logtoConfigGuards,
  type OidcConfigKey,
  type OidcPrivateKey,
  type SigningKeyRotationState,
} from '@logto/schemas';
import type { CommonQueryMethods } from '@silverhand/slonik';

import { getRowsByKeys, updateValueByKey } from '../../queries/logto-config.js';
import { consoleLog } from '../../utils.js';

import {
  getImmediatelyRotatedOidcPrivateKeys,
  getRotationStateForCacheInvalidation,
  getRotationStateForStagedRotation,
  getStagedRotatedOidcPrivateKeys,
  getTrimmedOidcPrivateKeys,
  normalizeOidcPrivateKeys,
} from './oidc-private-key.js';
import { generateOidcCookieKey, generateOidcPrivateKey } from './utils.js';

export const parseRotationGracePeriod = (value?: string): number => {
  if (value === undefined || value.trim() === '') {
    return 0;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
};

const getRotationStateRow = (
  rows: ReadonlyArray<{ key: string; value: unknown }>
): SigningKeyRotationState | undefined => {
  const row = rows.find(({ key }) => key === LogtoTenantConfigKey.SigningKeyRotationState);

  if (!row) {
    return undefined;
  }

  const parsed = logtoConfigGuards[LogtoTenantConfigKey.SigningKeyRotationState].safeParse(
    row.value
  );

  return parsed.success ? parsed.data : undefined;
};

export const rotateConfigKey = async ({
  connection,
  tenantId,
  key,
  privateKeyType,
  gracePeriod,
}: {
  connection: CommonQueryMethods;
  tenantId: string;
  key: LogtoOidcConfigKey.PrivateKeys | LogtoOidcConfigKey.CookieKeys;
  privateKeyType: SupportedSigningKeyAlgorithm;
  gracePeriod: number;
}): Promise<OidcPrivateKey[] | OidcConfigKey[]> => {
  const { rows } = await getRowsByKeys(connection, tenantId, [
    key,
    LogtoTenantConfigKey.SigningKeyRotationState,
  ]);
  const configRow = rows.find((row) => row.key === key);
  const currentRotationState = getRotationStateRow(rows);

  if (!configRow) {
    consoleLog.warn('No key found, create a new one');
  }

  switch (key) {
    case LogtoOidcConfigKey.PrivateKeys: {
      const parsed = logtoConfigGuards[key].safeParse(configRow?.value);
      const original = parsed.success ? parsed.data : [];
      const newPrivateKey = await generateOidcPrivateKey(privateKeyType);
      const rotatedPrivateKeys =
        gracePeriod === 0
          ? getImmediatelyRotatedOidcPrivateKeys(original, newPrivateKey)
          : getStagedRotatedOidcPrivateKeys(original, newPrivateKey);
      const rotationState =
        gracePeriod === 0
          ? getRotationStateForCacheInvalidation(currentRotationState)
          : getRotationStateForStagedRotation(currentRotationState, gracePeriod);

      await updateValueByKey(connection, tenantId, key, rotatedPrivateKeys);
      await updateValueByKey(
        connection,
        tenantId,
        LogtoTenantConfigKey.SigningKeyRotationState,
        rotationState
      );

      return rotatedPrivateKeys;
    }

    case LogtoOidcConfigKey.CookieKeys: {
      const parsed = logtoConfigGuards[key].safeParse(configRow?.value);
      const original = parsed.success ? parsed.data : [];
      const rotatedCookieKeys = [generateOidcCookieKey(), ...original];
      const rotationState = getRotationStateForCacheInvalidation(currentRotationState);

      await updateValueByKey(connection, tenantId, key, rotatedCookieKeys);
      await updateValueByKey(
        connection,
        tenantId,
        LogtoTenantConfigKey.SigningKeyRotationState,
        rotationState
      );

      return rotatedCookieKeys;
    }
  }
};

export const trimConfigKey = async ({
  connection,
  tenantId,
  key,
  length,
}: {
  connection: CommonQueryMethods;
  tenantId: string;
  key: LogtoOidcConfigKey.PrivateKeys | LogtoOidcConfigKey.CookieKeys;
  length: number;
}): Promise<OidcPrivateKey[] | OidcConfigKey[]> => {
  const { rows } = await getRowsByKeys(connection, tenantId, [
    key,
    LogtoTenantConfigKey.SigningKeyRotationState,
  ]);
  const configRow = rows.find((row) => row.key === key);
  const currentRotationState = getRotationStateRow(rows);

  if (!configRow) {
    consoleLog.fatal('No key found');
  }

  switch (key) {
    case LogtoOidcConfigKey.PrivateKeys: {
      const value = normalizeOidcPrivateKeys(logtoConfigGuards[key].parse(configRow.value));
      const trimmedPrivateKeys = getTrimmedOidcPrivateKeys(value, length);

      if (trimmedPrivateKeys.length === 0) {
        consoleLog.fatal(
          `You should keep at least one key in the array, current length=${value.length}`
        );
      }

      await updateValueByKey(connection, tenantId, key, trimmedPrivateKeys);
      await updateValueByKey(
        connection,
        tenantId,
        LogtoTenantConfigKey.SigningKeyRotationState,
        getRotationStateForCacheInvalidation(currentRotationState)
      );

      return trimmedPrivateKeys;
    }

    case LogtoOidcConfigKey.CookieKeys: {
      const value = logtoConfigGuards[key].parse(configRow.value);

      if (value.length - length < 1) {
        consoleLog.fatal(
          `You should keep at least one key in the array, current length=${value.length}`
        );
      }

      const trimmedCookieKeys = value.slice(0, -length);
      await updateValueByKey(connection, tenantId, key, trimmedCookieKeys);
      await updateValueByKey(
        connection,
        tenantId,
        LogtoTenantConfigKey.SigningKeyRotationState,
        getRotationStateForCacheInvalidation(currentRotationState)
      );

      return trimmedCookieKeys;
    }
  }
};
