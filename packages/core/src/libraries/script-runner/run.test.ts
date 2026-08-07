import { buildScriptFailureError, ossScriptLimits } from './run.js';
import { type ScriptFailure } from './worker-protocol.js';

const readError = async (failure: ScriptFailure) => {
  const error = buildScriptFailureError(failure);
  const body: unknown = await error.response.json();

  return { status: error.status, body };
};

describe('ossScriptLimits', () => {
  it('bounds every run by wall clock and memory', () => {
    expect(ossScriptLimits).toEqual({ wallClockMs: 5000, memoryMb: 128 });
  });
});

describe('buildScriptFailureError', () => {
  it('synthesizes a message for a timeout, which carries none of its own', async () => {
    await expect(readError({ ok: false, kind: 'timeout' })).resolves.toEqual({
      status: 500,
      body: { message: 'Script execution timed out after 5000ms.' },
    });
  });

  it('synthesizes a message for an out-of-memory failure', async () => {
    await expect(readError({ ok: false, kind: 'oom' })).resolves.toEqual({
      status: 500,
      body: { message: 'Script execution exceeded the memory limit.' },
    });
  });

  it('carries the denial message at the denied status', async () => {
    await expect(readError({ ok: false, kind: 'denied', message: 'nope' })).resolves.toEqual({
      status: 403,
      body: { message: 'nope' },
    });
  });

  it('carries the message and stack of a syntax failure', async () => {
    await expect(
      readError({ ok: false, kind: 'syntax', message: 'Unexpected token', stack: 'stack' })
    ).resolves.toEqual({
      status: 422,
      body: { message: 'Unexpected token', stack: 'stack' },
    });
  });

  it('carries the message of a type failure', async () => {
    await expect(
      readError({ ok: false, kind: 'type', message: 'Not transferable' })
    ).resolves.toEqual({
      status: 422,
      body: { message: 'Not transferable' },
    });
  });

  it('carries the message and stack of a runtime failure without its name', async () => {
    await expect(
      readError({ ok: false, kind: 'runtime', name: 'CustomError', message: 'boom', stack: 's' })
    ).resolves.toEqual({
      status: 500,
      body: { message: 'boom', stack: 's' },
    });
  });
});
