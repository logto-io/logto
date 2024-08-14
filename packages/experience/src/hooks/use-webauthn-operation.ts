import {
  MfaFactor,
  webAuthnRegistrationOptionsGuard,
  type WebAuthnAuthenticationOptions,
  type WebAuthnRegistrationOptions,
} from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import {
  browserSupportsWebAuthn,
  startAuthentication,
  startRegistration,
} from '@simplewebauthn/browser';
import type { RegistrationResponseJSON, AuthenticationResponseJSON } from '@simplewebauthn/types';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { UserMfaFlow } from '@/types';

import useSendMfaPayload from './use-send-mfa-payload';
import useToast from './use-toast';

type WebAuthnOptions = WebAuthnRegistrationOptions | WebAuthnAuthenticationOptions;

const isAuthenticationResponseJSON = (
  responseJson: RegistrationResponseJSON | AuthenticationResponseJSON
): responseJson is AuthenticationResponseJSON => {
  return 'signature' in responseJson.response;
};

const useWebAuthnOperation = () => {
  const { t } = useTranslation();
  const { setToast } = useToast();
  const sendMfaPayload = useSendMfaPayload();

  return useCallback(
    /**
     * Note:
     * Due to limitations in the iOS system, user interaction is required for the use of the WebAuthn API.
     * Therefore, we should avoid asynchronous operations before invoking the WebAuthn API or the os may consider the WebAuthn authorization is not initiated by the user.
     * So, we need to prepare the necessary WebAuthn options before calling the WebAuthn API, this is why we don't generate the options in this function.
     */
    async (options: WebAuthnOptions, verificationId: string) => {
      if (!browserSupportsWebAuthn()) {
        setToast(t('mfa.webauthn_not_supported'));
        return;
      }

      const parsedRegistrationOptions = webAuthnRegistrationOptionsGuard.safeParse(options);

      const response = await trySafe(
        async () =>
          parsedRegistrationOptions.success
            ? startRegistration(parsedRegistrationOptions.data)
            : startAuthentication(options),
        () => {
          setToast(
            t(
              parsedRegistrationOptions.success
                ? 'mfa.webauthn_failed_to_create'
                : 'mfa.webauthn_failed_to_verify'
            )
          );
        }
      );

      if (!response) {
        return;
      }

      /**
       * Assert type manually to get the correct type
       */
      void sendMfaPayload(
        isAuthenticationResponseJSON(response)
          ? {
              flow: UserMfaFlow.MfaVerification,
              payload: { ...response, type: MfaFactor.WebAuthn },
              verificationId,
            }
          : {
              flow: UserMfaFlow.MfaBinding,
              payload: { ...response, type: MfaFactor.WebAuthn },
              verificationId,
            }
      );
    },
    [sendMfaPayload, setToast, t]
  );
};

export default useWebAuthnOperation;
