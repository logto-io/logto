import { SignInIdentifier } from '@logto/schemas';
import { t } from 'i18next';
import { useCallback } from 'react';
import { useTimer } from 'react-timer-hook';

import { sendVerificationCodeApi } from '@/apis/utils';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import useToast from '@/hooks/use-toast';
import type { UserFlow } from '@/types';

export const timeRange = 59;

const getTimeout = () => {
  const now = new Date();
  now.setSeconds(now.getSeconds() + timeRange);

  return now;
};

const useResendVerificationCode = (
  type: UserFlow,
  method: SignInIdentifier.Email | SignInIdentifier.Phone,
  target: string
) => {
  const { setToast } = useToast();

  const { seconds, isRunning, restart } = useTimer({
    autoStart: true,
    expiryTimestamp: getTimeout(),
  });

  const handleError = useErrorHandler();
  const sendVerificationCode = useApi(sendVerificationCodeApi);

  const onResendVerificationCode = useCallback(async () => {
    const payload = method === SignInIdentifier.Email ? { email: target } : { phone: target };
    const [error, result] = await sendVerificationCode(type, payload);

    if (error) {
      await handleError(error);

      return;
    }

    if (result) {
      setToast(t('description.passcode_sent'));
      restart(getTimeout(), true);
    }
  }, [handleError, method, restart, sendVerificationCode, setToast, target, type]);

  return {
    seconds,
    isRunning,
    onResendVerificationCode,
  };
};

export default useResendVerificationCode;
