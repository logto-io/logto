import { type RequestErrorBody } from '@logto/schemas';
import { useCallback } from 'react';

import useApi from '@/hooks/use-api';

import useErrorHandler, { type ErrorHandlers } from './use-error-handler';
import usePasswordErrorMessage from './use-password-error-message';
import { usePasswordPolicy } from './use-sie';

export type PasswordAction<Response> = (password: string) => Promise<Response>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- we don't care about the args type, but `any` is needed for type inference
export type SuccessHandler<F> = F extends (...args: any[]) => Promise<infer Response>
  ? (result?: Response) => void
  : never;

type UsePasswordApiInit<Response> = {
  api: PasswordAction<Response>;
  setErrorMessage: (message?: string) => void;
  errorHandlers: ErrorHandlers;
  successHandler: SuccessHandler<PasswordAction<Response>>;
};

const usePasswordAction = <Response>({
  api,
  errorHandlers,
  setErrorMessage,
  successHandler,
}: UsePasswordApiInit<Response>): [PasswordAction<void>] => {
  const asyncAction = useApi(api);
  const handleError = useErrorHandler();
  const { getErrorMessage, getErrorMessageFromBody } = usePasswordErrorMessage();
  const { policyChecker } = usePasswordPolicy();
  const passwordRejectionHandler = useCallback(
    (error: RequestErrorBody) => {
      setErrorMessage(getErrorMessageFromBody(error));
    },
    [getErrorMessageFromBody, setErrorMessage]
  );

  const action = useCallback(
    async (password: string) => {
      // Perform fast check before sending request
      const fastCheckErrorMessage = getErrorMessage(policyChecker.fastCheck(password));
      if (fastCheckErrorMessage) {
        setErrorMessage(fastCheckErrorMessage);
        return;
      }

      const [error, result] = await asyncAction(password);

      if (error) {
        await handleError(error, {
          'password.rejected': passwordRejectionHandler,
          ...errorHandlers,
        });

        return;
      }

      successHandler(result);
    },
    [
      asyncAction,
      errorHandlers,
      getErrorMessage,
      handleError,
      passwordRejectionHandler,
      policyChecker,
      setErrorMessage,
      successHandler,
    ]
  );

  return [action];
};

export default usePasswordAction;
