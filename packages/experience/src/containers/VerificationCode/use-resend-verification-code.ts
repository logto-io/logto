import { InteractionEvent, type VerificationCodeIdentifier } from '@logto/schemas';
import { t } from 'i18next';
import { useCallback, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useTimer } from 'react-timer-hook';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { sendVerificationCode } from '@/apis/experience';
import { getInteractionEventFromState, userFlowToInteractionEventMap } from '@/apis/utils';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import useToast from '@/hooks/use-toast';
import { UserFlow } from '@/types';
import { codeVerificationTypeMap } from '@/utils/sign-in-experience';

export const timeRange = 59;

const getTimeout = () => {
  const now = new Date();
  now.setSeconds(now.getSeconds() + timeRange);

  return now;
};

const useResendVerificationCode = (flow: UserFlow, identifier: VerificationCodeIdentifier) => {
  const { setToast } = useToast();
  const { state } = useLocation();

  const interactionEvent = useMemo<InteractionEvent>(() => {
    if (flow === UserFlow.Continue) {
      const interactionEvent = getInteractionEventFromState(state);
      console.log('interactionEvent', interactionEvent);
      return interactionEvent ?? InteractionEvent.SignIn;
    }

    return userFlowToInteractionEventMap[flow];
  }, [flow, state]);

  const { seconds, isRunning, restart } = useTimer({
    autoStart: true,
    expiryTimestamp: getTimeout(),
  });

  const handleError = useErrorHandler();
  const resendVerificationCode = useApi(sendVerificationCode);
  const { setVerificationId } = useContext(UserInteractionContext);

  const onResendVerificationCode = useCallback(async () => {
    const [error, result] = await resendVerificationCode(interactionEvent, identifier);

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
  }, [
    resendVerificationCode,
    interactionEvent,
    identifier,
    handleError,
    setVerificationId,
    setToast,
    restart,
  ]);

  return {
    seconds,
    isRunning,
    onResendVerificationCode,
  };
};

export default useResendVerificationCode;
