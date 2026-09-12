import { MfaFactor, VerificationType } from '@logto/schemas';
import { useCallback, useContext } from 'react';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { createWebAuthnRegistration, createWebAuthnAuthentication } from '@/apis/experience';
import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';
import { UserMfaFlow } from '@/types';
import { type WebAuthnState, type MfaFlowState } from '@/types/guard';

import useApi from './use-api';
import useErrorHandler, { type ErrorHandlers } from './use-error-handler';

type Options = {
  /** Handlers for the errors of creating the WebAuthn options, on top of the default toast. */
  errorHandlers?: ErrorHandlers;
};

const useStartWebAuthnProcessing = ({ errorHandlers }: Options = {}) => {
  const navigate = useNavigateWithPreservedSearchParams();
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
        await handleError(error, errorHandlers);
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
      errorHandlers,
      handleError,
      navigate,
      setVerificationId,
    ]
  );
};

export default useStartWebAuthnProcessing;
