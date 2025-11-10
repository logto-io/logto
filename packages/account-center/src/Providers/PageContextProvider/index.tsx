import { Theme } from '@logto/schemas';
import { useEffect, useMemo, useState } from 'react';

import { getSignInExperienceSettings } from '@/apis/sign-in-experience';
import { getThemeBySystemPreference, subscribeToSystemTheme } from '@/utils/theme';

import type { PageContextType } from './PageContext';
import PageContext from './PageContext';

type Props = {
  readonly children: React.ReactNode;
};

const PageContextProvider = ({ children }: Props) => {
  const [theme, setTheme] = useState(Theme.Light);
  const [experienceSettings, setExperienceSettings] =
    useState<PageContextType['experienceSettings']>(undefined);
  const [isLoadingExperience, setIsLoadingExperience] = useState(true);
  const [experienceError, setExperienceError] = useState<Error>();

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoadingExperience(true);

      try {
        const settings = await getSignInExperienceSettings();
        setExperienceSettings(settings);
        setExperienceError(undefined);
      } catch (error: unknown) {
        setExperienceSettings(undefined);
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
      isLoadingExperience,
      experienceError,
    }),
    [experienceError, experienceSettings, isLoadingExperience, theme]
  );

  return <PageContext.Provider value={value}>{children}</PageContext.Provider>;
};

export default PageContextProvider;
