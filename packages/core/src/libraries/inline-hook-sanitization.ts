import type { InlineHookExecutionRequestBody } from '@logto/schemas';
import { z } from 'zod';

import {
  isArray,
  isRecord,
  isSensitiveDataKey,
  normalizeSensitiveDataKey,
  sensitiveDataMask,
  shouldOmitSensitiveDataKey,
  stripNullCharactersFromString,
} from '#src/utils/sensitive-data.js';

const redactedValue = '[redacted]';
const fallbackErrorMessage = 'Inline hook execution failed.';
const safeResultActions = new Set(['createUser', 'updateUser']);
const safeValidationIssueCodes = new Set<string>(Object.values(z.ZodIssueCode));

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
    if (shouldOmitSensitiveDataKey(key) || isSensitiveDataKey(key, element)) {
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
    .map((value) => stripNullCharactersFromString(value))
    .filter(Boolean)
    .filter((value, index, values) => values.indexOf(value) === index)
    .toSorted((left, right) => right.length - left.length);

const redactInlineHookSensitiveText = (value: string, sensitiveValues: readonly string[]) =>
  sensitiveValues.reduce((redacted, sensitiveValue) => {
    const sanitizedSensitiveValue = stripNullCharactersFromString(sensitiveValue);

    return sanitizedSensitiveValue
      ? redacted.replaceAll(sanitizedSensitiveValue, redactedValue)
      : redacted;
  }, stripNullCharactersFromString(value));

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
        if (shouldOmitSensitiveDataKey(key)) {
          return [];
        }

        const normalizedKey = normalizeSensitiveDataKey(key);
        const sanitizedKey = redactInlineHookSensitiveText(key, sensitiveValues);

        if (redactReturnedUser && normalizedKey === 'user') {
          return [[sanitizedKey, redactedValue]];
        }

        if (redactReturnedUser && normalizedKey === 'action') {
          return [
            [
              sanitizedKey,
              typeof element === 'string' && safeResultActions.has(element) ? element : 'invalid',
            ],
          ];
        }

        return [
          [
            sanitizedKey,
            isSensitiveDataKey(key, element)
              ? sensitiveDataMask
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
  errors?: SafeInlineHookValidationIssue[];
};

type SafeInlineHookValidationIssue = {
  path: string | Array<string | number>;
  code: string;
};

const getNumberProperty = (record: Record<string, unknown> | undefined, key: string) => {
  const value = record?.[key];
  return typeof value === 'number' ? value : undefined;
};

const getRecordProperty = (record: Record<string, unknown> | undefined, key: string) => {
  const value = record?.[key];
  return isRecord(value) ? value : undefined;
};

const getStringProperty = (record: Record<string, unknown> | undefined, key: string) => {
  const value = record?.[key];
  return typeof value === 'string' ? value : undefined;
};

const sanitizeInlineHookValidationPath = (
  value: unknown,
  sensitiveValues: readonly string[]
): SafeInlineHookValidationIssue['path'] | undefined => {
  if (typeof value === 'string') {
    return redactInlineHookSensitiveText(value, sensitiveValues);
  }

  if (
    isArray(value) &&
    value.every(
      (segment): segment is string | number =>
        typeof segment === 'string' || (typeof segment === 'number' && Number.isFinite(segment))
    )
  ) {
    return value.map((segment) =>
      typeof segment === 'string'
        ? redactInlineHookSensitiveText(segment, sensitiveValues)
        : segment
    );
  }
};

const sanitizeInlineHookValidationIssue = (
  value: unknown,
  sensitiveValues: readonly string[]
): SafeInlineHookValidationIssue | undefined => {
  if (!isRecord(value)) {
    return;
  }

  const { code } = value;
  const path = sanitizeInlineHookValidationPath(value.path, sensitiveValues);

  if (typeof code !== 'string' || !safeValidationIssueCodes.has(code) || path === undefined) {
    return;
  }

  return { path, code };
};

const getValidationIssues = (record: Record<string, unknown> | undefined) => {
  const nestedError = getRecordProperty(record, 'error');
  const candidates = [record?.errors, record?.issues, nestedError?.errors, nestedError?.issues];

  return candidates.find((value): value is unknown[] => isArray(value));
};

const getSafeInlineHookValidationIssues = (
  records: Array<Record<string, unknown> | undefined>,
  sensitiveValues: readonly string[]
) => {
  for (const record of records) {
    const issues = getValidationIssues(record);

    if (issues) {
      return issues.flatMap((issue) => {
        const sanitizedIssue = sanitizeInlineHookValidationIssue(issue, sensitiveValues);
        return sanitizedIssue ? [sanitizedIssue] : [];
      });
    }
  }

  return [];
};

export const buildSafeInlineHookErrorSummary = (
  error: unknown,
  sensitiveValues: readonly string[]
): SafeInlineHookErrorSummary => {
  try {
    const errorRecord = isRecord(error) ? error : undefined;
    const errorData = getRecordProperty(errorRecord, 'data');
    const message =
      (error instanceof Error
        ? (getStringProperty(errorData, 'message') ?? error.message)
        : (getStringProperty(errorRecord, 'message') ??
          getStringProperty(errorData, 'message') ??
          stringifyUnknownError(error))) || fallbackErrorMessage;
    const status = getNumberProperty(errorRecord, 'status');
    const errors = getSafeInlineHookValidationIssues([errorData, errorRecord], sensitiveValues);

    return {
      name: 'Error',
      message: redactInlineHookSensitiveText(message, sensitiveValues),
      ...(status === undefined ? {} : { status }),
      ...(errors.length === 0 ? {} : { errors }),
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
