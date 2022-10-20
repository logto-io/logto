import { flattenPromiseResult } from './promisify';

describe('promisify', () => {
  test('flattenPromiseResult', async () => {
    const promiseResolve = Promise.resolve('resolved');
    const [result, rejection] = await flattenPromiseResult(promiseResolve);

    expect(result).toBe('resolved');
    expect(rejection).toBeUndefined();

    // eslint-disable-next-line prefer-promise-reject-errors
    const promiseRejection = Promise.reject('rejected');
    const [_result, _rejection] = await flattenPromiseResult(promiseRejection);

    expect(_result).toBeUndefined();
    expect(_rejection).toBe('rejected');
  });
});
