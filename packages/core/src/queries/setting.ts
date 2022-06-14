import { Setting, CreateSetting, Settings } from '@logto/schemas';
import { sql } from 'slonik';

import { buildUpdateWhere } from '@/database/update-where';
import { convertToIdentifiers, OmitAutoSetFields } from '@/database/utils';
import envSet from '@/env-set';

export const defaultSettingId = 'default';

const { table, fields } = convertToIdentifiers(Settings);

export const getSetting = async () =>
  envSet.pool.one<Setting>(sql`
    select ${sql.join(Object.values(fields), sql`, `)}
    from ${table}
    where ${fields.id}=${defaultSettingId}
  `);

export const updateSetting = async (
  setting: Partial<OmitAutoSetFields<CreateSetting>>,
  jsonbMode: 'replace' | 'merge' = 'merge'
) => {
  return buildUpdateWhere<CreateSetting, Setting>(
    Settings,
    true
  )({ set: setting, where: { id: defaultSettingId }, jsonbMode });
};
