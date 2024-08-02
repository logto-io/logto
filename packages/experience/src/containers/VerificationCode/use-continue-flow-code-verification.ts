import type { VerificationCodeIdentifier, VerificationCodeSignInIdentifier } from '@logto/schemas';
import { SignInIdentifier } from '@logto/schemas';
import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { updateProfileWithVerificationCode } from '@/apis/experience';
import useApi from '@/hooks/use-api';
import type { ErrorHandlers } from '@/hooks/use-error-handler';
import useErrorHandler from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import usePreSignInErrorHandler from '@/hooks/use-pre-sign-in-error-handler';
import { SearchParameters } from '@/types';

import useGeneralVerificationCodeErrorHandler from './use-general-verification-code-error-handler';
import useIdentifierErrorAlert, { IdentifierErrorType } from './use-identifier-error-alert';

const useContinueFlowCodeVerification = (
  identifier: VerificationCodeIdentifier,
  verificationId: string,
  errorCallback?: () => void
) => {
  const [searchParameters] = useSearchParams();
  const redirectTo = useGlobalRedirectTo();

  const handleError = useErrorHandler();
  const verifyVerificationCode = useApi(updateProfileWithVerificationCode);

  const { generalVerificationCodeErrorHandlers, errorMessage, clearErrorMessage } =
    useGeneralVerificationCodeErrorHandler();
  const preSignInErrorHandler = usePreSignInErrorHandler({ replace: true });

  const showIdentifierErrorAlert = useIdentifierErrorAlert();

  const identifierExistErrorHandler = useCallback(
    async (method: VerificationCodeSignInIdentifier, target: string) => {
      const linkSocial = searchParameters.get(SearchParameters.LinkSocial);

      // Show bind with social confirm modal
      // if (linkSocial) {
      //   await showLinkSocialConfirmModal(method, target, linkSocial);

      //   return;
      // }

      await showIdentifierErrorAlert(IdentifierErrorType.IdentifierAlreadyExists, method, target);
    },
    [searchParameters, showIdentifierErrorAlert]
  );

  const verifyVerificationCodeErrorHandlers: ErrorHandlers = useMemo(
    () => ({
      'user.phone_already_in_use': async () =>
        identifierExistErrorHandler(SignInIdentifier.Phone, identifier.value),
      'user.email_already_in_use': async () =>
        identifierExistErrorHandler(SignInIdentifier.Email, identifier.value),
      ...preSignInErrorHandler,
      ...generalVerificationCodeErrorHandlers,
    }),
    [
      preSignInErrorHandler,
      generalVerificationCodeErrorHandlers,
      identifierExistErrorHandler,
      identifier.value,
    ]
  );

  const onSubmit = useCallback(
    async (code: string) => {
      const [error, result] = await verifyVerificationCode({
        code,
        identifier,
        verificationId,
      });

      if (error) {
        await handleError(error, verifyVerificationCodeErrorHandlers);
        errorCallback?.();

        return;
      }

      if (result?.redirectTo) {
        await redirectTo(result.redirectTo);
      }
    },
    [
      errorCallback,
      handleError,
      identifier,
      redirectTo,
      verificationId,
      verifyVerificationCode,
      verifyVerificationCodeErrorHandlers,
    ]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useContinueFlowCodeVerification;
