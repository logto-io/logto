import { MfaFactor } from '@logto/schemas';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { createTotpSecret } from '@/apis/interaction';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import { UserMfaFlow } from '@/types';
import { type MfaFlowState, type TotpBindingState } from '@/types/guard';

type Options = {
  replace?: boolean;
};

const useStartTotpBinding = ({ replace }: Options = {}) => {
  const navigate = useNavigate();
  const asyncCreateTotpSecret = useApi(createTotpSecret);

  const handleError = useErrorHandler();

  return useCallback(
    async (flowState: MfaFlowState) => {
      const [error, result] = await asyncCreateTotpSecret();

      if (error) {
        await handleError(error);
        return;
      }

      const { secret, secretQrCode } = result ?? {};

      if (secret && secretQrCode) {
        const state: TotpBindingState = {
          secret,
          secretQrCode,
          ...flowState,
        };
        navigate({ pathname: `/${UserMfaFlow.MfaBinding}/${MfaFactor.TOTP}` }, { replace, state });
      }
    },
    [asyncCreateTotpSecret, handleError, navigate, replace]
  );
};

export default useStartTotpBinding;
