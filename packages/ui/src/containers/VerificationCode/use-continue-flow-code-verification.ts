import type { EmailVerificationCodePayload, PhoneVerificationCodePayload } from '@logto/schemas';
import { SignInIdentifier } from '@logto/schemas';
import { useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import { addProfileWithVerificationCodeIdentifier } from '@/apis/interaction';
import type { ErrorHandlers } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
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
  const { generalVerificationCodeErrorHandlers, errorMessage, clearErrorMessage } =
    useGeneralVerificationCodeErrorHandler();
  const [searchParameters] = useSearchParams();

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
      'user.phone_already_in_use': () => {
        void identifierExistErrorHandler(SignInIdentifier.Phone, target);
      },
      'user.email_already_in_use': () => {
        void identifierExistErrorHandler(SignInIdentifier.Email, target);
      },
      ...requiredProfileErrorHandler,
      ...generalVerificationCodeErrorHandlers,
      callback: errorCallback,
    }),
    [
      errorCallback,
      target,
      identifierExistErrorHandler,
      requiredProfileErrorHandler,
      generalVerificationCodeErrorHandlers,
    ]
  );

  const { run: verifyVerificationCode } = useApi(
    addProfileWithVerificationCodeIdentifier,
    verifyVerificationCodeErrorHandlers
  );

  const onSubmit = useCallback(
    async (payload: EmailVerificationCodePayload | PhoneVerificationCodePayload) => {
      const result = await verifyVerificationCode(payload);

      if (result?.redirectTo) {
        window.location.replace(result.redirectTo);
      }
    },
    [verifyVerificationCode]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useContinueFlowCodeVerification;
