import { isValidUrl } from '@logto/core-kit';
import {
  CustomProfileFieldType,
  Gender,
  SupportedDateFormat,
  fullnameKeys,
  userProfileAddressKeys,
  type CustomProfileField,
  type CustomProfileFieldBaseConfig,
  type FieldPart,
  type UserProfile,
  type UserProfileResponse,
} from '@logto/schemas';
import { format, isValid, parse } from 'date-fns';

import type { ProfileFieldRow } from '../types';

type Translate = (key: string, options?: Record<string, unknown>) => string;

export type EditableValue = string | boolean;

export type EditableField = {
  name: string;
  label: string;
  value: EditableValue;
  type: CustomProfileFieldType;
  required: boolean;
  description?: string;
  config?: CustomProfileFieldBaseConfig;
};

const profilePartLabelKeys: Record<string, string> = {
  familyName: 'profile.familyName',
  givenName: 'profile.givenName',
  middleName: 'profile.middleName',
  formatted: 'profile.address.formatted',
  streetAddress: 'profile.address.streetAddress',
  locality: 'profile.address.locality',
  region: 'profile.address.region',
  postalCode: 'profile.address.postalCode',
  country: 'profile.address.country',
};

const getStringValue = (value: unknown): string => {
  if (value === undefined || value === null) {
    return '';
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return '';
};

const getCustomFieldValue = (
  userInfo: Partial<UserProfileResponse> | undefined,
  field: CustomProfileField | undefined,
  fieldName: string
): EditableValue => {
  const value = userInfo?.customData?.[fieldName];

  if (field?.type === CustomProfileFieldType.Checkbox) {
    return typeof value === 'boolean' ? value : field.config.defaultValue === 'true';
  }

  return getStringValue(value);
};

const getEnabledParts = (field: CustomProfileField, fallback: readonly string[]): FieldPart[] =>
  field.config.parts?.filter(({ enabled }) => enabled) ??
  fallback.map((name) => ({
    enabled: true,
    name,
    type: CustomProfileFieldType.Text,
    required: field.required,
  }));

const getFallbackCustomProfileField = (
  field: ProfileFieldRow,
  type: CustomProfileFieldType
): CustomProfileField => ({
  ...field,
  tenantId: '',
  id: '',
  type,
  description: null,
  required: false,
  config: {},
  createdAt: 0,
  sieOrder: 0,
});

const profileValueGetters: Record<string, (profile: UserProfile | undefined) => unknown> = {
  familyName: (profile) => profile?.familyName,
  givenName: (profile) => profile?.givenName,
  middleName: (profile) => profile?.middleName,
  nickname: (profile) => profile?.nickname,
  preferredUsername: (profile) => profile?.preferredUsername,
  profile: (profile) => profile?.profile,
  website: (profile) => profile?.website,
  gender: (profile) => profile?.gender,
  birthdate: (profile) => profile?.birthdate,
  zoneinfo: (profile) => profile?.zoneinfo,
  locale: (profile) => profile?.locale,
};

const addressValueGetters: Record<
  string,
  (address: UserProfile['address'] | undefined) => unknown
> = {
  formatted: (address) => address?.formatted,
  streetAddress: (address) => address?.streetAddress,
  locality: (address) => address?.locality,
  region: (address) => address?.region,
  postalCode: (address) => address?.postalCode,
  country: (address) => address?.country,
};

export const getDateFormat = (config?: CustomProfileFieldBaseConfig): string | undefined =>
  config?.format === SupportedDateFormat.Custom ? config.customFormat : config?.format;

const getBuiltInFieldType = (name: string): CustomProfileFieldType => {
  if (name === 'birthdate') {
    return CustomProfileFieldType.Date;
  }

  if (name === 'gender') {
    return CustomProfileFieldType.Select;
  }

  if (name === 'profile' || name === 'website') {
    return CustomProfileFieldType.Url;
  }

  return CustomProfileFieldType.Text;
};

const getBuiltInFieldConfig = (
  name: string,
  translate: Translate
): CustomProfileFieldBaseConfig | undefined => {
  if (name === 'birthdate') {
    return {
      format: SupportedDateFormat.ISO,
      placeholder: SupportedDateFormat.ISO,
    };
  }

  if (name === 'gender') {
    return {
      options: Object.values(Gender).map((value) => ({
        value,
        label: translate(`profile.gender_options.${value}`),
      })),
    };
  }
};

const isValidDate = (value: string, config?: CustomProfileFieldBaseConfig): boolean => {
  const dateFormat = getDateFormat(config);

  if (!dateFormat) {
    return true;
  }

  const parsedDate = parse(value, dateFormat, new Date(), {
    useAdditionalDayOfYearTokens: true,
    useAdditionalWeekYearTokens: true,
  });

  return isValid(parsedDate) && format(parsedDate, dateFormat) === value;
};

export const buildEditableFields = (
  field: ProfileFieldRow | undefined,
  userInfo: Partial<UserProfileResponse> | undefined,
  translate: Translate
): EditableField[] => {
  if (!field) {
    return [];
  }

  if (field.controlKey === 'name') {
    return [
      {
        name: 'name',
        label: field.label,
        value: getStringValue(userInfo?.name),
        type: CustomProfileFieldType.Text,
        required: false,
      },
    ];
  }

  if (field.controlKey === 'customData') {
    return [
      {
        name: field.name,
        label: field.label,
        value: getCustomFieldValue(userInfo, field.field, field.name),
        type: field.field?.type ?? CustomProfileFieldType.Text,
        required: field.field?.required ?? false,
        description: field.field?.description ?? undefined,
        config: field.field?.config,
      },
    ];
  }

  if (field.field?.type === CustomProfileFieldType.Fullname || field.name === 'fullname') {
    const parts = getEnabledParts(
      field.field ?? getFallbackCustomProfileField(field, CustomProfileFieldType.Fullname),
      fullnameKeys
    );

    return parts.map((part) => ({
      name: part.name,
      label: part.label ?? translate(profilePartLabelKeys[part.name] ?? `profile.${part.name}`),
      value: getStringValue(profileValueGetters[part.name]?.(userInfo?.profile)),
      type: part.type,
      required: part.required,
      description: part.description,
      config: part.config,
    }));
  }

  if (field.field?.type === CustomProfileFieldType.Address || field.name === 'address') {
    const parts = getEnabledParts(
      field.field ?? getFallbackCustomProfileField(field, CustomProfileFieldType.Address),
      userProfileAddressKeys
    );

    return parts.map((part) => ({
      name: part.name,
      label:
        part.label ?? translate(profilePartLabelKeys[part.name] ?? `profile.address.${part.name}`),
      value: getStringValue(addressValueGetters[part.name]?.(userInfo?.profile?.address)),
      type: part.type,
      required: part.required,
      description: part.description,
      config: part.config,
    }));
  }

  return [
    {
      name: field.name,
      label: field.label,
      value: getStringValue(profileValueGetters[field.name]?.(userInfo?.profile)),
      type: field.field?.type ?? getBuiltInFieldType(field.name),
      required: field.field?.required ?? false,
      description: field.field?.description ?? undefined,
      config: field.field?.config ?? getBuiltInFieldConfig(field.name, translate),
    },
  ];
};

const getNumberValidationError = (
  value: string,
  config: CustomProfileFieldBaseConfig,
  invalidMessage: string,
  translate: Translate
): string | undefined => {
  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) {
    return invalidMessage;
  }

  if (
    (config.minValue !== undefined && numberValue < config.minValue) ||
    (config.maxValue !== undefined && numberValue > config.maxValue)
  ) {
    return translate('error.invalid_min_max_input', {
      minValue: config.minValue,
      maxValue: config.maxValue,
    });
  }
};

