import { Setting, CreateSetting, Settings } from '@logto/schemas';
import { OmitAutoSetFields } from '@logto/shared';

import { buildFindEntityById } from '@/database/find-entity-by-id';
import { buildUpdateWhere } from '@/database/update-where';

export const defaultSettingId = 'default';

export const getSetting = async () =>
  buildFindEntityById<CreateSetting, Setting>(Settings)(defaultSettingId);

export const updateSetting = async (setting: Partial<OmitAutoSetFields<CreateSetting>>) => {
  return buildUpdateWhere<CreateSetting, Setting>(
    Settings,
    true
  )({ set: setting, where: { id: defaultSettingId }, jsonbMode: 'merge' });
};
