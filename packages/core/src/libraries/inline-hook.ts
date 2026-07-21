/* eslint-disable max-lines -- Inline hook runtime, policy, and audit behavior share the same library. */
import { appInsights } from '@logto/app-insights/node';
import {
  adminTenantId,
  inlineHook as inlineHookLog,
  LogResult,
  LogtoInlineHookKey,
  type InlineHookExecutionErrorPolicy,
  type InlineHookExecutionRequestBody,
} from '@logto/schemas';
import { got, HTTPError } from 'got';
import { ZodError } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import type { LogtoConfigLibrary } from '#src/libraries/logto-config.js';
import type { SubscriptionLibrary } from '#src/libraries/subscription.js';
import type { LogContext, LogPayload } from '#src/middleware/koa-audit-log.js';
import { parseAzureFunctionsResponseError } from '#src/utils/custom-jwt/index.js';
import {
  buildLocalVmErrorBody,
  LocalVmError,
  runScriptFunctionInLocalVm,
} from '#src/utils/local-vm/index.js';

import {
  buildSafeInlineHookErrorSummary,
  buildSafeInlineHookTelemetryError,
  getInlineHookSensitiveValues,
  sanitizeInlineHookEvent,
  sanitizeInlineHookResult,
} from './inline-hook-sanitization.js';

const inlineHookFunctionName = 'runInlineHook';
const defaultInlineHookExecutionErrorPolicy = 'block' satisfies InlineHookExecutionErrorPolicy;
/**
 * Azure Function vm2 timeout is 3000ms. Use a slightly higher HTTP deadline so the
 * client can surface Function-side failures instead of racing the sandbox limit.
 */
const remoteInlineHookRequestTimeout = 5000;

export type InlineHookExecutionErrorFallback = {
  action: 'rejectInvalidCredentials';
};

export type InlineHookExecutionErrorPolicyDecision =
  | {
      action: 'throw';
      error: RequestError;
    }
  | {
      action: 'continue';
    }
  | InlineHookExecutionErrorFallback;

type InlineHookScriptPayload<Event> = {
  event: Event;
  environmentVariables?: Record<string, string>;
};

type InlineHookRunnerData<Event> = {
  script: string;
  event: Event;
  environmentVariables?: Record<string, string>;
};

type InlineHookEventSource<Event> =
  | {
      event: Event;
    }
  | {
      getEvent: () => Promise<Event>;
    };

type RunInlineHookData<Event> = InlineHookEventSource<Event> & {
  key: LogtoInlineHookKey;
  auditContext: Pick<LogContext, 'createLog'> &
    Pick<LogPayload, 'applicationId' | 'sessionId' | 'userId'>;
};

type InlineHookExecutionErrorHandlingData = {
  key: LogtoInlineHookKey;
  onExecutionError?: InlineHookExecutionErrorPolicy;
};

type InlineHookExecutionOutcome =
  | { status: 'success'; result: unknown }
  | { status: 'error'; error: unknown };

const inlineHookLogTypes = Object.freeze({
  [LogtoInlineHookKey.PostFirstFactorVerification]: inlineHookLog.Type.PostFirstFactorVerification,
  [LogtoInlineHookKey.PostSignIn]: inlineHookLog.Type.PostSignIn,
} satisfies Record<LogtoInlineHookKey, inlineHookLog.Type>);

const getInlineHookLogKey = (key: LogtoInlineHookKey): inlineHookLog.LogKey =>
  `${inlineHookLog.prefix}.${inlineHookLogTypes[key]}`;

const inlineHookResultActions = Object.freeze({
  [LogtoInlineHookKey.PostFirstFactorVerification]: ['createUser', 'updateUser'],
  [LogtoInlineHookKey.PostSignIn]: ['updateUser'],
} satisfies Record<LogtoInlineHookKey, readonly string[]>);

const getInlineHookResultActionSummary = (key: LogtoInlineHookKey, result: unknown) => {
  try {
    if (typeof result !== 'object' || result === null) {
      return { decision: 'noop' };
    }

    const rawAction: unknown = Reflect.get(result, 'action');

    if (typeof rawAction !== 'string') {
      return { decision: 'noop' };
    }

    const action = inlineHookResultActions[key].find((candidate) => candidate === rawAction);

    return action ? { action, decision: action } : { decision: 'invalid' };
  } catch {
    return { decision: 'invalid' };
  }
};

const getInlineHookErrorFallback = (
  key: LogtoInlineHookKey
): InlineHookExecutionErrorPolicyDecision => {
  switch (key) {
    case LogtoInlineHookKey.PostFirstFactorVerification: {
      return { action: 'rejectInvalidCredentials' };
    }
    case LogtoInlineHookKey.PostSignIn: {
      return {
        action: 'throw',
        error: new RequestError({ code: 'session.verification_failed', status: 400 }),
      };
    }
  }
};

export const getInlineHookExecutionErrorPolicyDecision = ({
  key,
  onExecutionError = defaultInlineHookExecutionErrorPolicy,
}: InlineHookExecutionErrorHandlingData): InlineHookExecutionErrorPolicyDecision => {
  if (onExecutionError === 'allow') {
    return key === LogtoInlineHookKey.PostFirstFactorVerification
      ? { action: 'rejectInvalidCredentials' }
      : { action: 'continue' };
  }

  return getInlineHookErrorFallback(key);
};

const applyInlineHookExecutionErrorPolicyDecision = (
  decision: InlineHookExecutionErrorPolicyDecision
) => {
  if (decision.action === 'throw') {
    throw decision.error;
  }

  return decision.action === 'rejectInvalidCredentials' ? decision : undefined;
};

