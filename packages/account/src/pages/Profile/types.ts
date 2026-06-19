import { type AccountCenterControlValue, type CustomProfileField } from '@logto/schemas';

import type { ProfileFieldControlKey } from '@ac/utils/profile-field-control';

export type { ProfileFieldControlKey } from '@ac/utils/profile-field-control';

export type ProfileFieldRow = {
  name: string;
  label: string;
  value?: React.ReactNode;
  controlKey: ProfileFieldControlKey;
  controlValue: AccountCenterControlValue;
  field?: CustomProfileField;
};
