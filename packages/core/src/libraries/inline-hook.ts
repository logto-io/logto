import { adminTenantId, type LogtoInlineHookKey } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import { ZodError } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import type { LogtoConfigLibrary } from '#src/libraries/logto-config.js';
import type { SubscriptionLibrary } from '#src/libraries/subscription.js';
import {
  buildLocalVmErrorBody,
  LocalVmError,
  runScriptFunctionInLocalVm,
} from '#src/utils/local-vm/index.js';

const inlineHookFunctionName = 'runInlineHook';

type InlineHookApiContext = {
  denyAccess: (message?: string) => never;
};

type InlineHookScriptPayload<Event> = {
  event: Event;
  environmentVariables?: Record<string, string>;
  api: InlineHookApiContext;
};

type InlineHookRunnerData<Event> = {
  script: string;
  event: Event;
  environmentVariables?: Record<string, string>;
};

const apiContext: InlineHookApiContext = Object.freeze({
  denyAccess: (message = 'Access denied') => {
    throw new LocalVmError(
      {
        message,
        error: {
          code: 'AccessDenied',
          message,
        },
      },
      403
    );
  },
});

const isAccessDeniedErrorBody = (body: unknown): boolean => {
  if (!body || typeof body !== 'object' || !('error' in body)) {
    return false;
  }

  const { error } = body;

  return (
    typeof error === 'object' && error !== null && 'code' in error && error.code === 'AccessDenied'
  );
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
        api: apiContext,
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

  async runHook<Event>({
    key,
    event,
  }: {
    key: LogtoInlineHookKey;
    event: Event;
  }): Promise<unknown> {
    const inlineHook = await this.findEnabledInlineHook(key);

    if (!inlineHook) {
      return;
    }

    if (!(await this.isInlineHooksEnabledByQuota())) {
      return;
    }

    try {
      return await InlineHookLibrary.runScriptInLocalVm({
        script: inlineHook.script,
        event,
        environmentVariables: inlineHook.environmentVariables,
      });
    } catch (error: unknown) {
      if (error instanceof LocalVmError) {
        const errorBody: unknown = await trySafe(async () => error.response.clone().json());

        if (isAccessDeniedErrorBody(errorBody)) {
          throw error;
        }
      }

      if (inlineHook.onExecutionError === 'allow') {
        return;
      }

      throw error;
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