export class InlineHookLibrary {
  static async runScriptInLocalVm<Event>({
    script,
    event,
    environmentVariables,
  }: InlineHookRunnerData<Event>): Promise<unknown> {
    try {
      const payload: InlineHookScriptPayload<Event> = {
        event,
        environmentVariables,
      };

      return await runScriptFunctionInLocalVm(script, inlineHookFunctionName, payload);
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
   * Shared entry point for production `runHook()` and Management API dry runs.
   * Cloud always executes remotely; OSS / self-hosted always uses the local VM.
   * Cloud remote failures must never fall back to the local VM.
   */
  async executeScript({
    script,
    hookType,
    event,
    environmentVariables,
  }: {
    script: string;
    hookType: LogtoInlineHookKey;
    // Production events are typed domain objects; dry-run uses JSON via the guard.
    event: unknown;
    environmentVariables?: Record<string, string>;
  }): Promise<unknown> {
    const payload = { script, hookType, event, environmentVariables };

    if (EnvSet.values.isCloud) {
      return this.runScriptRemotely(payload);
    }

    return InlineHookLibrary.runScriptInLocalVm(payload);
  }

  /**
   * For Logto Cloud use only. Run the inline hook script remotely in an isolated environment.
   * For OSS version, use @see InlineHookLibrary.runScriptInLocalVm instead.
   */
  async runScriptRemotely({
    script,
    hookType,
    event,
    environmentVariables,
  }: {
    script: string;
    hookType: LogtoInlineHookKey;
    event: unknown;
    environmentVariables?: Record<string, string>;
  }): Promise<unknown> {
    const { azureFunctionUntrustedAppKey, azureFunctionUntrustedAppEndpoint } = EnvSet.values;

    if (!this.isRegionalAzureFunctionAppConfigured) {
      throw new RequestError(
        { code: 'inline_hook.general', status: 422 },
        { message: 'Remote inline hook runner is not configured.' }
      );
    }

    try {
      return await got
        .post(new URL('/api/inline-hooks', azureFunctionUntrustedAppEndpoint), {
          json: {
            script,
            hookType,
            event,
            environmentVariables,
          },
          headers: {
            'x-functions-key': azureFunctionUntrustedAppKey,
          },
          // Got@14 expects a Delays object; bound the whole request slightly above the AF VM timeout.
          timeout: { request: remoteInlineHookRequestTimeout },
        })
        .json<unknown>();
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        throw parseAzureFunctionsResponseError(error);
      }

      throw error;
    }
  }

  async runHook<Event>({
    key,
    auditContext: { createLog, ...auditContext },
    ...eventSource
  }: RunInlineHookData<Event>): Promise<unknown> {
    if (!EnvSet.values.isDevFeaturesEnabled) {
      return;
    }

    const inlineHook = await this.findEnabledInlineHook(key);

    if (!inlineHook) {
      return;
    }

    if (!(await this.isInlineHooksEnabledByQuota())) {
      return;
    }

    const event = 'getEvent' in eventSource ? await eventSource.getEvent() : eventSource.event;
    const executionPayload: InlineHookExecutionRequestBody = {
      script: inlineHook.script,
      hookType: key,
      // Production events are always JSON-serializable payloads from Core call sites.
      // eslint-disable-next-line no-restricted-syntax -- Generic Event is wider than Json; cast at the shared execution boundary.
      event: event as InlineHookExecutionRequestBody['event'],
      environmentVariables: inlineHook.environmentVariables,
    };
    const sensitiveValues = getInlineHookSensitiveValues(executionPayload);
    const onExecutionError = inlineHook.onExecutionError ?? defaultInlineHookExecutionErrorPolicy;
    const runtimeLocation = EnvSet.values.isCloud ? 'remote' : 'local';
    const startedAt = Date.now();
    const log = createLog(getInlineHookLogKey(key), { independent: true });

    log.append({
      ...auditContext,
      tenantId: this.tenantId,
      hookType: key,
      runtimeLocation,
      onExecutionError,
      event: sanitizeInlineHookEvent(event, sensitiveValues),
    });

    const executionOutcome = await this.executeScript(executionPayload).then<
      InlineHookExecutionOutcome,
      InlineHookExecutionOutcome
    >(
      (result) => ({ status: 'success', result }),
      (error: unknown) => ({ status: 'error', error })
    );

    if (executionOutcome.status === 'error') {
      const { error } = executionOutcome;
      const decision = getInlineHookExecutionErrorPolicyDecision({ key, onExecutionError });

      log.append({
        result: LogResult.Error,
        durationMs: Date.now() - startedAt,
        decision: decision.action,
        errorPolicyOutcome: decision.action === 'continue' ? 'allow' : 'block',
        inlineHookError: buildSafeInlineHookErrorSummary(error, sensitiveValues),
      });

      void appInsights.trackException(buildSafeInlineHookTelemetryError(error, sensitiveValues));

      return applyInlineHookExecutionErrorPolicyDecision(decision);
    }

    const { result } = executionOutcome;
    const actionSummary = getInlineHookResultActionSummary(key, result);

    log.append({
      durationMs: Date.now() - startedAt,
      ...actionSummary,
      inlineHookResult: sanitizeInlineHookResult(result, sensitiveValues),
    });

    return result;
  }

  private async findEnabledInlineHook(key: LogtoInlineHookKey) {
    try {
      const inlineHook = await this.logtoConfigs.getInlineHook(key);

      if (!inlineHook?.enabled) {
        return;
      }

      return inlineHook;
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

  private async isInlineHooksEnabledByQuota(): Promise<boolean> {
    const { isCloud } = EnvSet.values;

    if (!isCloud || this.tenantId === adminTenantId) {
      return true;
    }

    const { quota } = await this.subscription.getSubscriptionData();

    return quota.inlineHooksEnabled;
  }
}
/* eslint-enable max-lines */
