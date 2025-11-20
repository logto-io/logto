import { Theme } from '@logto/schemas';
import { useEffect, useMemo, useState } from 'react';

import { getAccountCenterSettings } from '@ac/apis/account-center';
import { getSignInExperienceSettings } from '@ac/apis/sign-in-experience';
import { getThemeBySystemPreference, subscribeToSystemTheme } from '@ac/utils/theme';

import type { PageContextType } from './PageContext';
import PageContext from './PageContext';

type Props = {
  readonly children: React.ReactNode;
};

const PageContextProvider = ({ children }: Props) => {
  const [theme, setTheme] = useState(Theme.Light);
  const [experienceSettings, setExperienceSettings] =
    useState<PageContextType['experienceSettings']>(undefined);
  const [accountCenterSettings, setAccountCenterSettings] =
    useState<PageContextType['accountCenterSettings']>(undefined);
  const [verificationId, setVerificationId] = useState<string>();
  const [isLoadingExperience, setIsLoadingExperience] = useState(true);
  const [experienceError, setExperienceError] = useState<Error>();

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
      setTheme,
      experienceSettings,
      setExperienceSettings,
      accountCenterSettings,
      setAccountCenterSettings,
      verificationId,
      setVerificationId,
      isLoadingExperience,
      experienceError,
    }),
    [
      accountCenterSettings,
      experienceError,
      experienceSettings,
      isLoadingExperience,
      theme,
      verificationId,
    ]
  );

  return <PageContext.Provider value={value}>{children}</PageContext.Provider>;
};

export default PageContextProvider;
