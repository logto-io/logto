import { MfaFactor } from '@logto/schemas';
import { startRegistration } from '@simplewebauthn/browser';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { bindMfa, createWebAuthnRegistrationOptions } from '@/apis/interaction';

import useApi from './use-api';
import useErrorHandler from './use-error-handler';
import usePreSignInErrorHandler from './use-pre-sign-in-error-handler';
import useToast from './use-toast';

const useBindWebAuthn = () => {
  const { t } = useTranslation();
  const { setToast } = useToast();
  const asyncCreateWebAuthnRegistrationOptions = useApi(createWebAuthnRegistrationOptions);
  const asyncBindMfa = useApi(bindMfa);

  const preSignInErrorHandler = usePreSignInErrorHandler({ replace: true });
  const handleError = useErrorHandler();

  const registerWebAuthn = useCallback(async () => {
    const [optionsCreationError, options] = await asyncCreateWebAuthnRegistrationOptions();

    if (optionsCreationError) {
      await handleError(optionsCreationError);
      return;
    }

    if (!options) {
      return;
    }

    try {
      return await startRegistration(options);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setToast(error.message);
        return;
      }

      setToast(t('error.unknown'));
    }
  }, [asyncCreateWebAuthnRegistrationOptions, handleError, setToast, t]);

  return useCallback(async () => {
    const registrationResponse = await registerWebAuthn();

    if (!registrationResponse) {
      return;
    }

    const [error, result] = await asyncBindMfa({
      ...registrationResponse,
      type: MfaFactor.WebAuthn,
    });

    if (error) {
      await handleError(error, preSignInErrorHandler);
      return;
    }

    if (result) {
      window.location.replace(result.redirectTo);
    }
  }, [asyncBindMfa, handleError, preSignInErrorHandler, registerWebAuthn]);
};

export default useBindWebAuthn;
