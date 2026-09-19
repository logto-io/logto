import { AuthenticationContextMode, type SignInIdentifier } from '@logto/schemas';
import { t } from 'i18next';
import { useCallback, useContext } from 'react';
import { useTimer } from 'react-timer-hook';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { sendMfaVerificationCode } from '@/apis/experience';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import useStepUpContext from '@/hooks/use-step-up-context';
import useStepUpErrorHandler from '@/hooks/use-step-up-error-handler';
import useToast from '@/hooks/use-toast';
import { codeVerificationTypeMap } from '@/utils/sign-in-experience';

export const timeRange = 59;

const getTimeout = () => {
  const now = new Date();
  now.setSeconds(now.getSeconds() + timeRange);
  return now;
};

const useResendMfaVerificationCode = (
  identifierType: SignInIdentifier.Email | SignInIdentifier.Phone
) => {
  const { setToast } = useToast();
  const handleError = useErrorHandler();
  const stepUpErrorHandlers = useStepUpErrorHandler();
  const { authenticationContext } = useStepUpContext();
  const isStepUp = authenticationContext?.mode === AuthenticationContextMode.StepUp;
  const resend = useApi(sendMfaVerificationCode);
  const { setVerificationId } = useContext(UserInteractionContext);

  const { seconds, isRunning, restart } = useTimer({
    autoStart: true,
    expiryTimestamp: getTimeout(),
  });

  const onResendVerificationCode = useCallback(async () => {
    const [error, result] = await resend(identifierType);

    if (error) {
      await handleError(error, isStepUp ? stepUpErrorHandlers : undefined);
      return;
    }

    if (result) {
      setVerificationId(codeVerificationTypeMap[identifierType], result.verificationId);
      setToast(t('description.passcode_sent'));
      restart(getTimeout(), true);
    }

    return result?.verificationId;
  }, [
    handleError,
    identifierType,
    isStepUp,
    resend,
    restart,
    setToast,
    setVerificationId,
    stepUpErrorHandlers,
  ]);

  return {
    seconds,
    isRunning,
    onResendVerificationCode,
  };
};

export default useResendMfaVerificationCode;
