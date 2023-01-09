import type { Setting, CreateSetting } from '@logto/schemas';
import { Settings } from '@logto/schemas';
import type { OmitAutoSetFields } from '@logto/shared';
import type { CommonQueryMethods } from 'slonik';

import { buildFindEntityByIdWithPool } from '#src/database/find-entity-by-id.js';
import { buildUpdateWhereWithPool } from '#src/database/update-where.js';
import envSet from '#src/env-set/index.js';

export const defaultSettingId = 'default';

export const createSettingQueries = (pool: CommonQueryMethods) => {
  const getSetting = async () =>
    buildFindEntityByIdWithPool(pool)<CreateSetting, Setting>(Settings)(defaultSettingId);

  const updateSetting = async (setting: Partial<OmitAutoSetFields<CreateSetting>>) => {
    return buildUpdateWhereWithPool(pool)<CreateSetting, Setting>(Settings, true)({
      set: setting,
      where: { id: defaultSettingId },
      jsonbMode: 'merge',
    });
  };

  return { getSetting, updateSetting };
};

/** @deprecated Will be removed soon. Use createSettingQueries() factory instead. */
export const { getSetting, updateSetting } = createSettingQueries(envSet.pool);
