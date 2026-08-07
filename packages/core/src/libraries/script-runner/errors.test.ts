import {
  buildScriptExecutionErrorBody,
  getScriptFailureStatusCode,
  ScriptExecutionError,
  scriptFailureStatusCodes,
} from './errors.js';

describe('scriptFailureStatusCodes', () => {
  // The status mapping the local VM implementation has always used. Route-level error handling
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

describe('getScriptFailureStatusCode', () => {
  it('maps a SyntaxError to the syntax status', () => {
    expect(getScriptFailureStatusCode(new SyntaxError('bad token'))).toBe(422);
  });

  it('maps a TypeError to the type status', () => {
    expect(getScriptFailureStatusCode(new TypeError('not a function'))).toBe(422);
  });

  it('maps every other error to the runtime status', () => {
    expect(getScriptFailureStatusCode(new RangeError('out of range'))).toBe(500);
    expect(getScriptFailureStatusCode(new Error('boom'))).toBe(500);
    expect(getScriptFailureStatusCode('not an error')).toBe(500);
  });
});

describe('buildScriptExecutionErrorBody', () => {
  it('carries the message and stack of a native error', () => {
    const error = new Error('boom');

    expect(buildScriptExecutionErrorBody(error)).toEqual({
      message: 'boom',
      stack: error.stack,
    });
  });

  it('stringifies a thrown non-error value', () => {
    expect(buildScriptExecutionErrorBody('boom')).toEqual({ message: 'boom' });
    expect(buildScriptExecutionErrorBody(42)).toEqual({ message: '42' });
  });
});

describe('ScriptExecutionError', () => {
  it('exposes the body and status through the response', async () => {
    const error = new ScriptExecutionError({ message: 'boom', stack: 'stack' }, 422);

    expect(error.status).toBe(422);
    await expect(error.response.json()).resolves.toEqual({ message: 'boom', stack: 'stack' });
  });
});
