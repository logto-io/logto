import { appInsights } from '@logto/app-insights/node';
import {
  actionUserPatchGuard,
  interactionIdentifierGuard,
  LogtoActionKey,
  postFirstFactorVerificationResultGuard,
  postSignInResultGuard,
} from '@logto/schemas';
import { isPlainObject, trySafe } from '@silverhand/essentials';

import { doesActionPreserveSignInIdentifier } from './action-identifier-validation.js';

export const actionMetricNames = Object.freeze({
  executionCount: 'core/action/execution_count',
  executionDuration: 'core/action/execution_duration_ms',
} as const);

export type ActionRuntimeLocation = 'local' | 'azure';

type ActionExecutionOutcome = 'success' | 'executionError' | 'invalidResult' | 'noop' | 'fallback';
type ActionExecutionAction = 'createUser' | 'updateUser' | 'noop';

export type ActionTelemetryProperties = {
  actionType: keyof typeof LogtoActionKey;
  runtimeLocation: ActionRuntimeLocation;
  outcome: ActionExecutionOutcome;
  action: ActionExecutionAction;
};

type ActionResultTelemetryData = {
  key: LogtoActionKey;
  event: unknown;
  result: unknown;
  runtimeLocation: ActionRuntimeLocation;
};

const actionTypeNames = Object.freeze({
  [LogtoActionKey.PostFirstFactorVerification]: 'PostFirstFactorVerification',
  [LogtoActionKey.PostSignIn]: 'PostSignIn',
} satisfies Record<LogtoActionKey, ActionTelemetryProperties['actionType']>);

const strictActionUserPatchGuard = actionUserPatchGuard.strict();

const isPlainRecord = (value: unknown): value is Record<string, unknown> => isPlainObject(value);

const isEmptyRecord = (value: unknown) => isPlainRecord(value) && Object.keys(value).length === 0;

const buildTelemetryProperties = (
  key: LogtoActionKey,
  runtimeLocation: ActionRuntimeLocation,
  outcome: ActionExecutionOutcome,
  action: ActionExecutionAction
): ActionTelemetryProperties => ({
  actionType: actionTypeNames[key],
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
  userPatch: Parameters<typeof doesActionPreserveSignInIdentifier>[1]
) => {
  if (!isPlainRecord(event)) {
    return true;
  }

  const identifier = interactionIdentifierGuard.safeParse(event.identifier);

  return !identifier.success || doesActionPreserveSignInIdentifier(identifier.data, userPatch);
};

const getPostFirstFactorVerificationResultTelemetry = (
  result: unknown,
  event: unknown,
  runtimeLocation: ActionRuntimeLocation
): ActionTelemetryProperties => {
  if (result === null || result === undefined || isEmptyRecord(result)) {
    return buildTelemetryProperties(
      LogtoActionKey.PostFirstFactorVerification,
      runtimeLocation,
      'fallback',
      'noop'
    );
  }

  const parsed = postFirstFactorVerificationResultGuard.safeParse(result);

  if (!parsed.success) {
    return buildTelemetryProperties(
      LogtoActionKey.PostFirstFactorVerification,
      runtimeLocation,
      'invalidResult',
      'noop'
    );
  }

  const userPatch = strictActionUserPatchGuard.safeParse(parsed.data.user);

  if (
    !userPatch.success ||
    !isPostFirstFactorVerificationActionCompatibleWithEvent(event, parsed.data.action) ||
    !doesPostFirstFactorVerificationResultPreserveIdentifier(event, userPatch.data)
  ) {
    return buildTelemetryProperties(
      LogtoActionKey.PostFirstFactorVerification,
      runtimeLocation,
      'invalidResult',
      'noop'
    );
  }

  return buildTelemetryProperties(
    LogtoActionKey.PostFirstFactorVerification,
    runtimeLocation,
    'success',
    parsed.data.action
  );
};

const getPostSignInResultTelemetry = (
  result: unknown,
  runtimeLocation: ActionRuntimeLocation
): ActionTelemetryProperties => {
  if (result === null || result === undefined || isEmptyRecord(result)) {
    return buildTelemetryProperties(LogtoActionKey.PostSignIn, runtimeLocation, 'noop', 'noop');
  }

  const parsed = postSignInResultGuard.safeParse(result);

  if (parsed.success && parsed.data.user === undefined) {
    return buildTelemetryProperties(LogtoActionKey.PostSignIn, runtimeLocation, 'noop', 'noop');
  }

  if (
    !parsed.success ||
    !parsed.data.user ||
    !strictActionUserPatchGuard.safeParse(parsed.data.user).success
  ) {
    return buildTelemetryProperties(
      LogtoActionKey.PostSignIn,
      runtimeLocation,
      'invalidResult',
      'noop'
    );
  }

  return buildTelemetryProperties(
    LogtoActionKey.PostSignIn,
    runtimeLocation,
    'success',
    parsed.data.action
  );
};

export const getActionResultTelemetryProperties = ({
  key,
  event,
  result,
  runtimeLocation,
}: ActionResultTelemetryData): ActionTelemetryProperties => {
  try {
    switch (key) {
      case LogtoActionKey.PostFirstFactorVerification: {
        return getPostFirstFactorVerificationResultTelemetry(result, event, runtimeLocation);
      }
      case LogtoActionKey.PostSignIn: {
        return getPostSignInResultTelemetry(result, runtimeLocation);
      }
    }
  } catch {
    return buildTelemetryProperties(key, runtimeLocation, 'invalidResult', 'noop');
  }
};

export const getActionExecutionErrorTelemetryProperties = (
  key: LogtoActionKey,
  runtimeLocation: ActionRuntimeLocation
): ActionTelemetryProperties =>
  buildTelemetryProperties(key, runtimeLocation, 'executionError', 'noop');

export const trackActionExecutionMetrics = ({
  durationMs,
  properties,
}: {
  durationMs: number;
  properties: ActionTelemetryProperties;
}) => {
  const { client } = appInsights;

  if (!client) {
    return;
  }

  trySafe(() => {
    client.trackMetric({
      name: actionMetricNames.executionCount,
      value: 1,
      properties,
    });
  });
  trySafe(() => {
    client.trackMetric({
      name: actionMetricNames.executionDuration,
      value: durationMs,
      properties,
    });
  });
};
