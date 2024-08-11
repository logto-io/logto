import { HTTPError, TimeoutError } from 'ky';
import { type FieldValues, type SubmitHandler } from 'react-hook-form';
import { toast } from 'react-hot-toast';

/**
 * After upgrading the react-hook-form to v7.42.0, the `isSubmitting` flag does not recover when the submit handler throws.
 * So we need to catch the error and do nothing if the error is one of the following to prevent the `isSubmitting` flag from being stuck:
 * - HTTPError with a status code that is not 401
 * - TimeoutError
 *
 * Reference: https://github.com/orgs/react-hook-form/discussions/10103#discussioncomment-5927542
 */
export const trySubmitSafe =
  <T extends FieldValues>(handler: SubmitHandler<T>) =>
  async (formData: T, event?: React.BaseSyntheticEvent) => {
    try {
      await handler(formData, event);
    } catch (error) {
      if (error instanceof HTTPError && error.response.status !== 401) {
        // Returned directly, since the error has been handled by the `use-api` hook.
        return;
      }

      if (error instanceof TimeoutError) {
        // Display a toast message for the timeout error.
        toast.error(error.message);
        return;
      }

      throw error;
    }
  };
