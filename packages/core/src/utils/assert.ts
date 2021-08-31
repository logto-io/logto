// https://github.com/facebook/jest/issues/7547

import { LogtoErrorCode } from '@logto/phrases';

import RequestError from '@/errors/RequestError';

export type AssertFunction = <E extends Error>(
  value: unknown,
  error: E | LogtoErrorCode,
  interpolation?: Record<string, unknown>
) => asserts value;

const assert: AssertFunction = (value, error, interpolation): asserts value => {
  if (!value) {
    if (error instanceof Error) {
      // https://github.com/typescript-eslint/typescript-eslint/issues/3814
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw error;
    }

    throw new RequestError({ code: error, ...interpolation });
  }
};

export default assert;
