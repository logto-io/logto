import { type PasswordRejectionCode, type PasswordIssue } from '@logto/core-kit';
import { type RequestErrorBody } from '@logto/schemas';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Return an object with two functions for getting the error message from an array of {@link PasswordIssue} or a {@link RequestErrorBody}.
 */
const usePasswordErrorMessage = () => {
  const { t } = useTranslation();
  const getErrorMessage = useCallback(
    (issues: PasswordIssue[]) => {
      // Errors that should be displayed first and alone
      const singleDisplayError = (
        [
          'unsupported_characters',
          'too_short',
          'character_types',
          'too_long',
          'pwned',
        ] satisfies PasswordRejectionCode[]
      )
        .map((code) => issues.find((issue) => issue.code === `password_rejected.${code}`))
        .find(Boolean);

      if (singleDisplayError) {
        return t(`error.${singleDisplayError.code}`, singleDisplayError.interpolation ?? {});
      }

      // The `restricted` errors should be displayed together
      const restrictedErrors = issues
        .filter((issue): issue is PasswordIssue<`restricted.${string}` & PasswordRejectionCode> =>
          issue.code.startsWith('password_rejected.restricted.')
        )
        .map((issue) => t(`error.${issue.code}`));

      if (restrictedErrors.length > 0) {
        return t('error.password_rejected.restricted_found', {
          list: restrictedErrors,
        });
      }
    },
    [t]
  );

  const getErrorMessageFromBody = useCallback(
    (error: RequestErrorBody) => {
      if (error.code === 'password.rejected') {
        // eslint-disable-next-line no-restricted-syntax -- trust the type from the server if the code matches
        return getErrorMessage(error.data as PasswordIssue[]) ?? error.message;
      }
    },
    [getErrorMessage]
  );

  return {
    /**
     * Get the error message from an array of {@link PasswordIssue}.
     * If the array is empty or the error is not recognized, `undefined` is returned.
     */
    getErrorMessage,
    /**
     * Get the error message from a {@link RequestErrorBody}.
     *
     * First, it will check if the error code is `password.rejected`:
     * - If so, it will assume `error.data` is an array of {@link PasswordIssue}, then it will call
     * {@link getErrorMessage} with the array;
     *   - If the result is `undefined`, it will directly return the error message from the body.
     * - Otherwise, it will return `undefined`.
     */
    getErrorMessageFromBody,
  };
};

export default usePasswordErrorMessage;
