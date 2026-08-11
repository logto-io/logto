import { type CloudConnectionLibrary } from '../cloud-connection.js';

import { runScriptOnCloud } from './cloud.js';

const { jest } = import.meta;

const post = jest.fn();

const cloudConnection = {
  getClient: async () => ({ post }),
} as unknown as CloudConnectionLibrary;

/**
 * Let the `await cloudConnection.getClient()` hop settle so the deadline timer is armed. Enough
 * microtask hops to cover the awaits `runScriptOnCloud` takes before `setTimeout` runs.
 */
const flushMicrotasks = async (hops = 5): Promise<void> => {
  if (hops === 0) {
    return;
  }

  await Promise.resolve();

  return flushMicrotasks(hops - 1);
};

const run = async () =>
  runScriptOnCloud({
    cloudConnection,
    script: 'const runAction = () => ({ action: "continue" });',
    entry: 'runAction',
    payload: {},
  });

describe('runScriptOnCloud', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('unwraps the value envelope', async () => {
    post.mockResolvedValueOnce({ value: { action: 'continue' } });

    await expect(run()).resolves.toEqual({ action: 'continue' });
  });

  it('tolerates a body-less response instead of throwing on the destructure', async () => {
    // The withtyped client returns `undefined` for a 204 whatever the route declares.
    // eslint-disable-next-line unicorn/no-useless-undefined -- That `undefined` is the case under test.
    post.mockResolvedValueOnce(undefined);

    await expect(run()).resolves.toBeUndefined();
  });

  it('rejects with a timeout error when the request never settles', async () => {
    jest.useFakeTimers();
    // eslint-disable-next-line @typescript-eslint/no-empty-function -- A request that never settles is the case under test.
    post.mockReturnValueOnce(new Promise(() => {}));

    const result = run();
    // Attach the assertion before advancing so the rejection is never unhandled.
    const expectation = expect(result).rejects.toMatchObject({ status: 500 });

    await flushMicrotasks();
    expect(jest.getTimerCount()).toBe(1);
    jest.advanceTimersByTime(10_000);
    await expectation;
  });

  it('does not leave a pending timer behind on a settled request', async () => {
    jest.useFakeTimers();
    post.mockResolvedValueOnce({ value: 'done' });

    await expect(run()).resolves.toBe('done');
    expect(jest.getTimerCount()).toBe(0);
  });
});
