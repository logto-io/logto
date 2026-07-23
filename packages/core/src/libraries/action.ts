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
import {
  legacyActionFunctionName,
  wrapActionScriptForLegacyRunner,
} from '#src/utils/action-script-compatibility.js';
import { parseAzureFunctionsResponseError } from '#src/utils/custom-jwt/index.js';
import {
  buildLocalVmErrorBody,
  LocalVmError,
  runScriptFunctionInLocalVm,
} from '#src/utils/local-vm/index.js';

import {
  buildSafeActionErrorSummary,
  buildSafeActionTelemetryError,
  getActionSensitiveValues,
  sanitizeActionEvent,
  sanitizeActionResult,
} from './action-sanitization.js';
import {
  getActionExecutionErrorTelemetryProperties,
  getActionResultTelemetryProperties,
  type ActionRuntimeLocation,
  trackActionExecutionMetrics,
} from './action-telemetry.js';

const defaultActionExecutionErrorPolicy = 'block' satisfies ActionExecutionErrorPolicy;
/**
 * Azure Function vm2 timeout is 3000ms. Use a slightly higher HTTP deadline so the
 * client can surface Function-side failures instead of racing the sandbox limit.
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
    Pick<LogPayload, 'applicationId' | 'sessionId' | 'userId'>;
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

const actionResultActions = Object.freeze({
  [LogtoActionKey.PostFirstFactorVerification]: ['createUser', 'updateUser'],
  [LogtoActionKey.PostSignIn]: ['updateUser'],
} satisfies Record<LogtoActionKey, readonly string[]>);

const getActionResultActionSummary = (key: LogtoActionKey, result: unknown) => {
  try {
    if (typeof result !== 'object' || result === null) {
      return { decision: 'noop' };
    }

    const rawAction: unknown = Reflect.get(result, 'action');

    if (typeof rawAction !== 'string') {
      return { decision: 'noop' };
    }

    const action = actionResultActions[key].find((candidate) => candidate === rawAction);

    if (!action) {
      return { decision: 'invalid' };
    }

    if (key === LogtoActionKey.PostSignIn && action === 'updateUser') {
      const userDescriptor = Object.getOwnPropertyDescriptor(result, 'user');

      if (
        userDescriptor === undefined ||
        ('value' in userDescriptor && userDescriptor.value === undefined)
      ) {
        return { decision: 'noop' };
      }
    }

    return { action, decision: action };
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
  static async runScriptInLocalVm<Event>({
    script,
    event,
    environmentVariables,
  }: ActionRunnerData<Event>): Promise<unknown> {
    try {
      const payload: ActionScriptPayload<Event> = {
        event,
        environmentVariables,
      };

      return await runScriptFunctionInLocalVm(
        wrapActionScriptForLegacyRunner(script),
        legacyActionFunctionName,
        payload
      );
    } catch (error: unknown) {
      if (error instanceof LocalVmError) {
        throw error;
      }

      if (error instanceof ZodError) {
        throw new LocalVmError(
          {
            message: 'Invalid input',
            errors: error.errors,
          },
          400
        );
      }

      throw new LocalVmError(
        buildLocalVmErrorBody(error),
        error instanceof SyntaxError || error instanceof TypeError ? 422 : 500
      );
    }
  }

  constructor(
    private readonly tenantId: string,
    private readonly logtoConfigs: LogtoConfigLibrary,
    private readonly subscription: SubscriptionLibrary
  ) {}

  get isRegionalAzureFunctionAppConfigured(): boolean {
    const { azureFunctionUntrustedAppKey, azureFunctionUntrustedAppEndpoint } = EnvSet.values;

    return Boolean(azureFunctionUntrustedAppKey && azureFunctionUntrustedAppEndpoint);
  }

  /**
   * Shared entry point for production `runAction()` and Management API dry runs.
   * Cloud always executes remotely; OSS / self-hosted always uses the local VM.
   * Cloud remote failures must never fall back to the local VM.
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

    return ActionLibrary.runScriptInLocalVm(payload);
  }

  /**
   * For Logto Cloud use only. Run the action script remotely in an isolated environment.
   * For OSS version, use @see ActionLibrary.runScriptInLocalVm instead.
   */
  async runScriptRemotely({
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
        // Keep the legacy endpoint and payload field until the external Azure runner migrates.
        .post(new URL('/api/inline-hooks', azureFunctionUntrustedAppEndpoint), {
          json: {
            script: wrapActionScriptForLegacyRunner(script),
            hookType: actionType,
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

  async runAction<Event>({
    key,
    auditContext: { createLog, ...auditContext },
    ...eventSource
  }: RunActionData<Event>): Promise<unknown> {
    if (!EnvSet.values.isDevFeaturesEnabled) {
      return;
    }

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
    const sensitiveValues = getActionSensitiveValues(executionPayload);
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
      event: sanitizeActionEvent(event, sensitiveValues),
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
          actionError: buildSafeActionErrorSummary(error, sensitiveValues),
        });

        void appInsights.trackException(buildSafeActionTelemetryError(error, sensitiveValues), {
          properties: telemetryProperties,
        });

        return applyActionExecutionErrorPolicyDecision(decision);
      }

      const { result } = executionOutcome;
      const actionSummary = getActionResultActionSummary(key, result);

      log.append({
        durationMs,
        ...actionSummary,
        actionResult: sanitizeActionResult(result, sensitiveValues),
      });

      return result;
    } finally {
      trackActionExecutionMetrics({ durationMs, properties: telemetryProperties });
    }
  }

  private async findEnabledAction(key: LogtoActionKey) {
    try {
      const action = await this.logtoConfigs.getAction(key);

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Preserve the legacy no-config fallback for isolated library implementations.
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

    // Keep the legacy key because it is part of the Logto Cloud subscription wire contract.
    return quota.inlineHooksEnabled;
  }
}
/* eslint-enable max-lines */
