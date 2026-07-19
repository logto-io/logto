import type { InlineHookExecutionRequestBody } from '@logto/schemas';

const maskedValue = '******';
const redactedValue = '[redacted]';
const fallbackErrorMessage = 'Inline hook execution failed.';
const safeResultActions = new Set(['createUser', 'updateUser']);
const safePasswordStatusKeys = new Set(['passwordverified', 'haspassword']);
const exactSensitiveKeys = new Set(['authorization', 'xfunctionskey', 'token']);
const sensitiveKeyFragments = [
  'secret',
  'password',
  'apikey',
  'privatekey',
  'credential',
  'cookie',
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isArray = (value: unknown): value is unknown[] => Array.isArray(value);

const normalizeKey = (key: string) => key.replaceAll(/[_-]/g, '').toLowerCase();

const shouldOmitKey = (key: string) => {
  const normalizedKey = normalizeKey(key);

  return normalizedKey === 'script' || normalizedKey === 'environmentvariables';
};

const isSensitiveKey = (key: string, value: unknown) => {
  const normalizedKey = normalizeKey(key);
  const isSafePasswordStatus =
    safePasswordStatusKeys.has(normalizedKey) && typeof value === 'boolean';

  return (
    !isSafePasswordStatus &&
    (exactSensitiveKeys.has(normalizedKey) ||
      normalizedKey.endsWith('token') ||
      sensitiveKeyFragments.some((fragment) => normalizedKey.includes(fragment)))
  );
};

const collectStringLeaves = (value: unknown): string[] => {
  if (typeof value === 'string') {
    return value ? [value] : [];
  }

  if (isArray(value)) {
    return value.flatMap((element) => collectStringLeaves(element));
  }

  if (isRecord(value)) {
    return Object.values(value).flatMap((element) => collectStringLeaves(element));
  }

  return [];
};

const collectSensitiveValues = (value: unknown): string[] => {
  if (isArray(value)) {
    return value.flatMap((element) => collectSensitiveValues(element));
  }

  if (!isRecord(value)) {
    return [];
  }

  return Object.entries(value).flatMap(([key, element]) => {
    if (isSensitiveKey(key, element)) {
      return collectStringLeaves(element);
    }

    return collectSensitiveValues(element);
  });
};

export const getInlineHookSensitiveValues = ({
  script,
  event,
  environmentVariables,
}: Pick<InlineHookExecutionRequestBody, 'script' | 'event' | 'environmentVariables'>) =>
  [
    script,
    ...script
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 2),
    ...Object.values(environmentVariables ?? {}),
    ...collectSensitiveValues(event),
  ]
    .filter(Boolean)
    .filter((value, index, values) => values.indexOf(value) === index)
    .toSorted((left, right) => right.length - left.length);

const redactInlineHookSensitiveText = (value: string, sensitiveValues: readonly string[]) =>
  sensitiveValues.reduce(
    (redacted, sensitiveValue) => redacted.replaceAll(sensitiveValue, redactedValue),
    value
  );

type SanitizeOptions = {
  redactReturnedUser?: boolean;
};

const sanitizeInlineHookData = (
  value: unknown,
  sensitiveValues: readonly string[],
  { redactReturnedUser = false }: SanitizeOptions = {},
  seen = new WeakSet<Record<string, unknown> | unknown[]>()
): unknown => {
  if (typeof value === 'string') {
    return redactInlineHookSensitiveText(value, sensitiveValues);
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'boolean' || value === null) {
    return value;
  }

  if (typeof value === 'bigint') {
    return String(value);
  }

  if (isArray(value)) {
    if (seen.has(value)) {
      return '[circular]';
    }

    seen.add(value);
    return value
      .map((element) =>
        sanitizeInlineHookData(element, sensitiveValues, { redactReturnedUser }, seen)
      )
      .filter((element) => element !== undefined);
  }

  if (isRecord(value)) {
    if (seen.has(value)) {
      return '[circular]';
    }

    seen.add(value);
    return Object.fromEntries(
      Object.entries(value).flatMap(([key, element]) => {
        if (shouldOmitKey(key)) {
          return [];
        }

        const normalizedKey = normalizeKey(key);

        if (redactReturnedUser && normalizedKey === 'user') {
          return [[key, redactedValue]];
        }

        if (redactReturnedUser && normalizedKey === 'action') {
          return [
            [
              key,
              typeof element === 'string' && safeResultActions.has(element) ? element : 'invalid',
            ],
          ];
        }

        return [
          [
            key,
            isSensitiveKey(key, element)
              ? maskedValue
              : sanitizeInlineHookData(element, sensitiveValues, { redactReturnedUser }, seen),
          ],
        ];
      })
    );
  }
};

const safelySanitizeInlineHookData = (
  value: unknown,
  sensitiveValues: readonly string[],
  options?: SanitizeOptions
) => {
  try {
    return sanitizeInlineHookData(value, sensitiveValues, options);
  } catch {
    return '[unavailable]';
  }
};

export const sanitizeInlineHookEvent = (event: unknown, sensitiveValues: readonly string[]) =>
  safelySanitizeInlineHookData(event, sensitiveValues);

export const sanitizeInlineHookResult = (result: unknown, sensitiveValues: readonly string[]) =>
  safelySanitizeInlineHookData(result, sensitiveValues, { redactReturnedUser: true });

const stringifyUnknownError = (error: unknown) => {
  try {
    return String(error);
  } catch {
    return fallbackErrorMessage;
  }
};

type SafeInlineHookErrorSummary = {
  name: string;
  message: string;
  status?: number;
};

const getNumberProperty = (record: Record<string, unknown> | undefined, key: string) => {
  const value = record?.[key];
  return typeof value === 'number' ? value : undefined;
};

export const buildSafeInlineHookErrorSummary = (
  error: unknown,
  sensitiveValues: readonly string[]
): SafeInlineHookErrorSummary => {
  try {
    const errorRecord = isRecord(error) ? error : undefined;
    const message =
      error instanceof Error
        ? error.message || fallbackErrorMessage
        : stringifyUnknownError(error) || fallbackErrorMessage;
    const status = getNumberProperty(errorRecord, 'status');

    return {
      name: 'Error',
      message: redactInlineHookSensitiveText(message, sensitiveValues),
      ...(status === undefined ? {} : { status }),
    };
  } catch {
    return { name: 'Error', message: fallbackErrorMessage };
  }
};

export const buildSafeInlineHookTelemetryError = (
  error: unknown,
  sensitiveValues: readonly string[]
) => {
  const summary = buildSafeInlineHookErrorSummary(error, sensitiveValues);
  const telemetryError = new Error(summary.message);

  // eslint-disable-next-line @silverhand/fp/no-mutation -- Preserve the safe error category only.
  telemetryError.name = summary.name;

  return telemetryError;
};
