import { t } from 'i18next';
import { useCallback, useContext } from 'react';
import { useTimer } from 'react-timer-hook';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { sendStepUpVerificationCode } from '@/apis/experience';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import useStepUpErrorHandler from '@/hooks/use-step-up-error-handler';
import useToast from '@/hooks/use-toast';
import { type VerificationCodeIdentifier } from '@/types';
import { codeVerificationTypeMap } from '@/utils/sign-in-experience';

export const timeRange = 59;

const getTimeout = () => {
  const now = new Date();
  now.setSeconds(now.getSeconds() + timeRange);

  return now;
};

/**
 * Resend the code to the pinned subject's primary email or phone. Like the first send, only the
 * identifier type travels; the new verification ID replaces the stored one so a refresh of the
 * page verifies against the code that was actually sent last.
 */
const useResendStepUpVerificationCode = (identifierType: VerificationCodeIdentifier) => {
  const { setToast } = useToast();
  const handleError = useErrorHandler();
  const stepUpErrorHandlers = useStepUpErrorHandler();
  const resend = useApi(sendStepUpVerificationCode);
  const { setVerificationId } = useContext(UserInteractionContext);

  const { seconds, isRunning, restart } = useTimer({
    autoStart: true,
    expiryTimestamp: getTimeout(),
  });

  const onResendVerificationCode = useCallback(async () => {
    const [error, result] = await resend(identifierType);

    if (error) {
      await handleError(error, stepUpErrorHandlers);
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
    resend,
    restart,
    setToast,
    setVerificationId,
    stepUpErrorHandlers,
  ]);

  return { seconds, isRunning, onResendVerificationCode };
};

export default useResendStepUpVerificationCode;
