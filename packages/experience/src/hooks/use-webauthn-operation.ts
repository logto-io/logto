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
import { useCallback, useEffect, useState } from 'react';
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
  const [webAuthnOptions, setWebAuthnOptions] = useState<
    WebAuthnRegistrationOptions | WebAuthnAuthenticationOptions
  >();

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

  /**
   * Note:
   * Due to limitations in the iOS system, user interaction is required for the use of the WebAuthn API.
   * Therefore, we should avoid asynchronous operations before invoking the WebAuthn API.
   * Otherwise, the operating system may consider the WebAuthn authorization is not initiated by the user.
   * So, we need to prepare the necessary WebAuthn options before calling the WebAuthn API.
   */
  const prepareWebAuthnOptions = useCallback(async () => {
    if (webAuthnOptions) {
      return;
    }

    const [error, options] =
      flow === UserMfaFlow.MfaBinding
        ? await asyncCreateRegistrationOptions()
        : await asyncGenerateAuthnOptions();

    if (error) {
      await handleError(error);
      return;
    }

    setWebAuthnOptions(options);
  }, [
    asyncCreateRegistrationOptions,
    asyncGenerateAuthnOptions,
    flow,
    handleError,
    webAuthnOptions,
  ]);

  useEffect(() => {
    if (webAuthnOptions) {
      return;
    }

    void prepareWebAuthnOptions();
  }, [prepareWebAuthnOptions, webAuthnOptions]);

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
    if (!webAuthnOptions) {
      /**
       * This error message is just for program robustness; in practice, this issue is unlikely to occur.
       */
      setToast(t('mfa.webauthn_not_ready'));
      void prepareWebAuthnOptions();

      return;
    }

    const response = await handleWebAuthnProcess(webAuthnOptions);

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
  }, [handleWebAuthnProcess, prepareWebAuthnOptions, sendMfaPayload, setToast, t, webAuthnOptions]);
};

export default useWebAuthnOperation;
