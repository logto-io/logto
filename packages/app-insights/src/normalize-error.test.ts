import { describe, expect, it } from 'vitest';

import { normalizeError } from './normalize-error.js';

describe('normalizeError()', () => {
  it('should create a new `Error` object with the stringified error as the message', () => {
    class CustomError extends Error {
      name = 'CustomError';
      foo = 'bar';
    }

    const error = new CustomError('test');
    const normalized = normalizeError(error);
    expect(normalized).not.toBe(error);
    expect(normalized.message).toBe('{"message":"test","name":"CustomError","foo":"bar"}');
  });

  it('should use the string constructor if the error is not an `Error` instance', () => {
    const error = 'test';
    const normalized = normalizeError(error);
    expect(normalized).not.toBe(error);
    expect(normalized.message).toBe('"test"');
  });

  it('should be able to handle circular references and stringify the "stack" key for non-error objects', () => {
    const circularObject: { message: string; circular?: unknown; stack: string } = {
      message: 'test',
      stack: 'foo',
    };
    // eslint-disable-next-line @silverhand/fp/no-mutation
    circularObject.circular = circularObject;

    const normalized = normalizeError(circularObject);
    expect(normalized).not.toBe(circularObject);
    expect(normalized.message).toBe('{"message":"test","stack":"foo","circular":"[Circular ~]"}');
  });

  it('should be able to handle circular error classes', () => {
    class CircularError extends Error {
      name = 'CircularError';
      circular = this;
    }

    const circularError = new CircularError();
    const normalized = normalizeError(circularError);
    expect(normalized).not.toBe(circularError);
    expect(normalized.message).toBe('{"name":"CircularError","circular":"[Circular ~]"}');
  });
});