const getTextValidationError = (
  value: string,
  config: CustomProfileFieldBaseConfig,
  translate: Translate
): string | undefined => {
  if (
    (config.minLength !== undefined && value.length < config.minLength) ||
    (config.maxLength !== undefined && value.length > config.maxLength)
  ) {
    return translate('error.invalid_min_max_length', {
      minLength: config.minLength,
      maxLength: config.maxLength,
    });
  }
};

export const getValidationError = (
  value: EditableValue,
  field: EditableField,
  translate: Translate
): string | undefined => {
  if (field.required && (value === '' || value === false)) {
    return translate('error.general_required', { types: [field.label] });
  }

  if (value === '' || typeof value === 'boolean') {
    return;
  }

  const { config = {}, type } = field;
  const invalidMessage = translate('error.general_invalid', { types: [field.label] });

  if (type === CustomProfileFieldType.Date) {
    return isValidDate(value, config) ? undefined : invalidMessage;
  }

  if (type === CustomProfileFieldType.Regex && config.format) {
    return new RegExp(config.format).test(value) ? undefined : invalidMessage;
  }

  if (type === CustomProfileFieldType.Url) {
    return isValidUrl(value) ? undefined : invalidMessage;
  }

  if (type === CustomProfileFieldType.Number) {
    return getNumberValidationError(value, config, invalidMessage, translate);
  }

  if (type === CustomProfileFieldType.Text) {
    return getTextValidationError(value, config, translate);
  }
};

export const getCustomDataValue = ({ type }: EditableField, value: EditableValue) => {
  if (type === CustomProfileFieldType.Checkbox) {
    return Boolean(value);
  }

  if (type === CustomProfileFieldType.Number && value !== '') {
    return Number(value);
  }

  return String(value);
};

export const getProfileValue = (value: EditableValue): string =>
  typeof value === 'boolean' ? '' : value;
