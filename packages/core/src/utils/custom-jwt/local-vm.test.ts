import {
  buildLocalVmErrorBody,
  localVmTimeoutErrorCode,
  LocalVmTimeoutError,
  runScriptFunctionInLocalVm,
} from './local-vm.js';

const { jest } = import.meta;

describe('runScriptFunctionInLocalVm', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('throws timeout error when script evaluation exceeds the deadline', async () => {
    await expect(
      runScriptFunctionInLocalVm(
        `
          while (true) {}
          const getCustomJwtClaims = () => ({});
        `,
        'getCustomJwtClaims',
        {},
        { timeout: 30 }
      )
    ).rejects.toMatchObject({
      code: localVmTimeoutErrorCode,
      timeout: 30,
    });
  });

  it('throws timeout error when synchronous function execution exceeds the deadline', async () => {
    await expect(
      runScriptFunctionInLocalVm(
        `
          const getCustomJwtClaims = () => {
            while (true) {}
          };
        `,
        'getCustomJwtClaims',
        {},
        { timeout: 30 }
      )
    ).rejects.toMatchObject({
      code: localVmTimeoutErrorCode,
      timeout: 30,
    });
  });

  it('aborts fetch and throws timeout error when async execution exceeds the deadline', async () => {
    const fetchMock = jest.spyOn(globalThis, 'fetch').mockImplementation(async (_input, init) => {
      const { signal } = init ?? {};

      if (!signal) {
        throw new Error('Expected abort signal');
      }

      return new Promise<Response>((_resolve, reject) => {
        signal.addEventListener('abort', () => {
          reject(signal.reason instanceof Error ? signal.reason : new Error('Aborted'));
        });
      });
    });

    await expect(
      runScriptFunctionInLocalVm(
        `
          const getCustomJwtClaims = async () => {
            await fetch('https://example.com/slow');
            return {};
          };
        `,
        'getCustomJwtClaims',
        {},
        { timeout: 30 }
      )
    ).rejects.toMatchObject({
      code: localVmTimeoutErrorCode,
      timeout: 30,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] ?? [];
    const signal = init?.signal;

    expect(signal?.aborted).toBe(true);
    expect(signal?.reason).toBeInstanceOf(LocalVmTimeoutError);
  });

  it('aborts pending fetches after function execution is complete', async () => {
    const fetchMock = jest.spyOn(globalThis, 'fetch').mockImplementation(async (_input, init) => {
      return new Promise<Response>(() => {
        // Keep the request pending until the runner cleanup aborts it.
      });
    });

    await expect(
      runScriptFunctionInLocalVm(
        `
          const getCustomJwtClaims = () => {
            fetch('https://example.com/fire-and-forget');
            return { ok: true };
          };
        `,
        'getCustomJwtClaims',
        {},
        { timeout: 300 }
      )
    ).resolves.toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] ?? [];
    const signal = init?.signal;

    expect(signal?.aborted).toBe(true);
  });
});

describe('buildLocalVmErrorBody', () => {
  it('returns structured timeout error body', () => {
    const error = new LocalVmTimeoutError(3000);

    expect(buildLocalVmErrorBody(error)).toEqual({
      message: 'Script execution timed out after 3000ms',
      error: {
        code: localVmTimeoutErrorCode,
        message: 'Script execution timed out after 3000ms',
        timeout: 3000,
      },
    });
  });
});
