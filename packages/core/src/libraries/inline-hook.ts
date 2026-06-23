import { type LogtoInlineHookKey } from '@logto/schemas';
import { ZodError } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import type { LogtoConfigLibrary } from '#src/libraries/logto-config.js';
import {
  buildLocalVmErrorBody,
  LocalVmError,
  runScriptFunctionInLocalVm,
} from '#src/utils/custom-jwt/index.js';

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

  constructor(private readonly logtoConfigs: LogtoConfigLibrary) {}

  async runHook<Event>({
    key,
    event,
  }: {
    key: LogtoInlineHookKey;
    event: Event;
  }): Promise<unknown> {
    if (!EnvSet.values.isDevFeaturesEnabled) {
      return;
    }

    const inlineHook = await this.logtoConfigs.getInlineHook(key);

    if (!inlineHook?.enabled) {
      return;
    }

    return InlineHookLibrary.runScriptInLocalVm({
      script: inlineHook.script,
      event,
      environmentVariables: inlineHook.environmentVariables,
    });
  }
}
