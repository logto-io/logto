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
import { got, HTTPError } from 'got';
import { ZodError } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import type { LogtoConfigLibrary } from '#src/libraries/logto-config.js';
import type { SubscriptionLibrary } from '#src/libraries/subscription.js';
import type { LogContext, LogPayload } from '#src/middleware/koa-audit-log.js';
import { parseAzureFunctionsResponseError } from '#src/utils/custom-jwt/index.js';
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
  runScriptOnCloud,
  runScriptOnWorkerPool,
  ScriptExecutionError,
} from './script-runner/index.js';

const actionFunctionName = 'runAction';
const defaultActionExecutionErrorPolicy = 'block' satisfies ActionExecutionErrorPolicy;
/**
 * Azure Function vm2 timeout is 3000ms. Use a slightly higher HTTP deadline so the
 * client can surface Function-side failures instead of racing the sandbox limit.
 *
 * Only used by the legacy Azure Functions path; the Cloud script runner owns its own budget.
 */
const remoteActionRequestTimeout = 5000;

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

/**
 * The telemetry label for where a run executes.
 *
 * Deliberately kept in sync with the branch {@link ActionLibrary.runScriptRemotely} takes: while
 * both remote runtimes coexist behind `isDevFeaturesEnabled`, splitting `azure` from `cloud` is
 * what makes the share of traffic already served by the Cloud script runner readable in the
 * metric. Collapses back to `azure`-free once LOG-13958 removes the Azure Functions path.
 */
const getTelemetryRuntimeLocation = (): ActionRuntimeLocation => {
  if (!EnvSet.values.isCloud) {
    return 'local';
  }

  return EnvSet.values.isDevFeaturesEnabled ? 'cloud' : 'azure';
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

  get isRegionalAzureFunctionAppConfigured(): boolean {
    const { azureFunctionUntrustedAppKey, azureFunctionUntrustedAppEndpoint } = EnvSet.values;

    return Boolean(azureFunctionUntrustedAppKey && azureFunctionUntrustedAppEndpoint);
  }

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
    isTest,
  }: {
    script: string;
    actionType: LogtoActionKey;
    // Production events are typed domain objects; dry-run uses JSON via the guard.
    event: unknown;
    environmentVariables?: Record<string, string>;
    /**
     * Whether this is a dry run. Set by the Management API test route, never by `runAction()`, so
     * the Cloud runner can tell a Console "test" apart from production traffic. The local runners
     * ignore it.
     */
    isTest?: boolean;
  }): Promise<unknown> {
    const payload = { script, actionType, event, environmentVariables };

    if (EnvSet.values.isCloud) {
      return this.runScriptRemotely(payload, isTest);
    }

    return ActionLibrary.runScriptInLocalVm(payload, this.tenantId);
  }

  /**
   * For Logto Cloud use only. Run the action script remotely in an isolated environment.
   * For OSS version, use @see ActionLibrary.runScriptInLocalVm instead.
   */
  async runScriptRemotely(
    data: {
      script: string;
      actionType: LogtoActionKey;
      event: unknown;
      environmentVariables?: Record<string, string>;
    },
    /** Whether this is a dry run. The legacy Azure Functions path has no notion of it. */
    isTest?: boolean
  ): Promise<unknown> {
    // TODO (LOG-13958): drop the legacy Azure Functions path and the gate once the Cloud script
    // runner has been manually verified and released. `scriptRunnerEndpoint` additionally covers a
    // region where the Worker endpoint is not injected yet.
    const { isDevFeaturesEnabled, scriptRunnerEndpoint } = EnvSet.values;

    if (!isDevFeaturesEnabled || !scriptRunnerEndpoint) {
      return this.runScriptOnAzureFunction(data);
    }

    const { script, event, environmentVariables } = data;

    /**
     * `actionType` selects the script on this side and is deliberately not forwarded — anything
     * in `payload` becomes a visible field of the script's `runAction` argument, and the
     * authoring contract promises `{ event, environmentVariables }` only.
     */
    const payload: ActionScriptPayload<unknown> = { event, environmentVariables };

    const result = await runScriptOnCloud({
      cloudConnection: this.cloudConnection,
      endpoint: scriptRunnerEndpoint,
      tenantId: this.tenantId,
      script,
      entry: actionFunctionName,
      payload,
      isTest,
    });

    if (!result.ok) {
      throw buildCloudScriptFailureError(result);
    }

    return result.value;
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
    const telemetryRuntimeLocation = getTelemetryRuntimeLocation();
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

  /** The pre-script-runner remote path, still serving production until the gate above lifts. */
  private async runScriptOnAzureFunction({
    script,
    actionType,
    event,
    environmentVariables,
  }: {
    script: string;
    actionType: LogtoActionKey;
    event: unknown;
    environmentVariables?: Record<string, string>;
  }): Promise<unknown> {
    const { azureFunctionUntrustedAppKey, azureFunctionUntrustedAppEndpoint } = EnvSet.values;

    if (!this.isRegionalAzureFunctionAppConfigured) {
      throw new RequestError(
        { code: 'action.general', status: 422 },
        { message: 'Remote action runner is not configured.' }
      );
    }

    try {
      return await got
        // The remote runner must invoke `runAction` from the supplied script.
        .post(new URL('/api/actions', azureFunctionUntrustedAppEndpoint), {
          json: {
            script,
            actionType,
            event,
            environmentVariables,
          },
          headers: {
            'x-functions-key': azureFunctionUntrustedAppKey,
          },
          // Got@14 expects a Delays object; bound the whole request slightly above the AF VM timeout.
          timeout: { request: remoteActionRequestTimeout },
        })
        .json<unknown>();
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        throw parseAzureFunctionsResponseError(error);
      }

      throw error;
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
