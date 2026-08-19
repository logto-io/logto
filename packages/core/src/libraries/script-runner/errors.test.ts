import { ScriptExecutionError, scriptFailureStatusCodes } from './errors.js';

describe('scriptFailureStatusCodes', () => {
  // The status mapping the script execution path has always used. Route-level error handling
  // depends on it, so any change here is a breaking change rather than a refactor.
  it('pins every failure kind to its historical status code', () => {
    expect(scriptFailureStatusCodes).toEqual({
      denied: 403,
      syntax: 422,
      type: 422,
      timeout: 500,
      oom: 500,
      runtime: 500,
    });
  });
});

describe('ScriptExecutionError', () => {
  it('exposes the body and status through the response', async () => {
    const error = new ScriptExecutionError({ message: 'boom', stack: 'stack' }, 422);

    expect(error.status).toBe(422);
    await expect(error.response.json()).resolves.toEqual({ message: 'boom', stack: 'stack' });
  });
});
