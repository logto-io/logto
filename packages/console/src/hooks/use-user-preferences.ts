import { builtInLanguages as builtInConsoleLanguages } from '@logto/phrases';
import { AppearanceMode } from '@logto/schemas';
import type { Nullable, Optional } from '@silverhand/essentials';
import { useEffect, useMemo } from 'react';
import { z } from 'zod';

import { themeStorageKey } from '@/consts';

import useMeCustomData from './use-me-custom-data';

const adminConsolePreferencesKey = 'adminConsolePreferences';

const userPreferencesGuard = z.object({
  language: z.enum(builtInConsoleLanguages).optional(),
  appearanceMode: z.nativeEnum(AppearanceMode),
  experienceNoticeConfirmed: z.boolean().optional(),
  getStartedHidden: z.boolean().optional(),
  connectorSieNoticeConfirmed: z.boolean().optional(),
});

export type UserPreferences = z.infer<typeof userPreferencesGuard>;

const getEnumFromArray = <T extends string>(
  array: T[],
  value: Nullable<Optional<string>>
): Optional<T> => array.find((element) => element === value);

const useUserPreferences = () => {
  const { data, error, isLoading, isLoaded, update: updateMeCustomData } = useMeCustomData();

  const userPreferences = useMemo(() => {
    const parsed = z.object({ [adminConsolePreferencesKey]: userPreferencesGuard }).safeParse(data);

    return parsed.success
      ? parsed.data[adminConsolePreferencesKey]
      : {
          appearanceMode:
            getEnumFromArray(
              Object.values(AppearanceMode),
              localStorage.getItem(themeStorageKey)
            ) ?? AppearanceMode.SyncWithSystem,
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
    localStorage.setItem(themeStorageKey, userPreferences.appearanceMode);
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
