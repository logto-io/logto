import { appInsights } from '@logto/app-insights/node';
import {
  adminTenantId,
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
import { parseAzureFunctionsResponseError } from '#src/utils/custom-jwt/index.js';
import {
  buildLocalVmErrorBody,
  LocalVmError,
  runScriptFunctionInLocalVm,
} from '#src/utils/local-vm/index.js';

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

type InlineHookExecutionErrorHandlingData = {
  key: LogtoInlineHookKey;
  onExecutionError?: InlineHookExecutionErrorPolicy;
};

type InlineHookExecutionErrorTelemetryData<Event> = InlineHookExecutionErrorHandlingData & {
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

const buildInlineHookExecutionErrorTelemetryPayload = <Event>({
  key,
  event,
  error,
}: InlineHookExecutionErrorTelemetryData<Event> & {
  error: unknown;
}) => {
  const password =
    key === LogtoInlineHookKey.PostFirstFactorVerification
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

const handleInlineHookExecutionError = (data: InlineHookExecutionErrorHandlingData) => {
  const decision = getInlineHookExecutionErrorPolicyDecision(data);

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
  async executeScript(payload: InlineHookExecutionRequestBody): Promise<unknown> {
    if (EnvSet.values.isCloud) {
      return this.runScriptRemotely(payload);
    }

    return InlineHookLibrary.runScriptInLocalVm(payload);
  }

  /**
   * For Logto Cloud use only. Run the inline hook script remotely in an isolated environment.
   * For OSS version, use @see InlineHookLibrary.runScriptInLocalVm instead.
   */
  async runScriptRemotely(payload: InlineHookExecutionRequestBody): Promise<unknown> {
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
          json: payload,
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

  async runHook({
    key,
    event,
  }: {
    key: LogtoInlineHookKey;
    event: InlineHookExecutionRequestBody['event'];
  }): Promise<unknown> {
    const inlineHook = await this.findEnabledInlineHook(key);

    if (!inlineHook) {
      return;
    }

    if (!(await this.isInlineHooksEnabledByQuota())) {
      return;
    }

    try {
      return await this.executeScript({
        script: inlineHook.script,
        hookType: key,
        event,
        environmentVariables: inlineHook.environmentVariables,
      });
    } catch (error: unknown) {
      void appInsights.trackException(
        buildInlineHookExecutionErrorTelemetryPayload({ key, event, error })
      );

      return handleInlineHookExecutionError({
        key,
        onExecutionError: inlineHook.onExecutionError,
      });
    }
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
