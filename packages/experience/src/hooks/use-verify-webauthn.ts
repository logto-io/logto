import { MfaFactor } from '@logto/schemas';
import { startAuthentication } from '@simplewebauthn/browser';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { generateWebAuthnAuthnOptions, verifyMfa } from '@/apis/interaction';

import useApi from './use-api';
import useErrorHandler from './use-error-handler';
import usePreSignInErrorHandler from './use-pre-sign-in-error-handler';
import useToast from './use-toast';

const useVerifyWebAuthn = () => {
  const { t } = useTranslation();
  const { setToast } = useToast();

  const asyncGenerateWebAuthnAuthnOptions = useApi(generateWebAuthnAuthnOptions);
  const asyncVerifyMfa = useApi(verifyMfa);

  const preSignInErrorHandler = usePreSignInErrorHandler({ replace: true });
  const handleError = useErrorHandler();

  const authenticateWebAuthn = useCallback(async () => {
    const [optionsGenerationError, options] = await asyncGenerateWebAuthnAuthnOptions();

    if (optionsGenerationError) {
      await handleError(optionsGenerationError);
      return;
    }

    if (!options) {
      return;
    }

    try {
      return await startAuthentication(options);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setToast(error.message);
        return;
      }

      setToast(t('error.unknown'));
    }
  }, [asyncGenerateWebAuthnAuthnOptions, handleError, setToast, t]);

  return useCallback(async () => {
    const authResponse = await authenticateWebAuthn();
    if (!authResponse) {
      return;
    }

    const [error, result] = await asyncVerifyMfa({
      ...authResponse,
      type: MfaFactor.WebAuthn,
    });

    if (error) {
      await handleError(error, preSignInErrorHandler);
      return;
    }

    if (result) {
      window.location.replace(result.redirectTo);
    }
  }, [asyncVerifyMfa, authenticateWebAuthn, handleError, preSignInErrorHandler]);
};

export default useVerifyWebAuthn;
