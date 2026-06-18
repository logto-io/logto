import { type UserMfaVerificationResponse } from '@logto/schemas';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import {
  getPasskeyFieldControl,
  hasVisibleMfaSection,
  hasVisiblePasskeySection,
} from '@ac/utils/security-page';

import { getMfaVerifications } from '../../apis/mfa';
import useApi from '../../hooks/use-api';

type MfaVerificationsContextType = {
  mfaVerifications?: UserMfaVerificationResponse;
  isLoading: boolean;
  hasLoaded: boolean;
};

const MfaVerificationsContext = createContext<MfaVerificationsContextType>({
  mfaVerifications: undefined,
  isLoading: false,
  hasLoaded: false,
});

export const useMfaVerifications = () => useContext(MfaVerificationsContext);

type Props = {
  readonly children: React.ReactNode;
};

/**
 * Fetches the user's MFA verifications once and shares them across the security sections. Both the
 * MFA and passkey sections read the same WebAuthn credentials, so a single request avoids hitting
 * `/mfa-verifications` twice when both sections are visible.
 */
const MfaVerificationsProvider = ({ children }: Props) => {
  const { accountCenterSettings, experienceSettings } = useContext(PageContext);
  const [mfaVerifications, setMfaVerifications] = useState<UserMfaVerificationResponse>();
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const passkeyControl = getPasskeyFieldControl(
    accountCenterSettings?.fields.passkey,
    accountCenterSettings?.fields.mfa
  );
  const shouldLoad =
    hasVisibleMfaSection(accountCenterSettings?.fields.mfa, experienceSettings) ||
    hasVisiblePasskeySection(passkeyControl, experienceSettings);

  const getMfaVerificationsRequest = useApi(getMfaVerifications, { silent: true });

  const fetchMfaVerifications = useCallback(async () => {
    setIsLoading(true);
    const [error, result] = await getMfaVerificationsRequest();
    if (!error && result) {
      setMfaVerifications(result);
    }
    setHasLoaded(true);
    setIsLoading(false);
  }, [getMfaVerificationsRequest]);

  useEffect(() => {
    if (shouldLoad) {
      void fetchMfaVerifications();
    }
  }, [shouldLoad, fetchMfaVerifications]);

  const value = useMemo<MfaVerificationsContextType>(
    () => ({ mfaVerifications, isLoading, hasLoaded }),
    [mfaVerifications, isLoading, hasLoaded]
  );

  return (
    <MfaVerificationsContext.Provider value={value}>{children}</MfaVerificationsContext.Provider>
  );
};

export default MfaVerificationsProvider;
