import { useEffect } from 'react';

type UseRetryOptions = {
  /** The precondition to check before executing the function. */
  precondition: boolean;
  /** The function to execute when the precondition is not met. */
  onPreconditionFailed?: () => void;
  /** The function to check the condition. */
  checkCondition: () => boolean;
  /** The function to execute when the condition is met. */
  execute: () => void;
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
  checkCondition,
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
      if (checkCondition()) {
        clearInterval(interval);
        execute();
      } else if (retry >= maxRetry) {
        clearInterval(interval);
      }
      // eslint-disable-next-line @silverhand/fp/no-mutation
      retry++;
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [checkCondition, execute, maxRetry, precondition]);
};
