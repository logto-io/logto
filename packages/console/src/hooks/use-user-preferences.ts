import { languageKeys } from '@logto/core-kit';
import { useLogto } from '@logto/react';
import { AppearanceMode } from '@logto/schemas';
import { Nullable, Optional } from '@silverhand/essentials';
import { useCallback, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { z } from 'zod';

import { themeStorageKey } from '@/consts';

import useApi, { RequestError } from './use-api';

const userPreferencesGuard = z.object({
  language: z.enum(languageKeys).optional(),
  appearanceMode: z.nativeEnum(AppearanceMode),
  experienceNoticeConfirmed: z.boolean().optional(),
  getStartedHidden: z.boolean().optional(),
});

export type UserPreferences = z.infer<typeof userPreferencesGuard>;

const key = 'adminConsolePreferences';

const getEnumFromArray = <T extends string>(
  array: T[],
  value: Nullable<Optional<string>>
): Optional<T> => array.find((element) => element === value);

const useUserPreferences = () => {
  const { isAuthenticated, error: authError } = useLogto();
  const shouldFetch = isAuthenticated && !authError;
  const { data, mutate, error } = useSWR<unknown, RequestError>(
    shouldFetch && '/api/users/me/custom-data'
  );
  const api = useApi();

  const parseData = useCallback((): UserPreferences => {
    try {
      return z.object({ [key]: userPreferencesGuard }).parse(data).adminConsolePreferences;
    } catch {
      return {
        appearanceMode:
          getEnumFromArray(Object.values(AppearanceMode), localStorage.getItem(themeStorageKey)) ??
          AppearanceMode.SyncWithSystem,
      };
    }
  }, [data]);

  const userPreferences = useMemo(() => parseData(), [parseData]);

  const update = async (data: Partial<UserPreferences>) => {
    const updated = await api
      .patch('/api/users/me/custom-data', {
        json: {
          customData: {
            [key]: {
              ...userPreferences,
              ...data,
            },
          },
        },
      })
      .json();
    void mutate(updated);
  };

  useEffect(() => {
    localStorage.setItem(themeStorageKey, userPreferences.appearanceMode);
  }, [userPreferences.appearanceMode]);

  return {
    isLoading: !data && !error,
    isLoaded: Boolean(data && !error),
    data: userPreferences,
    update,
    error,
  };
};

export default useUserPreferences;
