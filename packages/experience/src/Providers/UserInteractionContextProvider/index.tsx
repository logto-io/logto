import {
  experience,
  ExtraParamsKey,
  type SsoConnectorMetadata,
  type VerificationType,
} from '@logto/schemas';
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

import useSessionStorage, { StorageKeys } from '@/hooks/use-session-storages';
import { useSieMethods } from '@/hooks/use-sie';
import { type IdentifierInputValue } from '@/shared/components/InputFields/SmartInputField';
import { UserMfaFlow } from '@/types';

import UserInteractionContext, { type UserInteractionContextType } from './UserInteractionContext';

type Props = {
  readonly children: ReactNode;
};

/**
 * UserInteractionContextProvider
 *
 * This component manages user interaction data during the sign-in process,
 * combining React's Context API with session storage to enable cross-page
 * data persistence and access.
 *
 * The cached data provided by this provider primarily helps improve the sign-in experience for end users.
 */
const UserInteractionContextProvider = ({ children }: Props) => {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const { ssoConnectors } = useSieMethods();
  const { get, set, remove } = useSessionStorage();
  const [ssoEmail, setSsoEmail] = useState<string | undefined>(get(StorageKeys.SsoEmail));
  const [domainFilteredConnectors, setDomainFilteredConnectors] = useState<SsoConnectorMetadata[]>(
    get(StorageKeys.SsoConnectors) ?? []
  );
  const [identifierInputValue, setIdentifierInputValue] = useState<
    IdentifierInputValue | undefined
  >(get(StorageKeys.IdentifierInputValue));

  const [forgotPasswordIdentifierInputValue, setForgotPasswordIdentifierInputValue] = useState<
    IdentifierInputValue | undefined
  >(get(StorageKeys.ForgotPasswordIdentifierInputValue));

  const [verificationIdsMap, setVerificationIdsMap] = useState(
    get(StorageKeys.verificationIds) ?? {}
  );

  const [hasBoundPasskey, setHasBoundPasskey] = useState(false);

  useEffect(() => {
    if (!ssoEmail) {
      remove(StorageKeys.SsoEmail);
      return;
    }

    set(StorageKeys.SsoEmail, ssoEmail);
  }, [ssoEmail, remove, set]);

  useEffect(() => {
    if (domainFilteredConnectors.length === 0) {
      remove(StorageKeys.SsoConnectors);
      return;
    }

    set(StorageKeys.SsoConnectors, domainFilteredConnectors);
  }, [domainFilteredConnectors, remove, set]);

  useEffect(() => {
    if (!identifierInputValue) {
      remove(StorageKeys.IdentifierInputValue);
      return;
    }

    set(StorageKeys.IdentifierInputValue, identifierInputValue);
  }, [identifierInputValue, remove, set]);

  useEffect(() => {
    if (!forgotPasswordIdentifierInputValue) {
      remove(StorageKeys.ForgotPasswordIdentifierInputValue);
      return;
    }

    set(StorageKeys.ForgotPasswordIdentifierInputValue, forgotPasswordIdentifierInputValue);
  }, [forgotPasswordIdentifierInputValue, remove, set]);

  useEffect(() => {
    if (Object.keys(verificationIdsMap).length === 0) {
      remove(StorageKeys.verificationIds);
      return;
    }

    set(StorageKeys.verificationIds, verificationIdsMap);
  }, [verificationIdsMap, remove, set]);

  useEffect(() => {
    const isOneTimeTokenRoute = pathname.includes(experience.routes.oneTimeToken);
    const hasOneTimeTokenParam = searchParams.has(ExtraParamsKey.OneTimeToken);
    const isMfaRoute =
      pathname.includes(`/${UserMfaFlow.MfaBinding}`) ||
      pathname.includes(`/${UserMfaFlow.MfaVerification}`) ||
      pathname.includes('/mfa-onboarding');

    if (!isOneTimeTokenRoute && !hasOneTimeTokenParam && !isMfaRoute) {
      remove(StorageKeys.OneTimeTokenSignIn);
    }
  }, [pathname, remove, searchParams]);

  const ssoConnectorsMap = useMemo(
    () => new Map(ssoConnectors.map((connector) => [connector.id, connector])),
    [ssoConnectors]
  );

  const clearInteractionContextSessionStorage = useCallback(() => {
    remove(StorageKeys.IdentifierInputValue);
    remove(StorageKeys.ForgotPasswordIdentifierInputValue);
    remove(StorageKeys.verificationIds);
    remove(StorageKeys.OneTimeTokenSignIn);
  }, [remove]);

  const setVerificationId = useCallback((type: VerificationType, id: string) => {
    setVerificationIdsMap((previous) => ({ ...previous, [type]: id }));
  }, []);

  const userInteractionContext = useMemo<UserInteractionContextType>(
    () => ({
      ssoEmail,
      setSsoEmail,
      availableSsoConnectorsMap: ssoConnectorsMap,
      ssoConnectors: domainFilteredConnectors,
      setSsoConnectors: setDomainFilteredConnectors,
      identifierInputValue,
      setIdentifierInputValue,
      forgotPasswordIdentifierInputValue,
      setForgotPasswordIdentifierInputValue,
      verificationIdsMap,
      setVerificationId,
      clearInteractionContextSessionStorage,
      hasBoundPasskey,
      setHasBoundPasskey,
    }),
    [
      ssoEmail,
      ssoConnectorsMap,
      domainFilteredConnectors,
      identifierInputValue,
      forgotPasswordIdentifierInputValue,
      verificationIdsMap,
      setVerificationId,
      clearInteractionContextSessionStorage,
      hasBoundPasskey,
    ]
  );

  return (
    <UserInteractionContext.Provider value={userInteractionContext}>
      {children}
    </UserInteractionContext.Provider>
  );
};

export default UserInteractionContextProvider;
