import { type Optional } from '@silverhand/essentials';
import nock from 'nock';

import { type CloudConnectionLibrary } from '../cloud-connection.js';

import { runScriptOnCloud } from './cloud.js';

const { jest } = import.meta;

const endpoint = 'http://script-runner.example.com';
const workerAccessToken = 'worker-access-token';

const getWorkerAccessToken = jest.fn(async () => workerAccessToken);
const invalidateWorkerAccessToken = jest.fn();

const cloudConnection = {
  getWorkerAccessToken,
  invalidateWorkerAccessToken,
} as unknown as CloudConnectionLibrary;

const run = async (isTest?: boolean) =>
  runScriptOnCloud({
    cloudConnection,
    endpoint,
    tenantId: 'test-tenant',
    script: 'const runAction = () => ({ action: "continue" });',
    entry: 'runAction',
    payload: { event: {} },
    isTest,
  });

/**
 * Run and return the rejection reason, failing loudly if the call resolves.
 *
 * Assertions must not be thrown from a nock reply callback: nock invokes it synchronously outside
 * its own error handling, so a `JestAssertionError` escapes as an uncaught exception and the
 * request is never answered — the run then only settles when the 5s deadline fires, reporting a
 * timeout instead of the real diff.
 */
const runAndCatch = async (isTest?: boolean): Promise<unknown> => {
  try {
    await run(isTest);
  } catch (error: unknown) {
    return error;
  }

  throw new Error('Expected the run to reject.');
};

/** Intercept the Worker call, asserting the auth header the token mint produced. */
const mockWorkerCall = () =>
  nock(endpoint, {
    reqheaders: { authorization: `Bearer ${workerAccessToken}` },
  }).post('/api/script-run');

/**
 * Let the `await cloudConnection.getWorkerAccessToken()` hop settle so the deadline timer is armed.
 * Enough microtask hops to cover the awaits `runScriptOnCloud` takes before `setTimeout` runs.
 */
const flushMicrotasks = async (hops = 5): Promise<void> => {
  if (hops === 0) {
    return;
  }

  await Promise.resolve();

  return flushMicrotasks(hops - 1);
};

describe('runScriptOnCloud', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    jest.useRealTimers();
    nock.cleanAll();
  });

  it('posts the run request and returns a success result', async () => {
    mockWorkerCall().reply(200, { ok: true, value: { action: 'continue' } });

    await expect(run()).resolves.toEqual({ ok: true, value: { action: 'continue' } });
  });

  it('sends tenantId and forwards isTest only when set', async () => {
    // Captured rather than asserted inline; see `runAndCatch`.
    // eslint-disable-next-line @silverhand/fp/no-let
    let testRunBody: Optional<unknown>;
    // eslint-disable-next-line @silverhand/fp/no-let
    let productionRunBody: Optional<unknown>;

    mockWorkerCall()
      .matchHeader('content-type', 'application/json')
      .reply(200, (uri, body) => {
        // eslint-disable-next-line @silverhand/fp/no-mutation
        testRunBody = body;

        return { ok: true, value: null };
      });

    await expect(run(true)).resolves.toEqual({ ok: true, value: null });

    expect(testRunBody).toMatchObject({
      tenantId: 'test-tenant',
      entry: 'runAction',
      isTest: true,
    });

    mockWorkerCall().reply(200, (uri, body) => {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      productionRunBody = body;

      return { ok: true, value: null };
    });

    await expect(run()).resolves.toEqual({ ok: true, value: null });

    expect(productionRunBody).toMatchObject({ tenantId: 'test-tenant' });
    expect(productionRunBody).not.toHaveProperty('isTest');
  });

  it('returns a script failure as a result rather than throwing', async () => {
    mockWorkerCall().reply(200, {
      ok: false,
      kind: 'denied',
      message: 'Access denied.',
    });

    await expect(run()).resolves.toEqual({
      ok: false,
      kind: 'denied',
      message: 'Access denied.',
    });
  });

  it('keeps the stack of a runtime failure', async () => {
    mockWorkerCall().reply(200, {
      ok: false,
      kind: 'runtime',
      name: 'TypeError',
      message: 'Boom.',
      stack: 'TypeError: Boom.\n  at <redacted>',
    });

    await expect(run()).resolves.toMatchObject({
      ok: false,
      kind: 'runtime',
      message: 'Boom.',
      stack: 'TypeError: Boom.\n  at <redacted>',
    });
  });

  it('throws on a non-2xx response, which means the script never ran', async () => {
    mockWorkerCall().reply(401, { message: 'JWT verification failed.' });

    await expect(runAndCatch()).resolves.toMatchObject({ status: 500 });
  });

  it('keeps the upstream body out of the message and caps it', async () => {
    const longBody = 'x'.repeat(1000);
    mockWorkerCall().reply(502, longBody);

    const error = await runAndCatch();
    const body: unknown = await (error as { response: Response }).response.json();

    expect(body).toMatchObject({ message: 'Script runner error: 502' });
    // The body is carried in a structured field, capped to the prefix plus the ellipsis.
    expect((body as { responseBody: string }).responseBody).toHaveLength(257);
    expect((body as { message: string }).message).not.toContain('x');
  });

  it('carries the raw body when the envelope drifts', async () => {
    mockWorkerCall().reply(200, { ok: false, kind: 'brandNewKind', message: 'Boom.' });

    const error = await runAndCatch();
    const body: unknown = await (error as { response: Response }).response.json();

    expect(body).toMatchObject({
      message: 'Script runner returned an unexpected response.',
      responseBody: JSON.stringify({ ok: false, kind: 'brandNewKind', message: 'Boom.' }),
    });
  });

  it('throws on an unrecognizable envelope', async () => {
    mockWorkerCall().reply(200, { unexpected: true });

    await expect(runAndCatch()).resolves.toMatchObject({ status: 500 });
  });

  it.each([401, 403])('drops the cached worker token on a %i', async (status) => {
    mockWorkerCall().reply(status, { message: 'Nope.' });

    await runAndCatch();

    expect(invalidateWorkerAccessToken).toHaveBeenCalledTimes(1);
  });

  it('keeps the cached worker token on a non-auth failure', async () => {
    mockWorkerCall().reply(500, { message: 'Nope.' });

    await runAndCatch();

    expect(invalidateWorkerAccessToken).not.toHaveBeenCalled();
  });

  it('rejects with a timeout error when the request never settles', async () => {
    jest.useFakeTimers();
    // eslint-disable-next-line @typescript-eslint/no-empty-function -- A call that never settles is the case under test.
    getWorkerAccessToken.mockReturnValueOnce(new Promise(() => {}));

    const result = run();
    // Attach the assertion before advancing so the rejection is never unhandled.
    const expectation = expect(result).rejects.toMatchObject({ status: 500 });

    await flushMicrotasks();
    expect(jest.getTimerCount()).toBe(1);
    jest.advanceTimersByTime(5000);
    await expectation;
  });

  it('does not leave the deadline timer behind on a settled request', async () => {
    // A pending timer keeps the Node process alive, so the deadline must be cleared on success too.
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    mockWorkerCall().reply(200, { ok: true, value: 'done' });

    await expect(run()).resolves.toEqual({ ok: true, value: 'done' });
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
