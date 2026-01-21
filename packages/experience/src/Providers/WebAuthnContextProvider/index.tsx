import { browserSupportsWebAuthn } from '@simplewebauthn/browser';
import { useState, useMemo, type ReactNode, useEffect } from 'react';

import { createWebAuthnAuthentication } from '@/apis/experience/mfa';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import { useSieMethods } from '@/hooks/use-sie';

import WebAuthnContext, { type WebAuthnAuthenticationOptionsResult } from './WebAuthnContext';

const WebAuthnContextProvider = ({ children }: { readonly children: ReactNode }) => {
  const { passkeySignIn } = useSieMethods();
  const handleError = useErrorHandler();
  const asyncCreateAuthentication = useApi(createWebAuthnAuthentication);
  const [authenticationOptionsResult, setAuthenticationOptionsResult] =
    useState<WebAuthnAuthenticationOptionsResult>();
  const [isLoading, setIsLoading] = useState(false);
  const fetched = Boolean(authenticationOptionsResult);

  useEffect(() => {
    if (!browserSupportsWebAuthn() || !passkeySignIn?.enabled || fetched) {
      return;
    }

    (async () => {
      setIsLoading(true);
      const [error, result] = await asyncCreateAuthentication();
      setIsLoading(false);

      if (error) {
        await handleError(error);
        return;
      }

      if (result) {
        setAuthenticationOptionsResult(result);
      }
    })();
  }, [asyncCreateAuthentication, fetched, handleError, passkeySignIn?.enabled]);

  const contextValue = useMemo(
    () => ({
      authenticationOptionsResult,
      isLoading,
    }),
    [authenticationOptionsResult, isLoading]
  );

  return <WebAuthnContext.Provider value={contextValue}>{children}</WebAuthnContext.Provider>;
};

export default WebAuthnContextProvider;
