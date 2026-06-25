import { runScriptFunctionInLocalVm } from './index.js';

const { jest } = import.meta;

describe('runScriptFunctionInLocalVm', () => {
  it('executes async scripts and returns the result', async () => {
    await expect(
      runScriptFunctionInLocalVm(
        `
          const testFn = async ({ value }) => ({
            doubled: value * 2,
          });
        `,
        'testFn',
        { value: 21 }
      )
    ).resolves.toEqual({ doubled: 42 });
  });

  it('rejects when async script execution exceeds the wall-clock timeout', async () => {
    jest.useFakeTimers();

    try {
      const promise = runScriptFunctionInLocalVm(
        `
          const testFn = async () => new Promise(() => {});
        `,
        'testFn',
        {}
      );

      jest.advanceTimersByTime(3000);

      await expect(promise).rejects.toThrow('Script execution timed out after 3000ms');
    } finally {
      jest.useRealTimers();
    }
  });

  it('aborts in-flight fetch when the wall-clock timeout is reached', async () => {
    jest.useFakeTimers();

    const fetchMock = jest.fn(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('The operation was aborted.', 'AbortError'));
          });
        })
    );
    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchMock as typeof fetch;

    try {
      const promise = runScriptFunctionInLocalVm(
        `
          const testFn = async () => fetch('https://example.com');
        `,
        'testFn',
        {}
      );

      jest.advanceTimersByTime(3000);

      await expect(promise).rejects.toThrow('Script execution timed out after 3000ms');
      expect(fetchMock).toHaveBeenCalledWith(
        'https://example.com',
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      );
      expect(fetchMock.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);

      const unhandledRejections: unknown[] = [];
      const handler = (reason: unknown) => {
        unhandledRejections.push(reason);
      };
      process.on('unhandledRejection', handler);
      await Promise.resolve();
      process.off('unhandledRejection', handler);
      expect(unhandledRejections).toEqual([]);
    } finally {
      globalThis.fetch = originalFetch;
      jest.useRealTimers();
    }
  });
});
