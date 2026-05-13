import RequestError from '#src/errors/RequestError/index.js';

/**
 * Parse a unix-ms string query param into a finite number, or throw 400 with
 * `guard.invalid_input`. Returns `undefined` when the input is absent.
 */
export const parseTimestampParam = (
  raw: string | undefined,
  paramName: string
): number | undefined => {
  if (raw === undefined) {
    return undefined;
  }
  const value = Number(raw);
  if (!Number.isFinite(value)) {
    throw new RequestError({ code: 'guard.invalid_input', type: paramName });
  }
  return value;
};

/**
 * Validate a parsed time window: when both bounds are present, `start` must be
 * strictly less than `end`. Throws 400 with `log.invalid_time_window` otherwise.
 */
export const validateTimeWindow = (start: number | undefined, end: number | undefined): void => {
  if (start !== undefined && end !== undefined && start >= end) {
    throw new RequestError({ code: 'log.invalid_time_window', status: 400 });
  }
};
