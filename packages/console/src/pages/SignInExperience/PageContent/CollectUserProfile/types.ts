import { type CustomProfileFieldType } from '@logto/schemas';

type ProfileFieldPartSubForm = {
  enabled: boolean;
  name: string;
  type: CustomProfileFieldType;
  label: string;
  description?: string;
  required: boolean;
  options?: string;
  placeholder?: string;
  minLength?: string;
  maxLength?: string;
  minValue?: string;
  maxValue?: string;
  format?: string;
  customFormat?: string;
  defaultValue?: string;
};

export type ProfileFieldForm = Omit<ProfileFieldPartSubForm, 'type' | 'enabled'> & {
  type: CustomProfileFieldType;
  parts?: ProfileFieldPartSubForm[];
};
