import { InteractionEvent, MfaFactor, SignInIdentifier } from '@logto/schemas';
import { useCallback, useContext } from 'react';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import {
  addMfa,
  getVerifiedRegisterCodeRecordId,
  sendPrimaryVerificationCode,
  submitInteraction,
} from '@/apis/experience';
import useApi from '@/hooks/use-api';
import useErrorHandler, { type ErrorHandlers } from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';
import useTrustedDeviceOptInErrorHandler from '@/hooks/use-trusted-device-opt-in-error-handler';
import { UserMfaFlow } from '@/types';
import { type MfaFlowState } from '@/types/guard';
import { isFactorBoundInSuggestion } from '@/utils/mfa';
import { codeVerificationTypeMap } from '@/utils/sign-in-experience';

type Options = {
  /** Whether to replace the current page in the history stack on navigation. */
  replace?: boolean;
  /** Follow-up error handlers run if direct submission triggers another prompt. */
  submitErrorHandlers?: ErrorHandlers;
};

/**
 * Start enrolling an Email or Phone verification code MFA factor.
 *
 * When the user already has a primary identifier (`maskedIdentifiers`), reuse any verified code
 * record from an active `Register` interaction when possible; otherwise send a subject-bound
 * primary verification code and open the code entry view.
 */
const useStartIdentifierMfaBinding = ({ replace, submitErrorHandlers }: Options = {}) => {
  const navigate = useNavigateWithPreservedSearchParams();
  const handleError = useErrorHandler();
  const redirectTo = useGlobalRedirectTo();
  const { setVerificationId } = useContext(UserInteractionContext);

  const asyncGetVerifiedRegisterCodeRecordId = useApi(getVerifiedRegisterCodeRecordId);
  const asyncAddMfa = useApi(addMfa);
  const asyncSubmitInteraction = useApi(submitInteraction);
  const asyncSendPrimaryVerificationCode = useApi(sendPrimaryVerificationCode);
  const trustedDeviceRegisterErrorHandler = useTrustedDeviceOptInErrorHandler(
    InteractionEvent.Register
  );

  return useCallback(
    async (
      factor: MfaFactor.EmailVerificationCode | MfaFactor.PhoneVerificationCode,
      flowState: MfaFlowState
    ) => {
      if (isFactorBoundInSuggestion(factor, flowState)) {
        navigate({ pathname: `/${UserMfaFlow.MfaBinding}` }, { replace, state: flowState });
        return;
      }

      const maskedIdentifier = flowState.maskedIdentifiers?.[factor];

      if (!maskedIdentifier) {
        navigate(
          { pathname: `/${UserMfaFlow.MfaBinding}/${factor}` },
          { replace, state: flowState }
        );
        return;
      }

      const identifierType =
        factor === MfaFactor.EmailVerificationCode
          ? SignInIdentifier.Email
          : SignInIdentifier.Phone;
      const verificationType = codeVerificationTypeMap[identifierType];

      const [interactionError, verifiedRecordId] =
        await asyncGetVerifiedRegisterCodeRecordId(verificationType);

      if (!interactionError && verifiedRecordId) {
        const [bindError] = await asyncAddMfa(factor, verifiedRecordId);

        if (!bindError) {
          const [submitError, result] = await asyncSubmitInteraction();

          if (submitError) {
            await handleError(submitError, {
              ...trustedDeviceRegisterErrorHandler,
              ...submitErrorHandlers,
            });
            return;
          }

          if (result?.redirectTo) {
            await redirectTo(result.redirectTo);
          }

          return;
        }
      }

      const [sendError, sendResult] = await asyncSendPrimaryVerificationCode(identifierType);

      if (sendError) {
        await handleError(sendError);
        return;
      }

      if (sendResult) {
        setVerificationId(verificationType, sendResult.verificationId);
        navigate(
          { pathname: `/${UserMfaFlow.MfaBinding}/${factor}` },
          { replace, state: flowState }
        );
      }
    },
    [
      asyncAddMfa,
      asyncGetVerifiedRegisterCodeRecordId,
      asyncSendPrimaryVerificationCode,
      asyncSubmitInteraction,
      handleError,
      navigate,
      redirectTo,
      replace,
      setVerificationId,
      submitErrorHandlers,
      trustedDeviceRegisterErrorHandler,
    ]
  );
};

export default useStartIdentifierMfaBinding;
