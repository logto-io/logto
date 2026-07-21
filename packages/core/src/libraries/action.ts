import { appInsights } from '@logto/app-insights/node';
import { adminTenantId, LogtoActionKey, type ActionExecutionErrorPolicy } from '@logto/schemas';
import { got, HTTPError } from 'got';
import { ZodError } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import type { LogtoConfigLibrary } from '#src/libraries/logto-config.js';
import type { SubscriptionLibrary } from '#src/libraries/subscription.js';
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
};

type ActionExecutionErrorHandlingData = {
  key: LogtoActionKey;
  onExecutionError?: ActionExecutionErrorPolicy;
};

type ActionExecutionErrorTelemetryData<Event> = ActionExecutionErrorHandlingData & {
  event: Event;
};

const sensitiveValueReplacement = '[redacted]';

const getPostFirstFactorVerificationPassword = (event: unknown) => {
  if (
    typeof event === 'object' &&
    event !== null &&
    'password' in event &&
    typeof event.password === 'string'
  ) {
    return event.password;
  }
};

const redactSensitiveValue = (value: string, sensitiveValue: string) =>
  value.split(sensitiveValue).join(sensitiveValueReplacement);

const buildActionExecutionErrorTelemetryPayload = <Event>({
  key,
  event,
  error,
}: ActionExecutionErrorTelemetryData<Event> & {
  error: unknown;
}) => {
  const password =
    key === LogtoActionKey.PostFirstFactorVerification
      ? getPostFirstFactorVerificationPassword(event)
      : undefined;

  const sanitize = (value: string) => (password ? redactSensitiveValue(value, password) : value);

  const telemetryError = new Error(
    sanitize(error instanceof Error ? error.message : String(error))
  );

  if (error instanceof Error) {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Keep the original error type on the sanitized telemetry copy.
    telemetryError.name = error.name;
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Preserve the useful stack on the sanitized telemetry copy.
    telemetryError.stack = error.stack && sanitize(error.stack);
  }

  return telemetryError;
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

const handleActionExecutionError = (data: ActionExecutionErrorHandlingData) => {
  const decision = getActionExecutionErrorPolicyDecision(data);

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

  async runAction<Event>({ key, ...eventSource }: RunActionData<Event>): Promise<unknown> {
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

    try {
      return await this.executeScript({
        script: action.script,
        actionType: key,
        event,
        environmentVariables: action.environmentVariables,
      });
    } catch (error: unknown) {
      void appInsights.trackException(
        buildActionExecutionErrorTelemetryPayload({ key, event, error })
      );

      return handleActionExecutionError({
        key,
        onExecutionError: action.onExecutionError,
      });
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
