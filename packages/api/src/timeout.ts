const defaultTimeout = 10;

// Browsers and Node.js reliably support timer delays up to a signed 32-bit integer.
const maximumTimeoutMilliseconds = 2_147_483_647;

export const normalizeTimeout = (timeout?: number): number => {
  if (timeout === undefined || Number.isNaN(timeout)) {
    return defaultTimeout;
  }

  return Number.isFinite(timeout) && timeout > 0 ? timeout : 0;
};

export const getAbortReason = (signal: AbortSignal, fallbackMessage: string): Error => {
  // eslint-disable-next-line prefer-destructuring -- Keep the DOM's any-typed reason narrowed to unknown.
  const reason: unknown = signal.reason;
  return reason instanceof Error ? reason : new Error(fallbackMessage, { cause: reason });
};

export const toTimeoutMilliseconds = (timeout: number) =>
  Math.min(Math.max(Math.ceil(timeout * 1000), 1), maximumTimeoutMilliseconds);

export const createTimeoutSignal = (timeout: number, message: string) => {
  const controller = new AbortController();
  const timer =
    timeout > 0
      ? setTimeout(() => {
          controller.abort(new DOMException(message, 'TimeoutError'));
        }, toTimeoutMilliseconds(timeout))
      : undefined;

  return {
    signal: controller.signal,
    clear: () => {
      clearTimeout(timer);
    },
  };
};
