import {
  MfaFactor,
  webAuthnRegistrationOptionsGuard,
  type WebAuthnAuthenticationOptions,
  type WebAuthnRegistrationOptions,
} from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/typescript-types';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import {
  createWebAuthnRegistrationOptions,
  generateWebAuthnAuthnOptions,
} from '@/apis/interaction';
import { UserMfaFlow } from '@/types';

import useApi from './use-api';
import useErrorHandler from './use-error-handler';
import useSendMfaPayload from './use-send-mfa-payload';
import useToast from './use-toast';

const isAuthenticationResponseJSON = (
  responseJson: RegistrationResponseJSON | AuthenticationResponseJSON
): responseJson is AuthenticationResponseJSON => {
  return 'signature' in responseJson.response;
};

const useWebAuthnOperation = (flow: UserMfaFlow) => {
  const { t } = useTranslation();
  const { setToast } = useToast();

  const asyncCreateRegistrationOptions = useApi(createWebAuthnRegistrationOptions);
  const asyncGenerateAuthnOptions = useApi(generateWebAuthnAuthnOptions);

  const sendMfaPayload = useSendMfaPayload();

  const handleError = useErrorHandler();
  const handleRawWebAuthnError = useCallback(
    (error: unknown) => {
      if (error instanceof Error) {
        setToast(error.message);
        return;
      }

      setToast(t('error.unknown'));
    },
    [setToast, t]
  );

  const handleWebAuthnProcess = useCallback(
    async (options: WebAuthnRegistrationOptions | WebAuthnAuthenticationOptions) => {
      const parsedOptions = webAuthnRegistrationOptionsGuard.safeParse(options);

      return trySafe(
        async () =>
          parsedOptions.success
            ? startRegistration(parsedOptions.data)
            : startAuthentication(options),
        handleRawWebAuthnError
      );
    },
    [handleRawWebAuthnError]
  );

  return useCallback(async () => {
    const [error, options] =
      flow === UserMfaFlow.MfaBinding
        ? await asyncCreateRegistrationOptions()
        : await asyncGenerateAuthnOptions();

    if (error) {
      await handleError(error);
      return;
    }

    if (!options) {
      return;
    }

    const response = await handleWebAuthnProcess(options);

    if (!response) {
      return;
    }

    /**
     * Assert type manually to get the correct type
     */
    void sendMfaPayload(
      isAuthenticationResponseJSON(response)
        ? { flow: UserMfaFlow.MfaVerification, payload: { ...response, type: MfaFactor.WebAuthn } }
        : { flow: UserMfaFlow.MfaBinding, payload: { ...response, type: MfaFactor.WebAuthn } }
    );
  }, [
    asyncCreateRegistrationOptions,
    asyncGenerateAuthnOptions,
    flow,
    handleError,
    handleWebAuthnProcess,
    sendMfaPayload,
  ]);
};

export default useWebAuthnOperation;
