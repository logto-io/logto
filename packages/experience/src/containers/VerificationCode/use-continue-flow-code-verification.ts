import type { EmailVerificationCodePayload, PhoneVerificationCodePayload } from '@logto/schemas';
import { SignInIdentifier } from '@logto/schemas';
import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { addProfileWithVerificationCodeIdentifier } from '@/apis/interaction';
import useApi from '@/hooks/use-api';
import type { ErrorHandlers } from '@/hooks/use-error-handler';
import useErrorHandler from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import usePreSignInErrorHandler from '@/hooks/use-pre-sign-in-error-handler';
import type { VerificationCodeIdentifier } from '@/types';
import { SearchParameters } from '@/types';

import useGeneralVerificationCodeErrorHandler from './use-general-verification-code-error-handler';
import useIdentifierErrorAlert, { IdentifierErrorType } from './use-identifier-error-alert';
import useLinkSocialConfirmModal from './use-link-social-confirm-modal';

const useContinueFlowCodeVerification = (
  _method: VerificationCodeIdentifier,
  target: string,
  errorCallback?: () => void
) => {
  const [searchParameters] = useSearchParams();
  const redirectTo = useGlobalRedirectTo();

  const handleError = useErrorHandler();
  const verifyVerificationCode = useApi(addProfileWithVerificationCodeIdentifier);

  const { generalVerificationCodeErrorHandlers, errorMessage, clearErrorMessage } =
    useGeneralVerificationCodeErrorHandler();
  const preSignInErrorHandler = usePreSignInErrorHandler({ replace: true });

  const showIdentifierErrorAlert = useIdentifierErrorAlert();
  const showLinkSocialConfirmModal = useLinkSocialConfirmModal();
  const identifierExistErrorHandler = useCallback(
    async (method: VerificationCodeIdentifier, target: string) => {
      const linkSocial = searchParameters.get(SearchParameters.LinkSocial);

      // Show bind with social confirm modal
      if (linkSocial) {
        await showLinkSocialConfirmModal(method, target, linkSocial);

        return;
      }

      await showIdentifierErrorAlert(IdentifierErrorType.IdentifierAlreadyExists, method, target);
    },
    [searchParameters, showIdentifierErrorAlert, showLinkSocialConfirmModal]
  );

  const verifyVerificationCodeErrorHandlers: ErrorHandlers = useMemo(
    () => ({
      'user.phone_already_in_use': async () =>
        identifierExistErrorHandler(SignInIdentifier.Phone, target),
      'user.email_already_in_use': async () =>
        identifierExistErrorHandler(SignInIdentifier.Email, target),
      ...preSignInErrorHandler,
      ...generalVerificationCodeErrorHandlers,
    }),
    [
      preSignInErrorHandler,
      generalVerificationCodeErrorHandlers,
      identifierExistErrorHandler,
      target,
    ]
  );

  const onSubmit = useCallback(
    async (payload: EmailVerificationCodePayload | PhoneVerificationCodePayload) => {
      const [error, result] = await verifyVerificationCode(payload);

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
      redirectTo,
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
