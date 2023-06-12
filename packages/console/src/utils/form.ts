import { HTTPError } from 'ky';
import { type FieldValues, type SubmitHandler } from 'react-hook-form';

/**
 * After upgrading the react-hook-form to v7.42.0, the `isSubmitting` flag does not recover when the submit handler throws.
 * So we need to catch the error and do nothing if the error is an HTTPError and the status code is not 401 to prevent the `isSubmitting` flag from being stuck.
 * Reference: https://github.com/orgs/react-hook-form/discussions/10103#discussioncomment-5927542
 */
export const trySubmitSafe =
  <T extends FieldValues>(handler: SubmitHandler<T>) =>
  async (formData: T, event?: React.BaseSyntheticEvent) => {
    try {
      await handler(formData, event);
    } catch (error) {
      if (error instanceof HTTPError && error.response.status !== 401) {
        return;
      }

      throw error;
    }
  };
