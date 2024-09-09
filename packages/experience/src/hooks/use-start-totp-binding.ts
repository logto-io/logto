import { MfaFactor, VerificationType } from '@logto/schemas';
import { useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { createTotpSecret } from '@/apis/experience';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import { UserMfaFlow } from '@/types';
import { type MfaFlowState, type TotpBindingState } from '@/types/guard';

const useStartTotpBinding = () => {
  const navigate = useNavigate();
  const asyncCreateTotpSecret = useApi(createTotpSecret);
  const { setVerificationId } = useContext(UserInteractionContext);

  const handleError = useErrorHandler();

  return useCallback(
    async (flowState: MfaFlowState, replace?: boolean) => {
      const [error, result] = await asyncCreateTotpSecret();

      if (error) {
        await handleError(error);
        return;
      }

      if (result) {
        const { secret, secretQrCode, verificationId } = result;
        const state: TotpBindingState = {
          secret,
          secretQrCode,
          ...flowState,
        };

        setVerificationId(VerificationType.TOTP, verificationId);

        navigate({ pathname: `/${UserMfaFlow.MfaBinding}/${MfaFactor.TOTP}` }, { replace, state });
      }
    },
    [asyncCreateTotpSecret, handleError, navigate, setVerificationId]
  );
};

export default useStartTotpBinding;
