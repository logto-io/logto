import { runInNewContext } from 'node:vm';

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
