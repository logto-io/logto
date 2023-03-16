import { builtInLanguages as builtInConsoleLanguages } from '@logto/phrases';
import { useEffect, useMemo } from 'react';
import { z } from 'zod';

import { appearanceModeStorageKey } from '@/consts';
import { appearanceModeGuard } from '@/types/theme';
import { getAppearanceModeFromLocalStorage } from '@/utils/theme';

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

  const userPreferences = useMemo(() => {
    const parsed = z.object({ [adminConsolePreferencesKey]: userPreferencesGuard }).safeParse(data);

    return parsed.success
      ? parsed.data[adminConsolePreferencesKey]
      : {
          appearanceMode: getAppearanceModeFromLocalStorage(),
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
    localStorage.setItem(appearanceModeStorageKey, userPreferences.appearanceMode);
  }, [userPreferences.appearanceMode]);

  return {
    isLoading,
    isLoaded,
    data: userPreferences,
    update,
    error,
  };
};

export default useUserPreferences;
