import { MfaFactor, VerificationType } from '@logto/schemas';
import { useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { createWebAuthnRegistration, createWebAuthnAuthentication } from '@/apis/experience';
import { UserMfaFlow } from '@/types';
import { type WebAuthnState, type MfaFlowState } from '@/types/guard';

import useApi from './use-api';
import useErrorHandler from './use-error-handler';

const useStartWebAuthnProcessing = () => {
  const navigate = useNavigate();
  const asyncCreateRegistrationOptions = useApi(createWebAuthnRegistration);
  const asyncGenerateAuthnOptions = useApi(createWebAuthnAuthentication);
  const handleError = useErrorHandler();
  const { setVerificationId } = useContext(UserInteractionContext);

  return useCallback(
    async (flow: UserMfaFlow, flowState: MfaFlowState, replace?: boolean) => {
      const [error, result] =
        flow === UserMfaFlow.MfaBinding
          ? await asyncCreateRegistrationOptions()
          : await asyncGenerateAuthnOptions();

      if (error) {
        await handleError(error);
        return;
      }

      if (result) {
        const { verificationId, options } = result;
        setVerificationId(VerificationType.WebAuthn, verificationId);

        const state: WebAuthnState = {
          options,
          ...flowState,
        };

        navigate({ pathname: `/${flow}/${MfaFactor.WebAuthn}` }, { replace, state });
      }
    },
    [
      asyncCreateRegistrationOptions,
      asyncGenerateAuthnOptions,
      handleError,
      navigate,
      setVerificationId,
    ]
  );
};

export default useStartWebAuthnProcessing;
