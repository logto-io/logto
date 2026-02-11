import { type WebAuthnAuthenticationOptions } from '@logto/schemas';
import { browserSupportsWebAuthn } from '@simplewebauthn/browser';
import {
  useState,
  useMemo,
  type ReactNode,
  useEffect,
  useCallback,
  useContext,
  useRef,
} from 'react';

import { createSignInWebAuthnAuthenticationOptions } from '@/apis/experience/passkey-sign-in';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import { useSieMethods } from '@/hooks/use-sie';

import PageContext from '../PageContextProvider/PageContext';

import WebAuthnContext from './WebAuthnContext';

const WebAuthnContextProvider = ({ children }: { readonly children: ReactNode }) => {
  const { isPreview } = useContext(PageContext);
  const { passkeySignIn } = useSieMethods();
  const handleError = useErrorHandler();
  const asyncCreateAuthenticationOptions = useApi(createSignInWebAuthnAuthenticationOptions);
  const [authenticationOptions, setAuthenticationOptions] =
    useState<WebAuthnAuthenticationOptions>();
  const [isLoading, setIsLoading] = useState(false);
  const [isConsumed, setIsConsumed] = useState(false);
  const shouldFetch =
    !!passkeySignIn?.enabled && !isPreview && (!authenticationOptions || isConsumed);

  const conditionalUIAbortControllerRef = useRef<AbortController>();

  const markAuthenticationOptionsConsumed = useCallback(() => {
    setAuthenticationOptions(undefined);
    setIsConsumed(true);
  }, []);

  const abortConditionalUI = useCallback(() => {
    conditionalUIAbortControllerRef.current?.abort();
    // eslint-disable-next-line @silverhand/fp/no-mutation
    conditionalUIAbortControllerRef.current = undefined;
  }, []);

  const setConditionalUIAbortController = useCallback((controller: AbortController | undefined) => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    conditionalUIAbortControllerRef.current = controller;
  }, []);

  useEffect(() => {
    if (!browserSupportsWebAuthn() || !shouldFetch) {
      return;
    }

    (async () => {
      setIsLoading(true);
      const [error, result] = await asyncCreateAuthenticationOptions();
      setIsLoading(false);

      if (error) {
        await handleError(error);
        return;
      }

      if (result) {
        setAuthenticationOptions(result.authenticationOptions);
        setIsConsumed(false);
      }
    })();
  }, [asyncCreateAuthenticationOptions, handleError, shouldFetch]);

  const contextValue = useMemo(
    () => ({
      authenticationOptions,
      isLoading,
      markAuthenticationOptionsConsumed,
      abortConditionalUI,
      setConditionalUIAbortController,
    }),
    [
      authenticationOptions,
      isLoading,
      markAuthenticationOptionsConsumed,
      abortConditionalUI,
      setConditionalUIAbortController,
    ]
  );

  return <WebAuthnContext.Provider value={contextValue}>{children}</WebAuthnContext.Provider>;
};

export default WebAuthnContextProvider;
