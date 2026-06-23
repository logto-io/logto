import { setTimeout as sleep } from 'node:timers/promises';
import { types } from 'node:util';
import { runInNewContext } from 'node:vm';

import { ResponseError } from '@withtyped/client';

/**
 * Extend the ResponseError from @withtyped/client.
 * This class is used to parse the error from the local VM to the WithTyped client response error.
 * So we can unify the error handling and display logic for both local VM and Cloud version.
 */
export class LocalVmError extends ResponseError {
  constructor(errorBody: Record<string, unknown>, statusCode: number) {
    super(
      new Response(
        new Blob([JSON.stringify(errorBody)], {
          type: 'application/json',
        }),
        {
          status: statusCode,
        }
      )
    );
  }
}

export const localVmTimeoutErrorCode = 'LocalVmTimeout';
const defaultLocalVmTimeout = 3000;

type LocalVmRunnerOptions = {
  timeout?: number;
};

export class LocalVmTimeoutError extends Error {
  readonly code = localVmTimeoutErrorCode;

  constructor(readonly timeout: number) {
    super(`Script execution timed out after ${timeout}ms`);
    this.name = 'LocalVmTimeoutError';
  }
}

const isNodeVmTimeoutError = (error: unknown) =>
  types.isNativeError(error) && error.message.startsWith('Script execution timed out after ');

const getRemainingTimeout = (deadline: number, timeoutError: LocalVmTimeoutError) => {
  const remainingTimeout = deadline - Date.now();

  if (remainingTimeout <= 0) {
    throw timeoutError;
  }

  return remainingTimeout;
};

const createAbortableFetch = (abortController: AbortController) => {
  const pendingFetches = new Set<Promise<Response>>();

  const abortableFetch: typeof fetch = async (...args) => {
    const [input, init] = args;
    const signal = init?.signal
      ? AbortSignal.any([abortController.signal, init.signal])
      : abortController.signal;
    const fetchPromise = fetch(input, { ...init, signal });

    pendingFetches.add(fetchPromise);
    void (async () => {
      try {
        await fetchPromise;
      } catch {
        // Fetch errors are surfaced to awaited script calls; this avoids unhandled rejections
        // when cleanup aborts fire-and-forget fetches.
      } finally {
        pendingFetches.delete(fetchPromise);
      }
    })();

    return fetchPromise;
  };

  return {
    fetch: abortableFetch,
    abortPendingFetches: (reason?: unknown) => {
      if (!abortController.signal.aborted) {
        abortController.abort(reason);
      }

      pendingFetches.clear();
    },
  };
};

const runWithDeadline = async <Result>(
  promise: Promise<Result>,
  timeout: number,
  remainingTimeout: number,
  abortController: AbortController
) => {
  const timeoutError = new LocalVmTimeoutError(timeout);
  const timeoutAbortController = new AbortController();

  const timeoutPromise = (async () => {
    try {
      await sleep(remainingTimeout, undefined, { signal: timeoutAbortController.signal });
      abortController.abort(timeoutError);
      throw timeoutError;
    } catch (error: unknown) {
      if (timeoutAbortController.signal.aborted) {
        return new Promise<never>(() => {
          // Keep the canceled timeout out of the race after execution completes.
        });
      }

      throw error;
    }
  })();

  try {
    return await Promise.race([promise, timeoutPromise]);
  } catch (error: unknown) {
    if (abortController.signal.reason === timeoutError) {
      throw timeoutError;
    }

    throw error;
  } finally {
    timeoutAbortController.abort();
    abortController.abort();
  }
};

/**
 * This function is used to execute a named function in a customized code script in a local
 * virtual machine with the given payload as input.
 *
 * @param script Custom code snippet.
 * @param functionName The name of the function to be executed.
 * @param payload The input payload for the function.
 * @returns The result of the function execution.
 */
export const runScriptFunctionInLocalVm = async (
  script: string,
  functionName: string,
  payload: unknown,
  { timeout = defaultLocalVmTimeout }: LocalVmRunnerOptions = {}
) => {
  const deadline = Date.now() + timeout;
  const timeoutError = new LocalVmTimeoutError(timeout);
  const abortController = new AbortController();
  const { fetch: abortableFetch, abortPendingFetches } = createAbortableFetch(abortController);
  const globalContext = Object.freeze({
    fetch: abortableFetch,
  });

  try {
    const customFunction: unknown = runInNewContext(script + `;${functionName};`, globalContext, {
      timeout: getRemainingTimeout(deadline, timeoutError),
    });

    if (typeof customFunction !== 'function') {
      throw new TypeError(`The script does not have a function named \`${functionName}\``);
    }

    /**
     * We can not use top-level await in `vm`, use the following implementation instead.
     *
     * Ref:
     * 1. https://github.com/nodejs/node/issues/40898
     * 2. https://github.com/n-riesco/ijavascript/issues/173#issuecomment-693924098
     */
    const result: unknown = runInNewContext(
      '(async () => customFunction(payload))();',
      Object.freeze({ customFunction, payload }),
      { timeout: getRemainingTimeout(deadline, timeoutError) }
    );

    return await runWithDeadline(
      Promise.resolve(result),
      timeout,
      getRemainingTimeout(deadline, timeoutError),
      abortController
    );
  } catch (error: unknown) {
    if (isNodeVmTimeoutError(error)) {
      throw timeoutError;
    }

    throw error;
  } finally {
    abortPendingFetches();
  }
};

/**
 * Build the error body for the local VM error.
 *
 * @remarks
 *
 * Catch the error from vm module, and build the error body.
 * Use `isNativeError` to check if the error is an instance of `Error`.
 * If the error comes from `node:vm` module, then it will not be an instance of `Error` but can be captured by `isNativeError`.
 *
 */
export const buildLocalVmErrorBody = (error: unknown) =>
  error instanceof LocalVmTimeoutError
    ? {
        message: error.message,
        error: {
          code: error.code,
          message: error.message,
          timeout: error.timeout,
        },
      }
    : types.isNativeError(error)
      ? { message: error.message, stack: error.stack }
      : { message: String(error) };
