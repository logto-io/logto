import {
  builtInCustomProfileFieldKeys,
  CustomProfileFieldType,
  type AccountCenterFieldControl,
  type CustomProfileField,
} from '@logto/schemas';

export type ProfileFieldControlKey = Extract<
  keyof AccountCenterFieldControl,
  'name' | 'avatar' | 'profile' | 'customData'
>;

const builtInCustomProfileFieldKeySet = new Set<string>(builtInCustomProfileFieldKeys);

export const isBuiltInProfileField = (fieldName: string, field?: CustomProfileField): boolean =>
  (builtInCustomProfileFieldKeySet.has(fieldName) &&
    fieldName !== 'name' &&
    fieldName !== 'avatar') ||
  (fieldName === 'fullname' && field === undefined);

export const isCompositeProfileField = (field?: CustomProfileField): boolean =>
  field?.type === CustomProfileFieldType.Fullname || field?.type === CustomProfileFieldType.Address;

export const getProfileFieldControlKey = (
  fieldName: string,
  field?: CustomProfileField
): ProfileFieldControlKey => {
  if (fieldName === 'name' || fieldName === 'avatar') {
    return fieldName;
  }

  if (isBuiltInProfileField(fieldName, field) || isCompositeProfileField(field)) {
    return 'profile';
  }

  return 'customData';
};
