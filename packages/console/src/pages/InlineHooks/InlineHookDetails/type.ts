import {
  LogtoInlineHookKey,
  inlineHookExecutionErrorPolicies,
  type InlineHookExecutionErrorPolicy,
} from '@logto/schemas';
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

/**
 * Post first-factor verification always rejects invalid credentials when the
 * script fails. Exposing `allow` would promise a continue path Core does not
 * provide, so only `block` is selectable for that hook.
 */
export const getOnExecutionErrorOptions = (
  hookType: LogtoInlineHookKey
): readonly InlineHookExecutionErrorPolicy[] => {
  if (hookType === LogtoInlineHookKey.PostFirstFactorVerification) {
    return ['block'];
  }

  return inlineHookExecutionErrorPolicies;
};
