import type { EmailVerificationCodePayload, PhoneVerificationCodePayload } from '@logto/schemas';
import { SignInIdentifier } from '@logto/schemas';
import { useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import { addProfileWithVerificationCodeIdentifier } from '@/apis/interaction';
import useApi from '@/hooks/use-api';
import type { ErrorHandlers } from '@/hooks/use-error-handler';
import useErrorHandler from '@/hooks/use-error-handler';
import useRequiredProfileErrorHandler from '@/hooks/use-required-profile-error-handler';
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

  const handleError = useErrorHandler();
  const verifyVerificationCode = useApi(addProfileWithVerificationCodeIdentifier);

  const { generalVerificationCodeErrorHandlers, errorMessage, clearErrorMessage } =
    useGeneralVerificationCodeErrorHandler();
  const requiredProfileErrorHandler = useRequiredProfileErrorHandler({ replace: true });
  const showIdentifierErrorAlert = useIdentifierErrorAlert();
  const showLinkSocialConfirmModal = useLinkSocialConfirmModal();
  const identifierExistErrorHandler = useCallback(
    async (method: VerificationCodeIdentifier, target: string) => {
      const linkSocial = searchParameters.get(SearchParameters.linkSocial);

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
      ...requiredProfileErrorHandler,
      ...generalVerificationCodeErrorHandlers,
    }),
    [
      target,
      identifierExistErrorHandler,
      requiredProfileErrorHandler,
      generalVerificationCodeErrorHandlers,
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
        window.location.replace(result.redirectTo);
      }
    },
    [errorCallback, handleError, verifyVerificationCode, verifyVerificationCodeErrorHandlers]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useContinueFlowCodeVerification;
