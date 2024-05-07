import { runInNewContext } from 'node:vm';

import { LogtoJwtTokenKeyType, type CustomJwtFetcher } from '@logto/schemas';
import { pick } from '@silverhand/essentials';

export const runCustomJwtClaimsScriptInLocalVm = async (data: CustomJwtFetcher) => {
  const globalContext = Object.freeze({
    fetch: async (...args: Parameters<typeof fetch>) => fetch(...args),
  });
  const getCustomJwtClaims: unknown = runInNewContext(
    data.script + ';getCustomJwtClaims;',
    globalContext
  );

  if (typeof getCustomJwtClaims !== 'function') {
    throw new TypeError('The script does not have a function named `getCustomJwtClaims`');
  }

  const payload =
    data.tokenType === LogtoJwtTokenKeyType.AccessToken
      ? pick(data, 'token', 'context', 'environmentVariables')
      : pick(data, 'token', 'environmentVariables');

  /**
   * We can not use top-level await in `vm`, use the following implementation instead.
   *
   * Ref:
   * 1. https://github.com/nodejs/node/issues/40898
   * 2. https://github.com/n-riesco/ijavascript/issues/173#issuecomment-693924098
   */
  const result: unknown = await runInNewContext(
    '(async () => getCustomJwtClaims(payload))();',
    Object.freeze({ getCustomJwtClaims, payload }),
    // Limit the execution time to 3 seconds, throws error if the script takes too long to execute.
    { timeout: 3000 }
  );

  return result;
};
