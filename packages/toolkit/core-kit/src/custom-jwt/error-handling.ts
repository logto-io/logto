import { types } from 'node:util';

export const buildErrorResponse = (error: unknown) =>
  /**
   * Use `isNativeError` to check if the error is an instance of `Error`.
   * If the error comes from `node:vm` module, then it will not be an instance of `Error` but can be captured by `isNativeError`.
   */
  types.isNativeError(error)
    ? { message: error.message, stack: error.stack }
    : { message: String(error) };
