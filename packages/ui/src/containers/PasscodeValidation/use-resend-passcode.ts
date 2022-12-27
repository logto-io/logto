import { SignInIdentifier } from '@logto/schemas';
import { t } from 'i18next';
import { useCallback, useContext } from 'react';
import { useTimer } from 'react-timer-hook';

import { getSendPasscodeApi } from '@/apis/utils';
import useApi from '@/hooks/use-api';
import { PageContext } from '@/hooks/use-page-context';
import type { UserFlow } from '@/types';

export const timeRange = 59;

const getTimeout = () => {
  const now = new Date();
  now.setSeconds(now.getSeconds() + timeRange);

  return now;
};

const useResendPasscode = (
  type: UserFlow,
  method: SignInIdentifier.Email | SignInIdentifier.Sms,
  target: string
) => {
  const { setToast } = useContext(PageContext);

  const { seconds, isRunning, restart } = useTimer({
    autoStart: true,
    expiryTimestamp: getTimeout(),
  });

  const { run: sendPassCode } = useApi(getSendPasscodeApi(type));

  const onResendPasscode = useCallback(async () => {
    const payload = method === SignInIdentifier.Email ? { email: target } : { phone: target };
    const result = await sendPassCode(payload);

    if (result) {
      setToast(t('description.passcode_sent'));
      restart(getTimeout(), true);
    }
  }, [method, restart, sendPassCode, setToast, target]);

  return {
    seconds,
    isRunning,
    onResendPasscode,
  };
};

export default useResendPasscode;
