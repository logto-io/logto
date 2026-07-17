import { LogtoInlineHookKey } from '@logto/schemas';

import { InlineHookAction } from './types';
import {
  getInlineHookApiPath,
  getInlineHookPagePath,
  getInlineHookSWRKey,
  inlineHooksApiPath,
  inlineHooksPath,
  invalidateInlineHookCache,
  invalidateInlineHooksCache,
} from './utils';

describe('inline hook paths and cache helpers', () => {
  it('builds list and detail paths', () => {
    expect(getInlineHookPagePath()).toBe(inlineHooksPath);
    expect(getInlineHookPagePath(LogtoInlineHookKey.PostSignIn, InlineHookAction.Create)).toBe(
      `${inlineHooksPath}/${LogtoInlineHookKey.PostSignIn}/${InlineHookAction.Create}`
    );
    expect(getInlineHookApiPath()).toBe(inlineHooksApiPath);
    expect(getInlineHookSWRKey(LogtoInlineHookKey.PostSignIn)).toBe(
      `${inlineHooksApiPath}/${LogtoInlineHookKey.PostSignIn}`
    );
  });

  it('invalidates both list and detail caches', async () => {
    const mutate = jest.fn().mockResolvedValue(null);

    await invalidateInlineHooksCache(mutate);

    await invalidateInlineHookCache(mutate, LogtoInlineHookKey.PostSignIn);

    expect(mutate).toHaveBeenCalledTimes(3);
    expect(mutate).toHaveBeenCalledWith(inlineHooksApiPath);
    expect(mutate).toHaveBeenCalledWith(`${inlineHooksApiPath}/${LogtoInlineHookKey.PostSignIn}`);
  });
});
