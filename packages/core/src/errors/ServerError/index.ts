// Needs to standardize

import type { ZodError } from 'zod';

export default class ServerError extends Error {
  constructor(public readonly message: string) {
    super(message);
    this.name = 'ServerError';
  }
}

export class StatusCodeError extends ServerError {
  constructor(public readonly expect: number | number[], public readonly received: number) {
    super(
      `Guard response status failed: Expected ${
        Array.isArray(expect) ? expect.join(', ') : expect
      }, but received ${received}.`
    );
    this.name = 'StatusCodeError';
  }
}

export class ResponseBodyError extends ServerError {
  constructor(public readonly cause: ZodError) {
    super(`Guard response body failed: ${cause.message}`);
    this.name = 'ResponseBodyError';
  }
}
