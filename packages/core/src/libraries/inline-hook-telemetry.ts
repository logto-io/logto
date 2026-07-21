import { appInsights } from '@logto/app-insights/node';
import {
  hookUserPatchGuard,
  interactionIdentifierGuard,
  LogtoInlineHookKey,
  postFirstFactorVerificationResultGuard,
  postSignInResultGuard,
} from '@logto/schemas';
import { isPlainObject, trySafe } from '@silverhand/essentials';

import { doesInlineHookPreserveSignInIdentifier } from './inline-hook-identifier-validation.js';

export const inlineHookMetricNames = Object.freeze({
  executionCount: 'core/inline_hook/execution_count',
  executionDuration: 'core/inline_hook/execution_duration_ms',
} as const);

export type InlineHookRuntimeLocation = 'local' | 'azure';

type InlineHookExecutionOutcome =
  | 'success'
  | 'executionError'
  | 'invalidResult'
  | 'noop'
  | 'fallback';
type InlineHookExecutionAction = 'createUser' | 'updateUser' | 'noop';

export type InlineHookTelemetryProperties = {
  hookType: keyof typeof LogtoInlineHookKey;
  runtimeLocation: InlineHookRuntimeLocation;
  outcome: InlineHookExecutionOutcome;
  action: InlineHookExecutionAction;
};

type InlineHookResultTelemetryData = {
  key: LogtoInlineHookKey;
  event: unknown;
  result: unknown;
  runtimeLocation: InlineHookRuntimeLocation;
};

const inlineHookTypeNames = Object.freeze({
  [LogtoInlineHookKey.PostFirstFactorVerification]: 'PostFirstFactorVerification',
  [LogtoInlineHookKey.PostSignIn]: 'PostSignIn',
} satisfies Record<LogtoInlineHookKey, InlineHookTelemetryProperties['hookType']>);

const strictHookUserPatchGuard = hookUserPatchGuard.strict();

const isPlainRecord = (value: unknown): value is Record<string, unknown> => isPlainObject(value);

const isEmptyRecord = (value: unknown) => isPlainRecord(value) && Object.keys(value).length === 0;

const buildTelemetryProperties = (
  key: LogtoInlineHookKey,
  runtimeLocation: InlineHookRuntimeLocation,
  outcome: InlineHookExecutionOutcome,
  action: InlineHookExecutionAction
): InlineHookTelemetryProperties => ({
  hookType: inlineHookTypeNames[key],
  runtimeLocation,
  outcome,
  action,
});

const isPostFirstFactorVerificationActionCompatibleWithEvent = (
  event: unknown,
  action: 'createUser' | 'updateUser'
) => {
  if (!isPlainRecord(event) || !Object.hasOwn(event, 'user')) {
    return true;
  }

  const existingUser = Reflect.get(event, 'user');

  return (
    (action === 'createUser' && existingUser === null) ||
    (action === 'updateUser' && isPlainObject(existingUser))
  );
};

const doesPostFirstFactorVerificationResultPreserveIdentifier = (
  event: unknown,
  userPatch: Parameters<typeof doesInlineHookPreserveSignInIdentifier>[1]
) => {
  if (!isPlainRecord(event)) {
    return true;
  }

  const identifier = interactionIdentifierGuard.safeParse(event.identifier);

  return !identifier.success || doesInlineHookPreserveSignInIdentifier(identifier.data, userPatch);
};

const getPostFirstFactorVerificationResultTelemetry = (
  result: unknown,
  event: unknown,
  runtimeLocation: InlineHookRuntimeLocation
): InlineHookTelemetryProperties => {
  if (result === null || result === undefined || isEmptyRecord(result)) {
    return buildTelemetryProperties(
      LogtoInlineHookKey.PostFirstFactorVerification,
      runtimeLocation,
      'fallback',
      'noop'
    );
  }

  const parsed = postFirstFactorVerificationResultGuard.safeParse(result);

  if (!parsed.success) {
    return buildTelemetryProperties(
      LogtoInlineHookKey.PostFirstFactorVerification,
      runtimeLocation,
      'invalidResult',
      'noop'
    );
  }

  const userPatch = strictHookUserPatchGuard.safeParse(parsed.data.user);

  if (
    !userPatch.success ||
    !isPostFirstFactorVerificationActionCompatibleWithEvent(event, parsed.data.action) ||
    !doesPostFirstFactorVerificationResultPreserveIdentifier(event, userPatch.data)
  ) {
    return buildTelemetryProperties(
      LogtoInlineHookKey.PostFirstFactorVerification,
      runtimeLocation,
      'invalidResult',
      'noop'
    );
  }

  return buildTelemetryProperties(
    LogtoInlineHookKey.PostFirstFactorVerification,
    runtimeLocation,
    'success',
    parsed.data.action
  );
};

const getPostSignInResultTelemetry = (
  result: unknown,
  runtimeLocation: InlineHookRuntimeLocation
): InlineHookTelemetryProperties => {
  if (result === null || result === undefined || isEmptyRecord(result)) {
    return buildTelemetryProperties(LogtoInlineHookKey.PostSignIn, runtimeLocation, 'noop', 'noop');
  }

  const parsed = postSignInResultGuard.safeParse(result);

  if (parsed.success && parsed.data.user === undefined) {
    return buildTelemetryProperties(LogtoInlineHookKey.PostSignIn, runtimeLocation, 'noop', 'noop');
  }

  if (
    !parsed.success ||
    !parsed.data.user ||
    !strictHookUserPatchGuard.safeParse(parsed.data.user).success
  ) {
    return buildTelemetryProperties(
      LogtoInlineHookKey.PostSignIn,
      runtimeLocation,
      'invalidResult',
      'noop'
    );
  }

  return buildTelemetryProperties(
    LogtoInlineHookKey.PostSignIn,
    runtimeLocation,
    'success',
    parsed.data.action
  );
};

export const getInlineHookResultTelemetryProperties = ({
  key,
  event,
  result,
  runtimeLocation,
}: InlineHookResultTelemetryData): InlineHookTelemetryProperties => {
  try {
    switch (key) {
      case LogtoInlineHookKey.PostFirstFactorVerification: {
        return getPostFirstFactorVerificationResultTelemetry(result, event, runtimeLocation);
      }
      case LogtoInlineHookKey.PostSignIn: {
        return getPostSignInResultTelemetry(result, runtimeLocation);
      }
    }
  } catch {
    return buildTelemetryProperties(key, runtimeLocation, 'invalidResult', 'noop');
  }
};

export const getInlineHookExecutionErrorTelemetryProperties = (
  key: LogtoInlineHookKey,
  runtimeLocation: InlineHookRuntimeLocation
): InlineHookTelemetryProperties =>
  buildTelemetryProperties(key, runtimeLocation, 'executionError', 'noop');

export const trackInlineHookExecutionMetrics = ({
  durationMs,
  properties,
}: {
  durationMs: number;
  properties: InlineHookTelemetryProperties;
}) => {
  const { client } = appInsights;

  if (!client) {
    return;
  }

  trySafe(() => {
    client.trackMetric({
      name: inlineHookMetricNames.executionCount,
      value: 1,
      properties,
    });
  });
  trySafe(() => {
    client.trackMetric({
      name: inlineHookMetricNames.executionDuration,
      value: durationMs,
      properties,
    });
  });
};
