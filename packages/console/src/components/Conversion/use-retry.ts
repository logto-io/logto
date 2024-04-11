import { useEffect } from 'react';

type UseRetryOptions = {
  /** The precondition to check before executing the function. */
  precondition: boolean;
  /** The function to execute when the precondition is not met. */
  onPreconditionFailed?: () => void;
  /** The function to execute. If it returns `true`, the retry will stop. */
  execute: () => boolean;
  /**
   * The maximum number of retries.
   *
   * @default 3
   */
  maxRetry?: number;
};

/**
 * A hook to retry a function until the condition is met. The retry interval is 1 second.
 */
export const useRetry = ({
  precondition,
  onPreconditionFailed,
  execute,
  maxRetry = 3,
}: UseRetryOptions) => {
  useEffect(() => {
    if (!precondition) {
      onPreconditionFailed?.();
    }
  }, [onPreconditionFailed, precondition]);

  useEffect(() => {
    if (!precondition) {
      return;
    }

    // eslint-disable-next-line @silverhand/fp/no-let
    let retry = 0;
    const interval = setInterval(() => {
      if (execute() || retry >= maxRetry) {
        clearInterval(interval);
      }
      // eslint-disable-next-line @silverhand/fp/no-mutation
      retry += 1;
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [execute, maxRetry, precondition]);
};
