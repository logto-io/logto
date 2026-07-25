import {
  actionUserPatchFields,
  InteractionEvent,
  LogtoActionKey,
  loggablePostFirstFactorVerificationEventGuard,
  loggablePostSignInEventGuard,
  VerificationType,
  type LoggableActionEvent,
  type LoggableActionResult,
} from '@logto/schemas';
import { z } from 'zod';

import { isArray, isRecord } from '#src/utils/sensitive-data.js';

const unavailableValue = '[unavailable]';
const fallbackErrorMessage = 'Action execution failed.';
const telemetryErrorName = 'ActionExecutionError';
const safeValidationIssueCodes = new Set<string>(Object.values(z.ZodIssueCode));

/**
 * The parts of each Action event that vary at runtime. Deriving them from the loggable guards keeps
 * the projection and the audit-log contract in sync, and Zod's default stripping means any field
 * outside the loggable shape (the end user's password, the full sign-in user context) is dropped
 * rather than masked.
 */
const eventProjectionGuards = Object.freeze({
  [LogtoActionKey.PostFirstFactorVerification]: loggablePostFirstFactorVerificationEventGuard.pick({
    identifier: true,
    user: true,
  }),
  [LogtoActionKey.PostSignIn]: loggablePostSignInEventGuard.pick({ user: true }),
});

/** An event that does not match its key's expected shape degrades to the key alone. */
type UnknownLoggableActionEvent = { key: LogtoActionKey };

/**
 * Project a production Action event down to the fields that are safe to persist in an audit log.
 *
 * Events are built by Core rather than by scripts, so a parse failure means the event shape has
 * drifted from the schema. That degrades to the action key instead of logging unrecognized data.
 */
export const toLoggableActionEvent = (
  key: LogtoActionKey,
  event: unknown
): LoggableActionEvent | UnknownLoggableActionEvent => {
  try {
    switch (key) {
      case LogtoActionKey.PostFirstFactorVerification: {
        const parsed = eventProjectionGuards[key].safeParse(event);

        return parsed.success
          ? {
              key,
              interactionEvent: InteractionEvent.SignIn,
              verificationType: VerificationType.Password,
              ...parsed.data,
            }
          : { key };
      }
      case LogtoActionKey.PostSignIn: {
        const parsed = eventProjectionGuards[key].safeParse(event);

        return parsed.success
          ? { key, interactionEvent: InteractionEvent.SignIn, ...parsed.data }
          : { key };
      }
    }
  } catch {
    return { key };
  }
};

/**
 * Describe what a script asked Logto to do without echoing anything the script authored.
 *
 * Results are untrusted input: property names and values both come from the script, and accessors
 * on the returned object can throw. Only patch field names on the {@link actionUserPatchFields}
 * allowlist are named; everything else is counted.
 */
export const toLoggableActionResult = (
  result: unknown
): LoggableActionResult | typeof unavailableValue => {
  try {
    if (!isRecord(result)) {
      return { passwordVerified: false, userFields: [], unknownFieldCount: 0 };
    }

    const user: unknown = Reflect.get(result, 'user');
    const patchedFields = isRecord(user) ? Object.keys(user) : [];
    const userFields = actionUserPatchFields.filter((field) => patchedFields.includes(field));

    return {
      passwordVerified: Reflect.get(result, 'passwordVerified') === true,
      userFields,
      unknownFieldCount: patchedFields.length - userFields.length,
    };
  } catch {
    return unavailableValue;
  }
};

const stringifyUnknownError = (error: unknown) => {
  try {
    return String(error);
  } catch {
    return fallbackErrorMessage;
  }
};

type SafeActionErrorSummary = {
  name: string;
  message: string;
  status?: number;
  errors?: SafeActionValidationIssue[];
};

type SafeActionValidationIssue = {
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

const toSafeActionValidationPath = (
  value: unknown
): SafeActionValidationIssue['path'] | undefined => {
  if (typeof value === 'string') {
    return value;
  }

  if (
    isArray(value) &&
    value.every(
      (segment): segment is string | number =>
        typeof segment === 'string' || (typeof segment === 'number' && Number.isFinite(segment))
    )
  ) {
    return value;
  }
};

const toSafeActionValidationIssue = (value: unknown): SafeActionValidationIssue | undefined => {
  if (!isRecord(value)) {
    return;
  }

  const { code } = value;
  const path = toSafeActionValidationPath(value.path);

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

const getSafeActionValidationIssues = (records: Array<Record<string, unknown> | undefined>) => {
  for (const record of records) {
    const issues = getValidationIssues(record);

    if (issues) {
      return issues.flatMap((issue) => {
        const safeIssue = toSafeActionValidationIssue(issue);
        return safeIssue ? [safeIssue] : [];
      });
    }
  }

  return [];
};

/**
 * Reduce an execution failure to a structurally safe summary: a message, an HTTP status, and
 * validation issues carrying only an allowlisted Zod issue code and its path.
 *
 * This drops transport internals such as the outbound request and its headers, and never passes
 * through a raw runner response body. The message itself is preserved: for both consumers (the
 * tenant's audit log and the dry-run response) the reader is the admin who authored the script.
 */
export const buildSafeActionErrorSummary = (error: unknown): SafeActionErrorSummary => {
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
    const errors = getSafeActionValidationIssues([errorData, errorRecord]);

    return {
      name: 'Error',
      message,
      ...(status === undefined ? {} : { status }),
      ...(errors.length === 0 ? {} : { errors }),
    };
  } catch {
    return { name: 'Error', message: fallbackErrorMessage };
  }
};

/**
 * Build the exception reported to Application Insights, which is operated by Logto and shared
 * across tenants. Unlike the audit log, it must not carry tenant-authored text, so only the failure
 * category and the HTTP status are reported. The fresh `Error` also keeps the original stack, which
 * can embed runner internals, out of telemetry.
 */
export const buildActionTelemetryError = (error: unknown) => {
  const { status } = buildSafeActionErrorSummary(error);
  const telemetryError = new Error(
    status === undefined ? fallbackErrorMessage : `${fallbackErrorMessage} Status: ${status}.`
  );

  // eslint-disable-next-line @silverhand/fp/no-mutation -- Preserve the safe error category only.
  telemetryError.name = telemetryErrorName;

  return telemetryError;
};
