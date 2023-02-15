import { builtInLanguages as builtInConsoleLanguages } from '@logto/phrases';
import { useLogto } from '@logto/react';
import { AppearanceMode } from '@logto/schemas';
import type { Nullable, Optional } from '@silverhand/essentials';
import { t } from 'i18next';
import { useCallback, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import type { BareFetcher } from 'swr';
import useSWR from 'swr';
import { z } from 'zod';

import { meApi, themeStorageKey, adminTenantEndpoint } from '@/consts';

import type { RequestError } from './use-api';
import { useStaticApi } from './use-api';
import useLogtoUserId from './use-logto-user-id';

const userPreferencesGuard = z.object({
  language: z.enum(builtInConsoleLanguages).optional(),
  appearanceMode: z.nativeEnum(AppearanceMode),
  experienceNoticeConfirmed: z.boolean().optional(),
  getStartedHidden: z.boolean().optional(),
  connectorSieNoticeConfirmed: z.boolean().optional(),
});

export type UserPreferences = z.infer<typeof userPreferencesGuard>;

const key = 'adminConsolePreferences';

const getEnumFromArray = <T extends string>(
  array: T[],
  value: Nullable<Optional<string>>
): Optional<T> => array.find((element) => element === value);

const useUserPreferences = () => {
  const { isAuthenticated, error: authError } = useLogto();
  const userId = useLogtoUserId();
  const shouldFetch = isAuthenticated && !authError && userId;
  const api = useStaticApi({ prefixUrl: adminTenantEndpoint, resourceIndicator: meApi.indicator });
  const fetcher = useCallback<BareFetcher>(
    async (resource, init) => {
      const response = await api.get(resource, init);

      return response.json();
    },
    [api]
  );
  const { data, mutate, error } = useSWR<unknown, RequestError>(
    shouldFetch && `me/custom-data`,
    fetcher
  );

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
    if (!userId) {
      toast.error(t('errors.unexpected_error'));

      return;
    }

    const updated = await api
      .patch(`me/custom-data`, {
        json: {
          [key]: {
            ...userPreferences,
            ...data,
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
