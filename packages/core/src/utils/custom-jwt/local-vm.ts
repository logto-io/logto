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
  payload: unknown
) => {
  const globalContext = Object.freeze({
    fetch: async (...args: Parameters<typeof fetch>) => fetch(...args),
  });
  const customFunction: unknown = runInNewContext(script + `;${functionName};`, globalContext);

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
  const result: unknown = await runInNewContext(
    '(async () => customFunction(payload))();',
    Object.freeze({ customFunction, payload }),
    // Limit the execution time to 3 seconds, throws error if the script takes too long to execute.
    { timeout: 3000 }
  );

  return result;
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
  types.isNativeError(error)
    ? { message: error.message, stack: error.stack }
    : { message: String(error) };
