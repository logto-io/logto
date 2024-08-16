import { builtInLanguages as builtInConsoleLanguages } from '@logto/phrases';
import type { Theme } from '@logto/schemas';
import { useContext, useEffect, useMemo } from 'react';
import { z } from 'zod';

import { AppThemeContext, buildDefaultAppearanceMode } from '@/contexts/AppThemeProvider';
import type { DynamicAppearanceMode } from '@/types/appearance-mode';
import { appearanceModeGuard } from '@/types/appearance-mode';

import useCurrentUser from './use-current-user';

const adminConsolePreferencesKey = 'adminConsolePreferences';

const userPreferencesGuard = z.object({
  language: z.enum(builtInConsoleLanguages).optional(),
  appearanceMode: appearanceModeGuard.optional(),
  experienceNoticeConfirmed: z.boolean().optional(),
  connectorSieNoticeConfirmed: z.boolean().optional(),
  managementApiAcknowledged: z.boolean().optional(),
  roleWithManagementApiAccessNotificationAcknowledged: z.boolean().optional(),
  m2mRoleNotificationAcknowledged: z.boolean().optional(),
  /* === Add on feature related fields === */
  mfaUpsellNoticeAcknowledged: z.boolean().optional(),
  m2mUpsellNoticeAcknowledged: z.boolean().optional(),
  apiResourceUpsellNoticeAcknowledged: z.boolean().optional(),
  organizationUpsellNoticeAcknowledged: z.boolean().optional(),
  tenantMembersUpsellNoticeAcknowledged: z.boolean().optional(),
  enterpriseSsoUpsellNoticeAcknowledged: z.boolean().optional(),
  addOnChangesInCurrentCycleNoticeAcknowledged: z.boolean().optional(),
  /* === Add on feature related fields === */
});

type UserPreferences = z.infer<typeof userPreferencesGuard>;

type DefaultUserPreference = {
  language: (typeof builtInConsoleLanguages)[number];
  appearanceMode: Theme | DynamicAppearanceMode.System;
} & Omit<UserPreferences, 'language' | 'appearanceMode'>;

const defaultUserPreferences: DefaultUserPreference = {
  appearanceMode: buildDefaultAppearanceMode(),
  language: 'en',
};

const useUserPreferences = () => {
  const { customData, error, isLoading, isLoaded, updateCustomData } = useCurrentUser();
  const { setAppearanceMode } = useContext(AppThemeContext);

  const userPreferences = useMemo(() => {
    const parsed = z
      .object({ [adminConsolePreferencesKey]: userPreferencesGuard })
      .safeParse(customData);

    return parsed.success
      ? {
          ...defaultUserPreferences,
          ...parsed.data[adminConsolePreferencesKey],
        }
      : defaultUserPreferences;
  }, [customData]);

  const update = async (data: Partial<UserPreferences>) => {
    await updateCustomData({
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
