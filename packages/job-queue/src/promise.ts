class TimeoutRace {
  private timer?: NodeJS.Timeout;

  async run<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
    try {
      return await Promise.race([
        promise,
        new Promise<never>((_resolve, reject) => {
          this.timer = setTimeout(() => {
            reject(new Error(message));
          }, timeoutMs);
        }),
      ]);
    } finally {
      clearTimeout(this.timer);
    }
  }
}

/**
 * Reject with an `Error` carrying `message` when `promise` outlives `timeoutMs` (ms).
 *
 * The timer never outlives the race, and a late settlement of the losing `promise` is absorbed
 * by the race's own subscription so it cannot surface as an unhandled rejection.
 */
export const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string
): Promise<T> => new TimeoutRace().run(promise, timeoutMs, message);
