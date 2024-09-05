import { MfaFactor } from '@logto/schemas';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  createWebAuthnRegistrationOptions,
  generateWebAuthnAuthnOptions,
} from '@/apis/interaction';
import { UserMfaFlow } from '@/types';
import { type WebAuthnState, type MfaFlowState } from '@/types/guard';

import useApi from './use-api';
import useErrorHandler from './use-error-handler';

type Options = {
  replace?: boolean;
};

const useStartWebAuthnProcessing = ({ replace }: Options = {}) => {
  const navigate = useNavigate();
  const asyncCreateRegistrationOptions = useApi(createWebAuthnRegistrationOptions);
  const asyncGenerateAuthnOptions = useApi(generateWebAuthnAuthnOptions);
  const handleError = useErrorHandler();

  return useCallback(
    async (flow: UserMfaFlow, flowState: MfaFlowState) => {
      const [error, options] =
        flow === UserMfaFlow.MfaBinding
          ? await asyncCreateRegistrationOptions()
          : await asyncGenerateAuthnOptions();

      if (error) {
        await handleError(error);
        return;
      }

      if (options) {
        const state: WebAuthnState = {
          options,
          ...flowState,
        };

        navigate({ pathname: `/${flow}/${MfaFactor.WebAuthn}` }, { replace, state });
      }
    },
    [asyncCreateRegistrationOptions, asyncGenerateAuthnOptions, handleError, navigate, replace]
  );
};

export default useStartWebAuthnProcessing;
