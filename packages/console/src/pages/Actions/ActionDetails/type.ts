import {
  LogtoActionKey,
  actionExecutionErrorPolicies,
  type ActionExecutionErrorPolicy,
} from '@logto/schemas';
import { z } from 'zod';

import { ActionPageMode } from '../types';

export type ActionForm = {
  actionType: LogtoActionKey;
  script: string;
  enabled: boolean;
  onExecutionError: ActionExecutionErrorPolicy;
  environmentVariables?: Array<{ key: string; value: string }>;
  contextSample?: string;
};

export const pageParamsGuard = z.object({
  actionType: z.nativeEnum(LogtoActionKey),
  mode: z.nativeEnum(ActionPageMode),
});

/**
 * Post first-factor verification always rejects invalid credentials when the
 * script fails. Exposing `allow` would promise a continue path Core does not
 * provide, so only `block` is selectable for that action.
 */
export const getOnExecutionErrorOptions = (
  actionType: LogtoActionKey
): readonly ActionExecutionErrorPolicy[] => {
  if (actionType === LogtoActionKey.PostFirstFactorVerification) {
    return ['block'];
  }

  return actionExecutionErrorPolicies;
};
