import { LogtoActionKey } from '@logto/schemas';

import { ActionPageMode } from './types';
import {
  getActionApiPath,
  getActionPagePath,
  getActionSWRKey,
  actionsApiPath,
  actionsPath,
  invalidateActionCache,
  invalidateActionsCache,
} from './utils';

describe('action paths and cache helpers', () => {
  it('builds list and detail paths', () => {
    expect(getActionPagePath()).toBe(actionsPath);
    expect(getActionPagePath(LogtoActionKey.PostSignIn, ActionPageMode.Create)).toBe(
      `${actionsPath}/${LogtoActionKey.PostSignIn}/${ActionPageMode.Create}`
    );
    expect(getActionApiPath()).toBe(actionsApiPath);
    expect(getActionSWRKey(LogtoActionKey.PostSignIn)).toBe(
      `${actionsApiPath}/${LogtoActionKey.PostSignIn}`
    );
  });

  it('invalidates both list and detail caches', async () => {
    const mutate = jest.fn().mockResolvedValue(null);

    await invalidateActionsCache(mutate);

    await invalidateActionCache(mutate, LogtoActionKey.PostSignIn);

    expect(mutate).toHaveBeenCalledTimes(3);
    expect(mutate).toHaveBeenCalledWith(actionsApiPath);
    expect(mutate).toHaveBeenCalledWith(`${actionsApiPath}/${LogtoActionKey.PostSignIn}`);
  });
});
