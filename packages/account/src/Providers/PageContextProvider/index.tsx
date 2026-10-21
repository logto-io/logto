import { useLogto } from '@logto/react';
import { Theme } from '@logto/schemas';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { getAccountCenterSettings } from '@ac/apis/account-center';
import { getAuthenticationPolicy } from '@ac/apis/authentication-policy';
import { getSignInExperienceSettings } from '@ac/apis/sign-in-experience';
import { getUserInfo } from '@ac/apis/user';
import { isDevFeaturesEnabled } from '@ac/constants/env';
import useApi from '@ac/hooks/use-api';
import { changeLanguage, getPreferredLanguage } from '@ac/i18n/utils';
import { getUiLocales } from '@ac/utils/account-center-route';
import { getThemeBySystemPreference, subscribeToSystemTheme } from '@ac/utils/theme';

import type { PageContextType } from './PageContext';
import PageContext from './PageContext';
import {
  clearVerificationRecord,
  getStoredVerificationId,
  persistVerificationRecord,
} from './verification-storage';

type Props = {
  readonly children: React.ReactNode;
};

/**
 * The policy only aligns the proactive step-up with the server, so a failed load must not block
 * Account Center: the step-up helpers fall back to the default window, and the Account API
 * challenge still corrects any disagreement.
 */
const getOptionalAuthenticationPolicy = async (): Promise<
  PageContextType['authenticationPolicy']
> => {
  try {
    return await getAuthenticationPolicy();
  } catch {}
};

const getInitialTheme = () => {
  if (document.documentElement.dataset.theme === Theme.Dark) {
    return Theme.Dark;
  }

  return Theme.Light;
};

const getInitialPlatform = (): PageContextType['platform'] =>
  document.body.classList.contains('mobile') ? 'mobile' : 'web';

const PageContextProvider = ({ children }: Props) => {
  const { isAuthenticated } = useLogto();
  const getUserInfoRequest = useApi(getUserInfo, { silent: true });
  const [theme, setTheme] = useState(getInitialTheme);
  const [toast, setToast] = useState('');
  const [experienceSettings, setExperienceSettings] =
    useState<PageContextType['experienceSettings']>(undefined);
  const [accountCenterSettings, setAccountCenterSettings] =
    useState<PageContextType['accountCenterSettings']>(undefined);
  const [authenticationPolicy, setAuthenticationPolicy] =
    useState<PageContextType['authenticationPolicy']>(undefined);
  const [userInfo, setUserInfo] = useState<PageContextType['userInfo']>(undefined);
  const [userInfoError, setUserInfoError] = useState<Error>();
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(false);
  const [verificationId, setVerificationId] = useState<string>();
  const [isLoadingExperience, setIsLoadingExperience] = useState(true);
  const [experienceError, setExperienceError] = useState<Error>();

  const loadUserInfo = useCallback(
    async ({
      clearOnError = false,
      showLoading = false,
      syncError = false,
    }: {
      clearOnError?: boolean;
      showLoading?: boolean;
      syncError?: boolean;
    } = {}) => {
      if (showLoading) {
        setIsLoadingUserInfo(true);
      }

      const [error, data] = await getUserInfoRequest();

      if (error || !data) {
        if (syncError) {
          setUserInfoError(
            error instanceof Error ? error : new Error('Failed to load user information.')
          );
        }

        if (clearOnError) {
          setUserInfo(undefined);
        }

        if (showLoading) {
          setIsLoadingUserInfo(false);
        }

        return;
      }

      setUserInfo(data);
      setUserInfoError(undefined);

      if (showLoading) {
        setIsLoadingUserInfo(false);
      }
    },
    [getUserInfoRequest]
  );

  const refreshUserInfo = useCallback(async () => {
    await loadUserInfo();
  }, [loadUserInfo]);

  useEffect(() => {
    const storedVerificationId = getStoredVerificationId();

    if (storedVerificationId) {
      setVerificationId(storedVerificationId);
    }
  }, []);

  const setVerificationIdCallback = useCallback((id?: string, expiresAt?: string) => {
    setVerificationId(id);

    if (!id || !expiresAt) {
      clearVerificationRecord();
      return;
    }

    persistVerificationRecord({
      verificationId: id,
      expiresAt,
    });
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setUserInfo(undefined);
      setUserInfoError(undefined);
      setIsLoadingUserInfo(false);
      return;
    }

    void loadUserInfo({
      clearOnError: true,
      showLoading: true,
      syncError: true,
    });
  }, [isAuthenticated, loadUserInfo]);

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoadingExperience(true);

      try {
        const [settings, accountCenter, authenticationPolicy] = await Promise.all([
          getSignInExperienceSettings(),
          getAccountCenterSettings(),
          // DEV: OIDC step-up authentication. The public policy only exists with the feature, and
          // only the step-up helpers consume it.
          isDevFeaturesEnabled ? getOptionalAuthenticationPolicy() : Promise.resolve(undefined),
        ]);
        await changeLanguage(
          getPreferredLanguage({
            languageSettings: settings.languageInfo,
            uiLocales: getUiLocales(),
          })
        );
        setExperienceSettings(settings);
        setAccountCenterSettings(accountCenter);
        setAuthenticationPolicy(authenticationPolicy);
        setExperienceError(undefined);
      } catch (error: unknown) {
        setExperienceSettings(undefined);
        setAccountCenterSettings(undefined);
        setExperienceError(
          error instanceof Error ? error : new Error('Failed to load sign-in experience settings.')
        );
      } finally {
        setIsLoadingExperience(false);
      }
    };

    void loadSettings();
  }, []);

  useEffect(() => {
    if (!experienceSettings) {
      return;
    }

    if (!experienceSettings.color.isDarkModeEnabled) {
      setTheme(Theme.Light);
      return;
    }

    const updateTheme = () => {
      setTheme(getThemeBySystemPreference());
    };

    updateTheme();
    const unsubscribe = subscribeToSystemTheme(updateTheme);

    return () => {
      unsubscribe();
    };
  }, [experienceSettings]);

  const platform = getInitialPlatform();

  const value = useMemo<PageContextType>(
    () => ({
      theme,
      toast,
      platform,
      setTheme,
      setToast,
      experienceSettings,
      setExperienceSettings,
      accountCenterSettings,
      setAccountCenterSettings,
      authenticationPolicy,
      userInfo,
      refreshUserInfo,
      userInfoError,
      isLoadingUserInfo,
      verificationId,
      setVerificationId: setVerificationIdCallback,
      isLoadingExperience,
      experienceError,
    }),
    [
      accountCenterSettings,
      authenticationPolicy,
      experienceError,
      experienceSettings,
      isLoadingExperience,
      platform,
      refreshUserInfo,
      theme,
      toast,
      userInfo,
      userInfoError,
      isLoadingUserInfo,
      verificationId,
      setVerificationIdCallback,
    ]
  );

  return <PageContext.Provider value={value}>{children}</PageContext.Provider>;
};

export default PageContextProvider;
