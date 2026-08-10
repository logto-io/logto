/* eslint-disable max-lines -- Action runtime, policy, audit, and telemetry share one orchestration flow. */
import { appInsights } from '@logto/app-insights/node';
import {
  adminTenantId,
  action as actionLog,
  LogResult,
  LogtoActionKey,
  type ActionExecutionErrorPolicy,
  type ActionExecutionRequestBody,
} from '@logto/schemas';
import { ZodError } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import type { LogtoConfigLibrary } from '#src/libraries/logto-config.js';
import type { SubscriptionLibrary } from '#src/libraries/subscription.js';
import type { LogContext, LogPayload } from '#src/middleware/koa-audit-log.js';
import { runScriptFunctionInLocalVm } from '#src/utils/local-vm/index.js';

import {
  buildActionTelemetryError,
  buildSafeActionErrorSummary,
  getActionEventCredentials,
  toLoggableActionEvent,
  toLoggableActionResult,
} from './action-sanitization.js';
import {
  getActionExecutionErrorTelemetryProperties,
  getActionResultTelemetryProperties,
  type ActionRuntimeLocation,
  trackActionExecutionMetrics,
} from './action-telemetry.js';
import { type CloudConnectionLibrary } from './cloud-connection.js';
import {
  buildCloudScriptFailureError,
  buildScriptExecutionErrorBody,
  buildScriptFailureError,
  getScriptFailureStatusCode,
  parseCloudScriptFailure,
  runScriptOnCloud,
  runScriptOnWorkerPool,
  ScriptExecutionError,
} from './script-runner/index.js';

const actionFunctionName = 'runAction';
const defaultActionExecutionErrorPolicy = 'block' satisfies ActionExecutionErrorPolicy;

export type ActionExecutionErrorFallback = {
  action: 'rejectInvalidCredentials';
};

export type ActionExecutionErrorPolicyDecision =
  | {
      action: 'throw';
      error: RequestError;
    }
  | {
      action: 'continue';
    }
  | ActionExecutionErrorFallback;

type ActionScriptPayload<Event> = {
  event: Event;
  environmentVariables?: Record<string, string>;
};

type ActionRunnerData<Event> = {
  script: string;
  event: Event;
  environmentVariables?: Record<string, string>;
};

type ActionEventSource<Event> =
  | {
      event: Event;
    }
  | {
      getEvent: () => Promise<Event>;
    };

type RunActionData<Event> = ActionEventSource<Event> & {
  key: LogtoActionKey;
  auditContext: Pick<LogContext, 'createLog'> &
    Pick<LogPayload, 'applicationId' | 'cimdClientId' | 'sessionId' | 'userId'>;
};

type ActionExecutionErrorHandlingData = {
  key: LogtoActionKey;
  onExecutionError?: ActionExecutionErrorPolicy;
};

type ActionExecutionOutcome =
  | { status: 'success'; result: unknown }
  | { status: 'error'; error: unknown };

const actionLogTypes = Object.freeze({
  [LogtoActionKey.PostFirstFactorVerification]: actionLog.Type.PostFirstFactorVerification,
  [LogtoActionKey.PostSignIn]: actionLog.Type.PostSignIn,
} satisfies Record<LogtoActionKey, actionLog.Type>);

const getActionLogKey = (key: LogtoActionKey): actionLog.LogKey =>
  `${actionLog.prefix}.${actionLogTypes[key]}`;

type ActionResultEffect = {
  fields: readonly string[];
  missingDecision: 'invalid' | 'noop';
};

const actionResultEffects: Readonly<
  Record<LogtoActionKey, Readonly<Record<string, ActionResultEffect>>>
> = Object.freeze({
  [LogtoActionKey.PostFirstFactorVerification]: {
    createUser: { fields: ['user'], missingDecision: 'invalid' },
    updateUser: { fields: ['user'], missingDecision: 'invalid' },
  },
  [LogtoActionKey.PostSignIn]: {
    updateUser: { fields: ['user'], missingDecision: 'noop' },
  },
});

const hasActionResultEffect = (result: unknown, effectFields: readonly string[]) =>
  typeof result === 'object' &&
  result !== null &&
  effectFields.some((field) => {
    const descriptor = Object.getOwnPropertyDescriptor(result, field);

    return descriptor !== undefined && 'value' in descriptor && descriptor.value !== undefined;
  });

