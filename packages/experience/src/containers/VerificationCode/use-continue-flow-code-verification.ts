import type { VerificationCodeIdentifier } from '@logto/schemas';
import { InteractionEvent, MfaFactor, VerificationType } from '@logto/schemas';
import { useCallback, useContext, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { validate } from 'superstruct';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { updateProfileWithVerificationCode } from '@/apis/experience';
import { bindMfa } from '@/apis/experience/mfa';
import { getInteractionEventFromState } from '@/apis/utils';
import useApi from '@/hooks/use-api';
import type { ErrorHandlers } from '@/hooks/use-error-handler';
import useErrorHandler from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import { useSieMethods } from '@/hooks/use-sie';
import useSubmitInteractionErrorHandler from '@/hooks/use-submit-interaction-error-handler';
import useToast from '@/hooks/use-toast';
import { SearchParameters } from '@/types';
import { mfaFlowStateGuard } from '@/types/guard';

import useGeneralVerificationCodeErrorHandler from './use-general-verification-code-error-handler';
import useIdentifierErrorAlert, { IdentifierErrorType } from './use-identifier-error-alert';
import useLinkSocialConfirmModal from './use-link-social-confirm-modal';
import useSignInWithExistIdentifierConfirmModal from './use-sign-in-with-exist-identifier-confirm-modal';

const useContinueFlowCodeVerification = (
  identifier: VerificationCodeIdentifier,
  verificationId: string,
  errorCallback?: () => void
) => {
  const [searchParameters] = useSearchParams();
  const redirectTo = useGlobalRedirectTo();
  const navigate = useNavigate();

  const { state } = useLocation();
  const { verificationIdsMap } = useContext(UserInteractionContext);
  const { isVerificationCodeEnabledForSignIn } = useSieMethods();

  const interactionEvent = useMemo(
    () => getInteractionEventFromState(state) ?? InteractionEvent.SignIn,
    [state]
  );

  const handleError = useErrorHandler();
  const { setToast } = useToast();

  const verifyVerificationCode = useApi(updateProfileWithVerificationCode);
  const asyncBindMfa = useApi(bindMfa);

  const { generalVerificationCodeErrorHandlers, errorMessage, clearErrorMessage } =
    useGeneralVerificationCodeErrorHandler();

  const submitInteractionErrorHandler = useSubmitInteractionErrorHandler(interactionEvent, {
    replace: true,
  });

  const showIdentifierErrorAlert = useIdentifierErrorAlert();
  const showLinkSocialConfirmModal = useLinkSocialConfirmModal();
  const showSignInWithExistIdentifierConfirmModal = useSignInWithExistIdentifierConfirmModal();

  const identifierExistsErrorHandler = useCallback(async () => {
    const linkSocial = searchParameters.get(SearchParameters.LinkSocial);
    const socialVerificationId = verificationIdsMap[VerificationType.Social];

    // Show bind with social confirm modal
    if (linkSocial && socialVerificationId) {
      await showLinkSocialConfirmModal(identifier, verificationId, socialVerificationId);
      return;
    }

    const { type, value } = identifier;

    // This is to ensure a consistent user experience during the registration process.
    // If email or phone number has been enabled as additional sign-up identifiers,
    // and user trying to provide an email/phone number that already exists in the system,
    // prompt the user to sign in with the existing identifier.
    // @see {user-register-flow-code-verification.ts} for more details.
    if (
      interactionEvent === InteractionEvent.Register &&
      isVerificationCodeEnabledForSignIn(type)
    ) {
      showSignInWithExistIdentifierConfirmModal({
        identifier,
        verificationId,
        onCanceled: () => {
          navigate(-1);
        },
      });
      return;
    }

    await showIdentifierErrorAlert(IdentifierErrorType.IdentifierAlreadyExists, type, value);
  }, [
    identifier,
    interactionEvent,
    isVerificationCodeEnabledForSignIn,
    navigate,
    searchParameters,
    showIdentifierErrorAlert,
    showLinkSocialConfirmModal,
    showSignInWithExistIdentifierConfirmModal,
    verificationId,
    verificationIdsMap,
  ]);

  const verifyVerificationCodeErrorHandlers: ErrorHandlers = useMemo(
    () => ({
      'user.phone_already_in_use': identifierExistsErrorHandler,
      'user.email_already_in_use': identifierExistsErrorHandler,
      ...submitInteractionErrorHandler,
      ...generalVerificationCodeErrorHandlers,
    }),
    [
      submitInteractionErrorHandler,
      generalVerificationCodeErrorHandlers,
      identifierExistsErrorHandler,
    ]
  );

  const onSubmit = useCallback(
    async (code: string) => {
      const [, mfaFlowState] = validate(state, mfaFlowStateGuard);
      // Check if this is an email MFA binding flow
      if (
        mfaFlowState?.availableFactors.includes(MfaFactor.EmailVerificationCode) &&
        identifier.type === 'email'
      ) {
        const [verifyError] = await verifyVerificationCode(
          {
            code,
            identifier,
            verificationId,
          },
          interactionEvent
        );

        if (verifyError) {
          await handleError(verifyError, verifyVerificationCodeErrorHandlers);
          errorCallback?.();
          return;
        }

        const [bindError, bindResult] = await asyncBindMfa(
          MfaFactor.EmailVerificationCode,
          verificationId
        );

        if (bindError) {
          await handleError(bindError);
          errorCallback?.();
          return;
        }

        if (bindResult?.redirectTo) {
          await redirectTo(bindResult.redirectTo);
          return;
        }

        return;
      }

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
      asyncBindMfa,
      errorCallback,
      handleError,
      identifier,
      interactionEvent,
      redirectTo,
      state,
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
