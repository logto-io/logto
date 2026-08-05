import { types } from 'node:util';

import { ResponseError } from '@withtyped/client';

import { type ScriptResult } from './types.js';

type ScriptFailureKind = Extract<ScriptResult, { ok: false }>['kind'];

/**
 * The HTTP status code each failure kind maps to.
 *
 * This is the status mapping the local VM implementation has always used, kept as-is so
 * route-level error handling stays untouched. Call sites that throw {@link ScriptExecutionError}
 * for a known kind should read the status from here rather than hardcoding the number.
 */
export const scriptFailureStatusCodes = Object.freeze({
  denied: 403,
  syntax: 422,
  type: 422,
  timeout: 500,
  oom: 500,
  runtime: 500,
} as const satisfies Record<ScriptFailureKind, number>);

/** Map a thrown script error to the pinned {@link scriptFailureStatusCodes} status. */
export const getScriptFailureStatusCode = (error: unknown): number => {
  if (error instanceof SyntaxError) {
    return scriptFailureStatusCodes.syntax;
  }

  if (error instanceof TypeError) {
    return scriptFailureStatusCodes.type;
  }

  return scriptFailureStatusCodes.runtime;
};

/**
 * Extend the ResponseError from @withtyped/client.
 * This class is used to parse the error from a script run to the WithTyped client response error.
 * So we can unify the error handling and display logic for both the OSS and Cloud runtimes.
 */
export class ScriptExecutionError extends ResponseError {
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
 * Build the error body for a script execution error.
 *
 * @remarks
 *
 * Catch the error thrown by the script runtime, and build the error body.
 * Use `isNativeError` to check if the error is an instance of `Error`.
 * If the error comes from the `node:vm` module, then it will not be an instance of `Error` but can be captured by `isNativeError`.
 *
 */
export const buildScriptExecutionErrorBody = (error: unknown) =>
  types.isNativeError(error)
    ? { message: error.message, stack: error.stack }
    : { message: String(error) };