const getActionResultActionSummary = (key: LogtoActionKey, result: unknown) => {
  try {
    if (typeof result !== 'object' || result === null) {
      return { decision: 'noop' };
    }

    const rawAction: unknown = Reflect.get(result, 'action');

    if (typeof rawAction !== 'string') {
      return { decision: 'noop' };
    }

    const effect = actionResultEffects[key][rawAction];

    if (!effect) {
      return { decision: 'invalid' };
    }

    if (!hasActionResultEffect(result, effect.fields)) {
      return { decision: effect.missingDecision };
    }

    return { action: rawAction, decision: rawAction };
  } catch {
    return { decision: 'invalid' };
  }
};

const getActionErrorFallback = (key: LogtoActionKey): ActionExecutionErrorPolicyDecision => {
  switch (key) {
    case LogtoActionKey.PostFirstFactorVerification: {
      return { action: 'rejectInvalidCredentials' };
    }
    case LogtoActionKey.PostSignIn: {
      return {
        action: 'throw',
        error: new RequestError({ code: 'session.verification_failed', status: 400 }),
      };
    }
  }

  throw new TypeError('Unsupported action key');
};

export const getActionExecutionErrorPolicyDecision = ({
  key,
  onExecutionError = defaultActionExecutionErrorPolicy,
}: ActionExecutionErrorHandlingData): ActionExecutionErrorPolicyDecision => {
  if (onExecutionError === 'allow') {
    return key === LogtoActionKey.PostFirstFactorVerification
      ? { action: 'rejectInvalidCredentials' }
      : { action: 'continue' };
  }

  return getActionErrorFallback(key);
};

const applyActionExecutionErrorPolicyDecision = (decision: ActionExecutionErrorPolicyDecision) => {
  if (decision.action === 'throw') {
    throw decision.error;
  }

  return decision.action === 'rejectInvalidCredentials' ? decision : undefined;
};

export class ActionLibrary {
  static async runScriptInLocalVm<Event>(
    data: ActionRunnerData<Event>,
    tenantId: string
  ): Promise<unknown> {
    // TODO (LOG-13956): drop the legacy `node:vm` path and the gate once the worker-thread
    // runner has been manually verified and released.
    if (!EnvSet.values.isDevFeaturesEnabled) {
      return ActionLibrary.runScriptInLegacyVm(data);
    }

    const { script, event, environmentVariables } = data;
    // No `api` capability for Actions: the payload stays `{ event, environmentVariables }`, and
    // the worker only injects `api` for the Custom JWT entry.
    const payload: ActionScriptPayload<Event> = {
      event,
      environmentVariables,
    };

    const result = await runScriptOnWorkerPool({
      script,
      entry: actionFunctionName,
      payload,
      tenantId,
    });

    if (!result.ok) {
      throw buildScriptFailureError(result);
    }

    return result.value;
  }

  /** The pre-worker-runner execution path, still serving production until the gate above lifts. */
  private static async runScriptInLegacyVm<Event>({
    script,
    event,
    environmentVariables,
  }: ActionRunnerData<Event>): Promise<unknown> {
    try {
      const payload: ActionScriptPayload<Event> = {
        event,
        environmentVariables,
      };

      return await runScriptFunctionInLocalVm(script, actionFunctionName, payload);
    } catch (error: unknown) {
      if (error instanceof ScriptExecutionError) {
        throw error;
      }

      if (error instanceof ZodError) {
        throw new ScriptExecutionError(
          {
            message: 'Invalid input',
            errors: error.errors,
          },
          400
        );
      }

      throw new ScriptExecutionError(
        buildScriptExecutionErrorBody(error),
        getScriptFailureStatusCode(error)
      );
    }
  }

  constructor(
    private readonly tenantId: string,
    private readonly logtoConfigs: LogtoConfigLibrary,
    private readonly subscription: SubscriptionLibrary,
    private readonly cloudConnection: CloudConnectionLibrary
  ) {}

  /**
   * Shared entry point for production `runAction()` and Management API dry runs.
   * Cloud always executes remotely; OSS / self-hosted runs locally — on the worker pool behind
   * dev features, otherwise in the legacy `node:vm`.
   * Cloud remote failures must never fall back to the local runner.
   */
  async executeScript({
    script,
    actionType,
    event,
    environmentVariables,
  }: {
    script: string;
    actionType: LogtoActionKey;
    // Production events are typed domain objects; dry-run uses JSON via the guard.
    event: unknown;
    environmentVariables?: Record<string, string>;
  }): Promise<unknown> {
    const payload = { script, actionType, event, environmentVariables };

    if (EnvSet.values.isCloud) {
      return this.runScriptRemotely(payload);
    }

    return ActionLibrary.runScriptInLocalVm(payload, this.tenantId);
  }

