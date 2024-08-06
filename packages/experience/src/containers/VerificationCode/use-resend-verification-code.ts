import { type VerificationCodeIdentifier } from '@logto/schemas';
import { t } from 'i18next';
import { useCallback, useContext } from 'react';
import { useTimer } from 'react-timer-hook';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { resendVerificationCodeApi } from '@/apis/utils';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import useToast from '@/hooks/use-toast';
import type { UserFlow } from '@/types';
import { codeVerificationTypeMap } from '@/utils/sign-in-experience';

export const timeRange = 59;

const getTimeout = () => {
  const now = new Date();
  now.setSeconds(now.getSeconds() + timeRange);

  return now;
};

const useResendVerificationCode = (flow: UserFlow, identifier: VerificationCodeIdentifier) => {
  const { setToast } = useToast();

  const { seconds, isRunning, restart } = useTimer({
    autoStart: true,
    expiryTimestamp: getTimeout(),
  });

  const handleError = useErrorHandler();
  const sendVerificationCode = useApi(resendVerificationCodeApi);
  const { setVerificationId } = useContext(UserInteractionContext);

  const onResendVerificationCode = useCallback(async () => {
    const [error, result] = await sendVerificationCode(flow, identifier);

    if (error) {
      await handleError(error);

      return;
    }

    if (result) {
      // Renew the verification ID in the context
      setVerificationId(codeVerificationTypeMap[identifier.type], result.verificationId);
      setToast(t('description.passcode_sent'));
      restart(getTimeout(), true);
    }
  }, [flow, handleError, identifier, restart, sendVerificationCode, setToast, setVerificationId]);

  return {
    seconds,
    isRunning,
    onResendVerificationCode,
  };
};

export default useResendVerificationCode;
