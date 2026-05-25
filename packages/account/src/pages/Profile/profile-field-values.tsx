import {
  builtInCustomProfileFieldKeys,
  CustomProfileFieldType,
  fullnameKeys,
  userProfileAddressKeys,
  type AccountCenter,
  type AccountCenterProfileFields,
  type CustomProfileField,
  type UserProfile,
  type UserProfileResponse,
} from '@logto/schemas';
import type { ReactNode } from 'react';

import { getSelectOptionLabel } from './select-options';
import type { ProfileFieldControlKey } from './types';

const builtInCustomProfileFieldKeySet = new Set<string>(builtInCustomProfileFieldKeys);
const fullnameKeySet = new Set<string>(fullnameKeys);
const addressKeySet = new Set<string>(userProfileAddressKeys);

export const getAccountCenterProfileFields = (
  settings?: AccountCenter
): AccountCenterProfileFields => settings?.profileFields ?? [];

const isCompositeProfileField = (field?: CustomProfileField): boolean =>
  field?.type === CustomProfileFieldType.Fullname || field?.type === CustomProfileFieldType.Address;

const isBuiltInProfileField = (fieldName: string, field?: CustomProfileField): boolean =>
  (builtInCustomProfileFieldKeySet.has(fieldName) &&
    fieldName !== 'name' &&
    fieldName !== 'avatar') ||
  (fieldName === 'fullname' && field === undefined);

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

const joinValues = (values: Array<string | undefined>, separator = ' '): string | undefined => {
  const value = values.filter(Boolean).join(separator);

  return value || undefined;
};

const getPrimitiveValue = (value: unknown): string | undefined => {
  if (value === undefined || value === null || value === '') {
    return;
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
};

const getCheckboxDisplayValue = (
  value: unknown,
  translate: (key: string, options?: Record<string, unknown>) => string
): string | undefined => {
  if (value === undefined || value === null || value === '') {
    return;
  }

  if (value === true || value === 'true') {
    return translate('profile.checkbox_value.checked', { defaultValue: 'Yes' });
  }

  if (value === false || value === 'false') {
    return translate('profile.checkbox_value.unchecked', { defaultValue: 'No' });
  }
};

const getFullnameValue = (profile?: UserProfile): string | undefined =>
  joinValues(fullnameKeys.map((name) => profile?.[name]));

const getAddressValue = (address?: UserProfile['address']): string | undefined =>
  joinValues(
    userProfileAddressKeys.map((name) => address?.[name]),
    ', '
  );

const isFullnameKey = (name: string): name is (typeof fullnameKeys)[number] =>
  fullnameKeySet.has(name);

const isAddressKey = (name: string): name is (typeof userProfileAddressKeys)[number] =>
  addressKeySet.has(name);

const getBuiltInProfileFieldValue = (
  profile: UserProfile | undefined,
  fieldName: string
): string | undefined => {
  switch (fieldName) {
    case 'fullname': {
      return getFullnameValue(profile);
    }
    case 'familyName': {
      return getPrimitiveValue(profile?.familyName);
    }
    case 'givenName': {
      return getPrimitiveValue(profile?.givenName);
    }
    case 'middleName': {
      return getPrimitiveValue(profile?.middleName);
    }
    case 'nickname': {
      return getPrimitiveValue(profile?.nickname);
    }
    case 'preferredUsername': {
      return getPrimitiveValue(profile?.preferredUsername);
    }
    case 'profile': {
      return getPrimitiveValue(profile?.profile);
    }
    case 'website': {
      return getPrimitiveValue(profile?.website);
    }
    case 'gender': {
      return getPrimitiveValue(profile?.gender);
    }
    case 'birthdate': {
      return getPrimitiveValue(profile?.birthdate);
    }
    case 'zoneinfo': {
      return getPrimitiveValue(profile?.zoneinfo);
    }
    case 'locale': {
      return getPrimitiveValue(profile?.locale);
    }
    case 'address': {
      return getAddressValue(profile?.address);
    }
    default: {
      return undefined;
    }
  }
};

const getCompositeFieldValue = (
  userInfo: Partial<UserProfileResponse> | undefined,
  field: CustomProfileField
): string | undefined => {
  const { profile } = userInfo ?? {};

  if (field.type === CustomProfileFieldType.Fullname) {
    const partNames =
      field.config.parts === undefined
        ? fullnameKeys
        : field.config.parts.filter(({ enabled }) => enabled).map(({ name }) => name);

    return joinValues(
      partNames
        .filter((name): name is (typeof fullnameKeys)[number] => isFullnameKey(name))
        .map((name) => profile?.[name])
    );
  }

  if (field.type === CustomProfileFieldType.Address) {
    const address = profile?.address;
    const partNames =
      field.config.parts === undefined
        ? userProfileAddressKeys
        : field.config.parts.filter(({ enabled }) => enabled).map(({ name }) => name);

    return joinValues(
      partNames
        .filter((name): name is (typeof userProfileAddressKeys)[number] => isAddressKey(name))
        .map((name) => address?.[name]),
      ', '
    );
  }
};

export const getProfileFieldValue = (
  userInfo: Partial<UserProfileResponse> | undefined,
  { name: fieldName, label: fieldLabel }: { readonly name: string; readonly label: string },
  translate: (key: string) => string,
  field?: CustomProfileField,
  avatarClassName?: string
): ReactNode | undefined => {
  if (fieldName === 'avatar') {
    return userInfo?.avatar ? (
      <img
        className={avatarClassName}
        src={userInfo.avatar}
        alt={getPrimitiveValue(userInfo.name) ?? fieldLabel}
      />
    ) : undefined;
  }

  if (fieldName === 'name') {
    return getPrimitiveValue(userInfo?.name);
  }

  if (
    field?.type === CustomProfileFieldType.Fullname ||
    field?.type === CustomProfileFieldType.Address
  ) {
    return getCompositeFieldValue(userInfo, field);
  }

  if (field?.type === CustomProfileFieldType.Select) {
    const value = isBuiltInProfileField(fieldName, field)
      ? getBuiltInProfileFieldValue(userInfo?.profile, fieldName)
      : getPrimitiveValue(userInfo?.customData?.[fieldName]);

    const option = field.config.options?.find((option) => option.value === value);

    return value === undefined ? undefined : getSelectOptionLabel(value, option?.label, translate);
  }

  if (field?.type === CustomProfileFieldType.Checkbox) {
    const value = isBuiltInProfileField(fieldName, field)
      ? getBuiltInProfileFieldValue(userInfo?.profile, fieldName)
      : userInfo?.customData?.[fieldName];

    return getCheckboxDisplayValue(value, translate);
  }

  if (isBuiltInProfileField(fieldName, field)) {
    const value = getBuiltInProfileFieldValue(userInfo?.profile, fieldName);

    return fieldName === 'gender' && value
      ? getSelectOptionLabel(value, undefined, translate)
      : value;
  }

  return getPrimitiveValue(userInfo?.customData?.[fieldName]);
};
