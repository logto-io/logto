import {
  getSeededOidcPrivateKeys,
  getImmediatelyRotatedOidcPrivateKeys,
  getRotationStateForCacheInvalidation,
  getRotationStateForStagedRotation,
  getStagedRotatedOidcPrivateKeys,
  getTrimmedOidcPrivateKeys,
  LogtoOidcConfigKey,
  LogtoTenantConfigKey,
  normalizeOidcPrivateKeys,
  type SupportedSigningKeyAlgorithm,
  logtoConfigGuards,
  type OidcConfigKey,
  type OidcPrivateKey,
  type SigningKeyRotationState,
} from '@logto/schemas';
import type { CommonQueryMethods } from '@silverhand/slonik';

import { getRowsByKeys, updateValueByKey } from '../../queries/logto-config.js';
import { consoleLog } from '../../utils.js';

import { generateOidcCookieKey, generateOidcPrivateKey } from './utils.js';

type RotateConfigResult = {
  keys: OidcPrivateKey[] | OidcConfigKey[];
};

export const parseRotationGracePeriod = (value?: string): number | undefined => {
  if (value === undefined || value.trim() === '') {
    return;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new TypeError('Invalid PRIVATE_KEY_ROTATION_GRACE_PERIOD env value');
  }

  return parsed;
};

export const getEffectiveRotationGracePeriod = ({
  key,
  gracePeriod,
  envGracePeriod,
}: {
  key: LogtoOidcConfigKey.PrivateKeys | LogtoOidcConfigKey.CookieKeys;
  gracePeriod?: number;
  envGracePeriod?: string;
}): number => {
  if (key === LogtoOidcConfigKey.CookieKeys) {
    if (gracePeriod !== undefined) {
      throw new TypeError(`${LogtoOidcConfigKey.CookieKeys} does not support grace period`);
    }

    return 0;
  }

  if (gracePeriod !== undefined) {
    if (!Number.isInteger(gracePeriod) || gracePeriod < 0) {
      throw new TypeError('Invalid grace period provided');
    }

    return gracePeriod;
  }

  return parseRotationGracePeriod(envGracePeriod) ?? 0;
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
}): Promise<RotateConfigResult> => {
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
      const hasExistingPrivateKeys = original.length > 0;
      const newPrivateKey = await generateOidcPrivateKey(privateKeyType);
      const rotatedPrivateKeys = hasExistingPrivateKeys
        ? gracePeriod === 0
          ? getImmediatelyRotatedOidcPrivateKeys(original, newPrivateKey)
          : getStagedRotatedOidcPrivateKeys(original, newPrivateKey)
        : getSeededOidcPrivateKeys([newPrivateKey]);
      const rotationState =
        !hasExistingPrivateKeys || gracePeriod === 0
          ? getRotationStateForCacheInvalidation(currentRotationState)
          : getRotationStateForStagedRotation(currentRotationState, gracePeriod);

      await updateValueByKey(connection, tenantId, key, rotatedPrivateKeys);
      await updateValueByKey(
        connection,
        tenantId,
        LogtoTenantConfigKey.SigningKeyRotationState,
        rotationState
      );

      return { keys: rotatedPrivateKeys };
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

      return { keys: rotatedCookieKeys };
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
}): Promise<RotateConfigResult> => {
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
      const rotationState = getRotationStateForCacheInvalidation(currentRotationState);

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
        rotationState
      );

      return { keys: trimmedPrivateKeys };
    }

    case LogtoOidcConfigKey.CookieKeys: {
      const value = logtoConfigGuards[key].parse(configRow.value);
      const rotationState = getRotationStateForCacheInvalidation(currentRotationState);

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
        rotationState
      );

      return { keys: trimmedCookieKeys };
    }
  }
};
