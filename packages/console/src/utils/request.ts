import { RequestError } from '@/hooks/use-api';

type Options = {
  ignore: number[];
};

/**
 * Determines if a SWR request should be retried based on the error status code
 * @param options.ignore - an array of status codes to exclude from retrying
 * @returns An anonymous function that takes an error and returns a boolean. Returns `true` to retry the request, `false` otherwise.
 */
export const shouldRetryOnError = (options?: Options) => {
  return (error: unknown): boolean => {
    if (error instanceof RequestError) {
      const { status } = error;
      const { ignore } = options ?? {};

      return !ignore?.includes(status);
    }

    return true;
  };
};
