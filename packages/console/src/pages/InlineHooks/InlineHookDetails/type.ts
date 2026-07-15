import { LogtoInlineHookKey, type InlineHookExecutionErrorPolicy } from '@logto/schemas';
import { z } from 'zod';

import { InlineHookAction } from '../types';

export type InlineHookForm = {
  hookType: LogtoInlineHookKey;
  script: string;
  enabled: boolean;
  onExecutionError: InlineHookExecutionErrorPolicy;
  environmentVariables?: Array<{ key: string; value: string }>;
  contextSample?: string;
};

export const pageParamsGuard = z.object({
  hookType: z.nativeEnum(LogtoInlineHookKey),
  action: z.nativeEnum(InlineHookAction),
});

export { inlineHookExecutionErrorPolicies as onExecutionErrorOptions } from '@logto/schemas';
