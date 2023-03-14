import type { DatabaseTransactionConnection } from 'slonik';
import { sql } from 'slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

enum AppearanceMode {
  SyncWithSystem = 'system',
  LightMode = 'light',
  DarkMode = 'dark',
}

enum ThemeAdaptionStrategy {
  FollowSystem = 'followSystem',
  LightOnly = 'lightOnly',
  DarkOnly = 'darkOnly',
}

const appearanceModeToThemeAdaptionStrategyMappings: Record<AppearanceMode, ThemeAdaptionStrategy> =
  {
    [AppearanceMode.SyncWithSystem]: ThemeAdaptionStrategy.FollowSystem,
    [AppearanceMode.LightMode]: ThemeAdaptionStrategy.LightOnly,
    [AppearanceMode.DarkMode]: ThemeAdaptionStrategy.DarkOnly,
  } as const;

const themeAdaptionStrategyToAppearanceModeMappings: Record<ThemeAdaptionStrategy, AppearanceMode> =
  {
    [ThemeAdaptionStrategy.FollowSystem]: AppearanceMode.SyncWithSystem,
    [ThemeAdaptionStrategy.LightOnly]: AppearanceMode.LightMode,
    [ThemeAdaptionStrategy.DarkOnly]: AppearanceMode.DarkMode,
  } as const;

type OldConsolePreferences = {
  appearanceMode: AppearanceMode;
} & Record<string, unknown>;

type OldUserCustomData = {
  adminConsolePreferences: OldConsolePreferences;
} & Record<string, unknown>;

type NewConsolePreferences = {
  themeAdaptionStrategy: ThemeAdaptionStrategy;
} & Record<string, unknown>;

type NewUserCustomData = {
  adminConsolePreferences: NewConsolePreferences;
} & Record<string, unknown>;

type OldUserData = {
  tenantId: string;
  id: string;
  customData: OldUserCustomData;
};

type NewUserData = {
  tenantId: string;
  id: string;
  customData: NewUserCustomData;
};

const alterAdminConsoleData = async (
  userData: OldUserData,
  pool: DatabaseTransactionConnection
) => {
  const { tenantId, id, customData: oldCustomData } = userData;

  const { adminConsolePreferences: oldAdminConsolePreferences, ...others } = oldCustomData;

  const { appearanceMode, ...othersPreferences } = oldAdminConsolePreferences;

  const newUserCustomData: NewUserCustomData = {
    ...others,
    adminConsolePreferences: {
      ...othersPreferences,
      themeAdaptionStrategy: appearanceModeToThemeAdaptionStrategyMappings[appearanceMode],
    },
  };

  await pool.query(
    sql`update users set custom_data = ${JSON.stringify(
      newUserCustomData
    )} where tenant_id = ${tenantId} and id = ${id}`
  );
};

const rollbackAdminConsoleData = async (
  userData: NewUserData,
  pool: DatabaseTransactionConnection
) => {
  const { tenantId, id, customData: newCustomData } = userData;

  const { adminConsolePreferences: newAdminConsolePreferences, ...others } = newCustomData;

  const { themeAdaptionStrategy, ...othersPreferences } = newAdminConsolePreferences;

  const oldCustomData: OldUserCustomData = {
    ...others,
    adminConsolePreferences: {
      ...othersPreferences,
      appearanceMode: themeAdaptionStrategyToAppearanceModeMappings[themeAdaptionStrategy],
    },
  };

  await pool.query(
    sql`update users set custom_data = ${JSON.stringify(
      oldCustomData
    )} where where tenant_id = ${tenantId} and id = ${id}`
  );
};

const alteration: AlterationScript = {
  up: async (pool) => {
    const rows = await pool.many<OldUserData>(sql`select tenant_id, id, custom_data from users`);
    await Promise.all(rows.map(async (row) => alterAdminConsoleData(row, pool)));
  },
  down: async (pool) => {
    const rows = await pool.many<NewUserData>(sql`select tenant_id, id, custom_data from users`);
    await Promise.all(rows.map(async (row) => rollbackAdminConsoleData(row, pool)));
  },
};

export default alteration;
