import { type SignInIdentifier } from '@logto/schemas';
import { t } from 'i18next';
import { useCallback } from 'react';
import { useTimer } from 'react-timer-hook';

import { sendMfaVerificationCode } from '@/apis/experience';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import useToast from '@/hooks/use-toast';

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
  const resend = useApi(sendMfaVerificationCode);

  const { seconds, isRunning, restart } = useTimer({
    autoStart: true,
    expiryTimestamp: getTimeout(),
  });

  const onResendVerificationCode = useCallback(async () => {
    const [error, result] = await resend(identifierType);

    if (error) {
      await handleError(error);
      return;
    }

    if (result) {
      setToast(t('description.passcode_sent'));
      restart(getTimeout(), true);
    }

    return result?.verificationId;
  }, [handleError, identifierType, resend, restart, setToast]);

  return {
    seconds,
    isRunning,
    onResendVerificationCode,
  };
};

export default useResendMfaVerificationCode;