  /**
   * For Logto Cloud use only. Run the action script remotely in an isolated environment.
   * For OSS version, use @see ActionLibrary.runScriptInLocalVm instead.
   */
  async runScriptRemotely({
    script,
    event,
    environmentVariables,
  }: {
    script: string;
    actionType: LogtoActionKey;
    event: unknown;
    environmentVariables?: Record<string, string>;
  }): Promise<unknown> {
    /**
     * `actionType` selects the script on this side and is deliberately not forwarded — anything
     * in `payload` becomes a visible field of the script's `runAction` argument, and the
     * authoring contract promises `{ event, environmentVariables }` only.
     */
    const payload: ActionScriptPayload<unknown> = { event, environmentVariables };

    try {
      return await runScriptOnCloud({
        cloudConnection: this.cloudConnection,
        script,
        entry: actionFunctionName,
        payload,
      });
    } catch (error: unknown) {
      const failure = await parseCloudScriptFailure(error);

      throw failure ? buildCloudScriptFailureError(failure) : error;
    }
  }

  async runAction<Event>({
    key,
    auditContext: { createLog, ...auditContext },
    ...eventSource
  }: RunActionData<Event>): Promise<unknown> {
    const action = await this.findEnabledAction(key);

    if (!action) {
      return;
    }

    if (!(await this.isActionsEnabledByQuota())) {
      return;
    }

    const event = 'getEvent' in eventSource ? await eventSource.getEvent() : eventSource.event;
    const executionPayload: ActionExecutionRequestBody = {
      script: action.script,
      actionType: key,
      // Production events are always JSON-serializable payloads from Core call sites.
      // eslint-disable-next-line no-restricted-syntax -- Generic Event is wider than Json; cast at the shared execution boundary.
      event: event as ActionExecutionRequestBody['event'],
      environmentVariables: action.environmentVariables,
    };
    const onExecutionError = action.onExecutionError ?? defaultActionExecutionErrorPolicy;
    const runtimeLocation = EnvSet.values.isCloud ? 'remote' : 'local';
    const telemetryRuntimeLocation: ActionRuntimeLocation = EnvSet.values.isCloud
      ? 'azure'
      : 'local';
    const log = createLog(getActionLogKey(key), { independent: true });

    log.append({
      ...auditContext,
      tenantId: this.tenantId,
      actionType: key,
      runtimeLocation,
      onExecutionError,
      event: toLoggableActionEvent(key, event),
    });

    const startedAt = Date.now();
    const executionOutcome = await this.executeScript(executionPayload).then<
      ActionExecutionOutcome & { durationMs: number },
      ActionExecutionOutcome & { durationMs: number }
    >(
      (result) => ({ status: 'success', result, durationMs: Date.now() - startedAt }),
      (error: unknown) => ({ status: 'error', error, durationMs: Date.now() - startedAt })
    );
    const { durationMs } = executionOutcome;
    const telemetryProperties =
      executionOutcome.status === 'error'
        ? getActionExecutionErrorTelemetryProperties(key, telemetryRuntimeLocation)
        : getActionResultTelemetryProperties({
            key,
            event,
            result: executionOutcome.result,
            runtimeLocation: telemetryRuntimeLocation,
          });

    try {
      if (executionOutcome.status === 'error') {
        const { error } = executionOutcome;
        const decision = getActionExecutionErrorPolicyDecision({ key, onExecutionError });

        log.append({
          result: LogResult.Error,
          durationMs,
          decision: decision.action,
          errorPolicyOutcome: decision.action === 'continue' ? 'allow' : 'block',
          actionError: buildSafeActionErrorSummary(error, {
            redactValues: getActionEventCredentials(event),
          }),
        });

        void appInsights.trackException(buildActionTelemetryError(error), {
          properties: telemetryProperties,
        });

        return applyActionExecutionErrorPolicyDecision(decision);
      }

      const { result } = executionOutcome;
      const actionSummary = getActionResultActionSummary(key, result);

      log.append({
        durationMs,
        ...actionSummary,
        actionResult: toLoggableActionResult(result),
      });

      return result;
    } finally {
      trackActionExecutionMetrics({ durationMs, properties: telemetryProperties });
    }
  }

  private async findEnabledAction(key: LogtoActionKey) {
    try {
      const action = await this.logtoConfigs.getAction(key);

      if (!action?.enabled) {
        return;
      }

      return action;
    } catch (error: unknown) {
      if (
        error instanceof RequestError &&
        error.code === 'entity.not_exists_with_id' &&
        error.status === 404
      ) {
        return;
      }

      throw error;
    }
  }

  private async isActionsEnabledByQuota(): Promise<boolean> {
    const { isCloud } = EnvSet.values;

    if (!isCloud || this.tenantId === adminTenantId) {
      return true;
    }

    const { quota } = await this.subscription.getSubscriptionData();

    return quota.actionsEnabled;
  }
}
/* eslint-enable max-lines */
