import {
  type AccountCenterControlValue,
  type AccountCenterFieldControl,
  type CustomProfileField,
} from '@logto/schemas';

export type ProfileFieldControlKey = Extract<
  keyof AccountCenterFieldControl,
  'name' | 'avatar' | 'profile' | 'customData'
>;

export type ProfileFieldRow = {
  name: string;
  label: string;
  value?: React.ReactNode;
  controlKey: ProfileFieldControlKey;
  controlValue: AccountCenterControlValue;
  field?: CustomProfileField;
};
