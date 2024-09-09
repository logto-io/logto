import type { VerificationCodeIdentifier } from '@logto/schemas';
import { VerificationType } from '@logto/schemas';
import { useCallback, useContext, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { updateProfileWithVerificationCode } from '@/apis/experience';
import { getInteractionEventFromState } from '@/apis/utils';
import useApi from '@/hooks/use-api';
import type { ErrorHandlers } from '@/hooks/use-error-handler';
import useErrorHandler from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import usePreSignInErrorHandler from '@/hooks/use-pre-sign-in-error-handler';
import { SearchParameters } from '@/types';

import useGeneralVerificationCodeErrorHandler from './use-general-verification-code-error-handler';
import useIdentifierErrorAlert, { IdentifierErrorType } from './use-identifier-error-alert';
import useLinkSocialConfirmModal from './use-link-social-confirm-modal';

const useContinueFlowCodeVerification = (
  identifier: VerificationCodeIdentifier,
  verificationId: string,
  errorCallback?: () => void
) => {
  const [searchParameters] = useSearchParams();
  const redirectTo = useGlobalRedirectTo();

  const { state } = useLocation();
  const { verificationIdsMap } = useContext(UserInteractionContext);
  const interactionEvent = getInteractionEventFromState(state);

  const handleError = useErrorHandler();
  const verifyVerificationCode = useApi(updateProfileWithVerificationCode);

  const { generalVerificationCodeErrorHandlers, errorMessage, clearErrorMessage } =
    useGeneralVerificationCodeErrorHandler();

  const preSignInErrorHandler = usePreSignInErrorHandler({ replace: true, interactionEvent });

  const showIdentifierErrorAlert = useIdentifierErrorAlert();
  const showLinkSocialConfirmModal = useLinkSocialConfirmModal();

  const identifierExistsErrorHandler = useCallback(async () => {
    const linkSocial = searchParameters.get(SearchParameters.LinkSocial);
    const socialVerificationId = verificationIdsMap[VerificationType.Social];

    // Show bind with social confirm modal
    if (linkSocial && socialVerificationId) {
      await showLinkSocialConfirmModal(identifier, verificationId, socialVerificationId);

      return;
    }
    const { type, value } = identifier;
    await showIdentifierErrorAlert(IdentifierErrorType.IdentifierAlreadyExists, type, value);
  }, [
    identifier,
    searchParameters,
    showIdentifierErrorAlert,
    showLinkSocialConfirmModal,
    verificationId,
    verificationIdsMap,
  ]);

  const verifyVerificationCodeErrorHandlers: ErrorHandlers = useMemo(
    () => ({
      'user.phone_already_in_use': identifierExistsErrorHandler,
      'user.email_already_in_use': identifierExistsErrorHandler,
      ...preSignInErrorHandler,
      ...generalVerificationCodeErrorHandlers,
    }),
    [preSignInErrorHandler, generalVerificationCodeErrorHandlers, identifierExistsErrorHandler]
  );

  const onSubmit = useCallback(
    async (code: string) => {
      const [error, result] = await verifyVerificationCode(
        {
          code,
          identifier,
          verificationId,
        },
        interactionEvent
      );

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
      interactionEvent,
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
