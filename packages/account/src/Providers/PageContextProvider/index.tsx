import { useLogto } from '@logto/react';
import { Theme } from '@logto/schemas';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { getAccountCenterSettings } from '@ac/apis/account-center';
import { getSignInExperienceSettings } from '@ac/apis/sign-in-experience';
import { getUserInfo } from '@ac/apis/user';
import useApi from '@ac/hooks/use-api';
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

const PageContextProvider = ({ children }: Props) => {
  const { isAuthenticated } = useLogto();
  const getUserInfoRequest = useApi(getUserInfo, { silent: true });
  const [theme, setTheme] = useState(Theme.Light);
  const [toast, setToast] = useState('');
  const [experienceSettings, setExperienceSettings] =
    useState<PageContextType['experienceSettings']>(undefined);
  const [accountCenterSettings, setAccountCenterSettings] =
    useState<PageContextType['accountCenterSettings']>(undefined);
  const [userInfo, setUserInfo] = useState<PageContextType['userInfo']>(undefined);
  const [userInfoError, setUserInfoError] = useState<Error>();
  const [verificationId, setVerificationId] = useState<string>();
  const [isLoadingExperience, setIsLoadingExperience] = useState(true);
  const [experienceError, setExperienceError] = useState<Error>();

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
      return;
    }

    const fetchUserInfo = async () => {
      const [error, data] = await getUserInfoRequest();

      if (error || !data) {
        setUserInfoError(
          error instanceof Error ? error : new Error('Failed to load user information.')
        );
        return;
      }

      setUserInfo(data);
      setUserInfoError(undefined);
    };

    void fetchUserInfo();
  }, [getUserInfoRequest, isAuthenticated]);

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoadingExperience(true);

      try {
        const [settings, accountCenter] = await Promise.all([
          getSignInExperienceSettings(),
          getAccountCenterSettings(),
        ]);
        setExperienceSettings(settings);
        setAccountCenterSettings(accountCenter);
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
    if (!experienceSettings?.color.isDarkModeEnabled) {
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

  const value = useMemo<PageContextType>(
    () => ({
      theme,
      toast,
      setTheme,
      setToast,
      experienceSettings,
      setExperienceSettings,
      accountCenterSettings,
      setAccountCenterSettings,
      userInfo,
      setUserInfo,
      userInfoError,
      verificationId,
      setVerificationId: setVerificationIdCallback,
      isLoadingExperience,
      experienceError,
    }),
    [
      accountCenterSettings,
      experienceError,
      experienceSettings,
      isLoadingExperience,
      theme,
      toast,
      userInfo,
      userInfoError,
      verificationId,
      setVerificationIdCallback,
    ]
  );

  return <PageContext.Provider value={value}>{children}</PageContext.Provider>;
};

export default PageContextProvider;
