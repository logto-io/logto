import { LogtoErrorCode } from '@logto/phrases';
import { assert } from '@silverhand/essentials';

import RequestError from '@/errors/RequestError';

export type AssertThatFunction = <E extends Error>(
  value: unknown,
  error: E | LogtoErrorCode,
  interpolation?: Record<string, unknown>
) => asserts value;

const assertThat: AssertThatFunction = (value, error, interpolation): asserts value => {
  assert(
    value,
    error instanceof Error ? error : new RequestError({ code: error, ...interpolation })
  );
};

export default assertThat;
