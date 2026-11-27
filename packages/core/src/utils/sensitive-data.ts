import { MfaFactor, type LogContextPayload } from '@logto/schemas';

import { isArray, isRecord } from '#src/utils/type.js';

const sensitiveDataMask = '******';

const nullCharacter = String.fromCodePoint(0);
const safeSensitiveDataKeys = new Set(['passwordverified', 'haspassword']);
const exactSensitiveDataKeys = new Set(['authorization', 'xfunctionskey', 'token', 'backupcodes']);
const sensitiveDataKeyFragments = [
  'secret',
  'password',
  'apikey',
  'privatekey',
  'credential',
  'cookie',
];

/** PostgreSQL rejects U+0000 anywhere in `jsonb`, including object keys. */
const stripNullCharactersFromString = (value: string): string =>
  value.includes(nullCharacter) ? value.replaceAll(nullCharacter, '') : value;

const normalizeSensitiveDataKey = (key: string) =>
  stripNullCharactersFromString(key).replaceAll(/[_-]/g, '').toLowerCase();

const shouldOmitSensitiveDataKey = (key: string) => {
  const normalizedKey = normalizeSensitiveDataKey(key);

  return (
    normalizedKey.startsWith('script') ||
    normalizedKey.endsWith('script') ||
    normalizedKey.includes('environmentvariables')
  );
};

const isSensitiveDataKey = (key: string, value: unknown) => {
  const normalizedKey = normalizeSensitiveDataKey(key);
  const isSafePasswordStatus =
    safeSensitiveDataKeys.has(normalizedKey) && typeof value === 'boolean';
  const isSafeApplicationSecretMetadata =
    normalizedKey === 'applicationsecret' &&
    isRecord(value) &&
    Object.keys(value).length === 1 &&
    typeof value.name === 'string';

  return (
    !isSafePasswordStatus &&
    !isSafeApplicationSecretMetadata &&
    (exactSensitiveDataKeys.has(normalizedKey) ||
      normalizedKey.endsWith('token') ||
      sensitiveDataKeyFragments.some((fragment) => normalizedKey.includes(fragment)))
  );
};

/**
 * Logto stores every backup code list next to `type: 'BackupCode'`. Other `codes` keys, such as
 * ones in custom data or identity provider profiles, stay readable.
 */
const isBackupCodeList = (key: string, record: Record<string, unknown>) =>
  normalizeSensitiveDataKey(key) === 'codes' && record.type === MfaFactor.BackupCode;

export const sanitizeSensitiveDataRecord = (
  value: Record<string, unknown>
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(value).flatMap(([key, element]) => {
      const sanitizedKey = stripNullCharactersFromString(key);

      if (shouldOmitSensitiveDataKey(sanitizedKey)) {
        return [];
      }

      return [
        [
          sanitizedKey,
          isSensitiveDataKey(sanitizedKey, element) || isBackupCodeList(sanitizedKey, value)
            ? sensitiveDataMask
            : sanitizeSensitiveData(element),
        ],
      ];
    })
  );

const sanitizeSensitiveData = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return stripNullCharactersFromString(value);
  }

  if (isArray(value)) {
    return value.map((element) => sanitizeSensitiveData(element));
  }

  if (isRecord(value)) {
    return sanitizeSensitiveDataRecord(value);
  }

  return value;
};

/**
 * Reapply reserved fields after canonicalizing catch-all keys, so inputs such as `\0key` cannot
 * collide with the fields that define the log entry.
 */
export const sanitizeLogContextPayload = ({
  key,
  result,
  ...payload
}: LogContextPayload): LogContextPayload => ({
  ...sanitizeSensitiveDataRecord(payload),
  key: stripNullCharactersFromString(key),
  result,
});
