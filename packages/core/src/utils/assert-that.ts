import type { LogtoErrorCode } from '@logto/phrases';
import { assert } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';

type AssertThatFunction = {
  <E extends Error>(value: unknown, error: E): asserts value;
  (value: unknown, error: LogtoErrorCode, status?: number): asserts value;
};

const assertThat: AssertThatFunction = <E extends Error>(
  value: unknown,
  error: E | LogtoErrorCode,
  status?: number
): asserts value => {
  assert(value, error instanceof Error ? error : new RequestError({ code: error, status }));
};

export default assertThat;
