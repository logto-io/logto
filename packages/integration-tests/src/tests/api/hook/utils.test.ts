import type { Hook } from '@logto/schemas';
import { InteractionHookEvent } from '@logto/schemas';

const { jest } = import.meta;

const { assertHookLogResult } = await import('./utils.js');

const { advanceTimersByTimeAsync } = jest as typeof jest & {
  advanceTimersByTimeAsync: (ms: number) => Promise<void>;
};

describe('assertHookLogResult', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('waits through the full observation window before asserting no hook log', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );

    try {
      const assertionPromise = assertHookLogResult(
        { id: 'hook-id', signingKey: 'signing-key' } as Hook,
        InteractionHookEvent.PostSignIn,
        {
          toBeUndefined: true,
        }
      );

      await advanceTimersByTimeAsync(4900);
      await assertionPromise;

      expect(fetchSpy).toHaveBeenCalledTimes(50);
    } finally {
      fetchSpy.mockRestore();
    }
  });
});
