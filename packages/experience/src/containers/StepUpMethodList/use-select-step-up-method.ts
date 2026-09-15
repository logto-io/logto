import {
  type InteractionAuthenticationContext,
  MfaFactor,
  SignInIdentifier,
  VerificationType,
} from '@logto/schemas';
import { useCallback, useContext, useMemo } from 'react';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { sendStepUpVerificationCode } from '@/apis/experience';
import { stepUpRoutes } from '@/constants/step-up';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';
import useSendMfaVerificationCode from '@/hooks/use-send-mfa-verification-code';
import useStartWebAuthnProcessing from '@/hooks/use-start-webauthn-processing';
import useStepUpErrorHandler from '@/hooks/use-step-up-error-handler';
import { UserMfaFlow, type VerificationCodeIdentifier } from '@/types';
import { codeVerificationTypeMap } from '@/utils/sign-in-experience';
import { type StepUpMethod, toMfaFlowState } from '@/utils/step-up';

type Options = {
  /** The displayed methods; the MFA pages receive them as their available factors. */
  methods: readonly StepUpMethod[];
  authenticationContext: Pick<InteractionAuthenticationContext, 'maskedIdentifiers'>;
  /** Whether to replace the current page in the history stack on navigation. */
  replace?: boolean;
};

/**
 * Start the verification of a step-up method:
 *
 * - The pinned-user password and primary code go to the `/step-up` pages; a code is sent first
 *   through the pinned variant, so the raw identifier never leaves the server.
 * - The enrolled MFA factors reuse the existing `/mfa-verification/:factor` pages exactly as the
 *   MFA error handler starts them.
 */
const useSelectStepUpMethod = ({ methods, authenticationContext, replace }: Options) => {
  const navigate = useNavigateWithPreservedSearchParams();
  const handleError = useErrorHandler();
  const stepUpErrorHandlers = useStepUpErrorHandler();
  const asyncSendStepUpVerificationCode = useApi(sendStepUpVerificationCode);
  const { setVerificationId } = useContext(UserInteractionContext);
  const startWebAuthnProcessing = useStartWebAuthnProcessing({
    errorHandlers: stepUpErrorHandlers,
  });
  const { onSubmit: sendMfaVerificationCode } = useSendMfaVerificationCode({
    replace,
    errorHandlers: stepUpErrorHandlers,
  });

  const mfaFlowState = useMemo(
    () => toMfaFlowState(methods, authenticationContext),
    [authenticationContext, methods]
  );

  const sendPrimaryCode = useCallback(
    async (type: VerificationCodeIdentifier) => {
      const [error, result] = await asyncSendStepUpVerificationCode(type);

      if (error) {
        await handleError(error, stepUpErrorHandlers);
        return;
      }

      if (result) {
        setVerificationId(codeVerificationTypeMap[type], result.verificationId);
        navigate(stepUpRoutes.verificationCode, { replace });
      }
    },
    [
      asyncSendStepUpVerificationCode,
      handleError,
      navigate,
      replace,
      setVerificationId,
      stepUpErrorHandlers,
    ]
  );

  return useCallback(
    async (method: StepUpMethod) => {
      switch (method) {
        case VerificationType.Password: {
          navigate(stepUpRoutes.password, { replace });
          return;
        }
        case VerificationType.EmailVerificationCode: {
          await sendPrimaryCode(SignInIdentifier.Email);
          return;
        }
        case VerificationType.PhoneVerificationCode: {
          await sendPrimaryCode(SignInIdentifier.Phone);
          return;
        }
        case VerificationType.WebAuthn: {
          await startWebAuthnProcessing(UserMfaFlow.MfaVerification, mfaFlowState, replace);
          return;
        }
        case VerificationType.MfaEmailVerificationCode: {
          await sendMfaVerificationCode(SignInIdentifier.Email, mfaFlowState);
          return;
        }
        case VerificationType.MfaPhoneVerificationCode: {
          await sendMfaVerificationCode(SignInIdentifier.Phone, mfaFlowState);
          return;
        }
        case VerificationType.TOTP: {
          navigate(`/${UserMfaFlow.MfaVerification}/${MfaFactor.TOTP}`, {
            replace,
            state: mfaFlowState,
          });
          return;
        }
        case VerificationType.BackupCode: {
          navigate(`/${UserMfaFlow.MfaVerification}/${MfaFactor.BackupCode}`, {
            replace,
            state: mfaFlowState,
          });
        }
      }
    },
    [
      mfaFlowState,
      navigate,
      replace,
      sendMfaVerificationCode,
      sendPrimaryCode,
      startWebAuthnProcessing,
    ]
  );
};

export default useSelectStepUpMethod;
