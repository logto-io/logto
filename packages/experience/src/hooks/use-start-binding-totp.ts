import { MfaFactor } from '@logto/schemas';
import qrcode from 'qrcode';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { createTotpSecret } from '@/apis/interaction';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import { UserMfaFlow } from '@/types';
import { type TotpBindingState } from '@/types/guard';

type Options = {
  replace?: boolean;
};

const useStartTotpBinding = ({ replace }: Options = {}) => {
  const navigate = useNavigate();
  const asyncCreateTotpSecret = useApi(createTotpSecret);

  const handleError = useErrorHandler();

  return useCallback(
    async (allowOtherFactors = false) => {
      const [error, result] = await asyncCreateTotpSecret();

      if (error) {
        await handleError(error);
        return;
      }

      const { secret } = result ?? {};

      if (secret) {
        const state: TotpBindingState = {
          secret,
          // Todo @wangsijie generate QR code in the server side
          secretQrCode: await qrcode.toDataURL(`otpauth://totp/?secret=${secret}`),
          allowOtherFactors,
        };
        navigate({ pathname: `/${UserMfaFlow.MfaBinding}/${MfaFactor.TOTP}` }, { replace, state });
      }
    },
    [asyncCreateTotpSecret, handleError, navigate, replace]
  );
};

export default useStartTotpBinding;
