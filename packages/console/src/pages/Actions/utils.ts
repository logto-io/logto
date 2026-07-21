import { type LogtoActionKey } from '@logto/schemas';

import { type ActionPageMode } from './types';

export const actionsPath = '/actions';
export const actionsApiPath = 'api/configs/actions';
export const actionsSWRKey = actionsApiPath;

export const getActionPagePath = (actionType?: LogtoActionKey, mode?: ActionPageMode) =>
  actionType && mode ? `${actionsPath}/${actionType}/${mode}` : actionsPath;

export const getActionApiPath = (actionType?: LogtoActionKey) =>
  actionType ? `${actionsApiPath}/${actionType}` : actionsApiPath;

export const getActionSWRKey = (actionType: LogtoActionKey) => getActionApiPath(actionType);

type CacheMutator = (key: string) => Promise<unknown>;

export const invalidateActionsCache = async (mutate: CacheMutator) => mutate(actionsSWRKey);

export const invalidateActionCache = async (mutate: CacheMutator, actionType: LogtoActionKey) => {
  await Promise.all([invalidateActionsCache(mutate), mutate(getActionSWRKey(actionType))]);
};
