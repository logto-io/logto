export const sensitiveDataMask = '******';

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const isArray = (value: unknown): value is unknown[] => Array.isArray(value);

const nullCharacter = String.fromCodePoint(0);
const safeSensitiveDataKeys = new Set(['passwordverified', 'haspassword']);
const exactSensitiveDataKeys = new Set(['authorization', 'xfunctionskey', 'token']);
const sensitiveDataKeyFragments = [
  'secret',
  'password',
  'apikey',
  'privatekey',
  'credential',
  'cookie',
];

/** PostgreSQL rejects U+0000 anywhere in `jsonb`, including object keys. */
export const stripNullCharactersFromString = (value: string): string =>
  value.includes(nullCharacter) ? value.replaceAll(nullCharacter, '') : value;

export const normalizeSensitiveDataKey = (key: string) =>
  stripNullCharactersFromString(key).replaceAll(/[_-]/g, '').toLowerCase();

export const shouldOmitSensitiveDataKey = (key: string) => {
  const normalizedKey = normalizeSensitiveDataKey(key);

  return (
    normalizedKey.startsWith('script') ||
    normalizedKey.endsWith('script') ||
    normalizedKey.includes('environmentvariables')
  );
};

export const isSensitiveDataKey = (key: string, value: unknown) => {
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
          isSensitiveDataKey(sanitizedKey, element)
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
