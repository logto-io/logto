import { builtInLanguages as builtInConsoleLanguages } from '@logto/phrases';
import { useContext, useEffect, useMemo } from 'react';
import { z } from 'zod';

import { AppThemeContext, buildDefaultAppearanceMode } from '@/contexts/AppThemeProvider';
import { appearanceModeGuard } from '@/types/appearance-mode';

import useMeCustomData from './use-me-custom-data';

const adminConsolePreferencesKey = 'adminConsolePreferences';

const userPreferencesGuard = z.object({
  language: z.enum(builtInConsoleLanguages).optional(),
  appearanceMode: appearanceModeGuard,
  experienceNoticeConfirmed: z.boolean().optional(),
  getStartedHidden: z.boolean().optional(),
  connectorSieNoticeConfirmed: z.boolean().optional(),
});

export type UserPreferences = z.infer<typeof userPreferencesGuard>;

const useUserPreferences = () => {
  const { data, error, isLoading, isLoaded, update: updateMeCustomData } = useMeCustomData();
  const { setAppearanceMode } = useContext(AppThemeContext);

  const userPreferences = useMemo(() => {
    const parsed = z.object({ [adminConsolePreferencesKey]: userPreferencesGuard }).safeParse(data);

    return parsed.success
      ? parsed.data[adminConsolePreferencesKey]
      : {
          appearanceMode: buildDefaultAppearanceMode(),
        };
  }, [data]);

  const update = async (data: Partial<UserPreferences>) => {
    await updateMeCustomData({
      [adminConsolePreferencesKey]: {
        ...userPreferences,
        ...data,
      },
    });
  };

  useEffect(() => {
    setAppearanceMode(userPreferences.appearanceMode);
  }, [setAppearanceMode, userPreferences.appearanceMode]);

  return {
    isLoading,
    isLoaded,
    data: userPreferences,
    update,
    error,
  };
};

export default useUserPreferences;
