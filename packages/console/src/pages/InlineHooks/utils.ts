import { type LogtoInlineHookKey } from '@logto/schemas';

import { type InlineHookAction } from './types';

export const inlineHooksPath = '/inline-hooks';
export const inlineHooksApiPath = 'api/configs/inline-hooks';
export const inlineHooksSWRKey = inlineHooksApiPath;

export const getInlineHookPagePath = (hookType?: LogtoInlineHookKey, action?: InlineHookAction) =>
  hookType && action ? `${inlineHooksPath}/${hookType}/${action}` : inlineHooksPath;

export const getInlineHookApiPath = (hookType?: LogtoInlineHookKey) =>
  hookType ? `${inlineHooksApiPath}/${hookType}` : inlineHooksApiPath;

export const getInlineHookSWRKey = (hookType: LogtoInlineHookKey) => getInlineHookApiPath(hookType);

type CacheMutator = (key: string) => Promise<unknown>;

export const invalidateInlineHooksCache = async (mutate: CacheMutator) => mutate(inlineHooksSWRKey);

export const invalidateInlineHookCache = async (
  mutate: CacheMutator,
  hookType: LogtoInlineHookKey
) => {
  await Promise.all([invalidateInlineHooksCache(mutate), mutate(getInlineHookSWRKey(hookType))]);
};
