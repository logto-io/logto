import {
  CustomProfileFieldType,
  fullnameKeys,
  Gender,
  SupportedDateFormat,
  userProfileAddressKeys,
  type CustomProfileField,
} from '@logto/schemas';
import { cond, type Optional } from '@silverhand/essentials';
import cleanDeep from 'clean-deep';

import { type ProfileFieldForm } from './types';
import { getProfileFieldTypeByName } from './utils';

const parseOptionsArrayToString = (
  options?: Array<{ value?: string; label?: string } | undefined>
): string =>
  options
    ?.map((option) => {
      const { value, label } = option ?? {};
      return value !== undefined && label !== undefined ? `${value}:${label}` : value;
    })
    .filter(Boolean)
    .join('\n') ?? '';

const parseOptionsStringToArray = (
  options?: string
): Optional<Array<{ value: string; label: string }>> =>
  options
    ?.split('\n')
    .map((option) => {
      const [value = '', label = value] = option.split(':');
      return { value, label };
    })
    .filter(Boolean);

const getDefaultOptions = (name: string) => {
  if (name === 'gender') {
    return Object.values(Gender).map((value) => ({ value }));
  }

  const type = getProfileFieldTypeByName(name);

  if (type === CustomProfileFieldType.Select || type === CustomProfileFieldType.Checkbox) {
    return [];
  }
};

const getDefaultParts = (type: CustomProfileFieldType) => {
  if (type === CustomProfileFieldType.Address) {
    return userProfileAddressKeys.map((name) => ({
      name,
      type: CustomProfileFieldType.Text,
      required: true,
      enabled: name === 'formatted',
    }));
  }
  if (type === CustomProfileFieldType.Fullname) {
    return fullnameKeys.map((name) => ({
      name,
      type: CustomProfileFieldType.Text,
      required: true,
      enabled: name !== 'middleName',
    }));
  }
};

export const getInitialRequestPayloadByFieldName = (name: string) => {
  const type = getProfileFieldTypeByName(name);

  return cleanDeep(
    {
      name,
      type,
      required: true,
      config: {
        format: cond(type === CustomProfileFieldType.Date && SupportedDateFormat.US),
        parts: getDefaultParts(type),
        options: getDefaultOptions(name),
      },
    },
    { emptyArrays: false, emptyObjects: false }
  );
};

export const parseResponseToFormData = (data: CustomProfileField): ProfileFieldForm => {
  const { name, type, label, description, required, config } = data;

  return {
    name,
    type,
    label,
    description: description ?? '',
    required,
    options: parseOptionsArrayToString(config.options),
    placeholder: config.placeholder ?? '',
    minLength: config.minLength === undefined ? '' : String(config.minLength),
    maxLength: config.maxLength === undefined ? '' : String(config.maxLength),
    minValue: config.minValue === undefined ? '' : String(config.minValue),
    maxValue: config.maxValue === undefined ? '' : String(config.maxValue),
    format: config.format ?? '',
    customFormat: config.customFormat ?? '',
    parts: config.parts?.map((part) => ({
      name: part.name,
      type: part.type,
      label: part.label ?? '',
      description: part.description ?? '',
      required: part.required,
      placeholder: part.config?.placeholder ?? '',
      minLength: part.config?.minLength ? String(part.config.minLength) : '',
      maxLength: part.config?.maxLength ? String(part.config.maxLength) : '',
      minValue: part.config?.minValue ? String(part.config.minValue) : '',
      maxValue: part.config?.maxValue ? String(part.config.maxValue) : '',
      format: part.config?.format ?? '',
      customFormat: part.config?.customFormat ?? '',
      options: parseOptionsArrayToString(part.config?.options),
      enabled: part.enabled,
    })),
  };
};

export const parseFormDataToRequestPayload = (
  data: ProfileFieldForm
): Partial<CustomProfileField> => {
  const {
    name,
    type,
    label,
    description,
    required,
    options,
    placeholder,
    minLength,
    maxLength,
    minValue,
    maxValue,
    format,
    customFormat,
    parts,
  } = data;

  return cleanDeep(
    {
      name,
      type,
      label: cond(label),
      description,
      required,
      config: {
        options: parseOptionsStringToArray(options),
        placeholder,
        minLength: cond(minLength && Number(minLength)),
        maxLength: cond(maxLength && Number(maxLength)),
        minValue: cond(minValue && Number(minValue)),
        maxValue: cond(maxValue && Number(maxValue)),
        format,
        customFormat,
        parts: parts?.map((part) => ({
          enabled: part.enabled,
          name: part.name,
          type: part.type,
          label: cond(part.label),
          description: part.description,
          required: part.required,
          config: {
            placeholder: part.placeholder,
            minLength: cond(part.minLength && Number(part.minLength)),
            maxLength: cond(part.maxLength && Number(part.maxLength)),
            minValue: cond(part.minValue && Number(part.minValue)),
            maxValue: cond(part.maxValue && Number(part.maxValue)),
            options: parseOptionsStringToArray(part.options),
            format: part.format,
            customFormat: part.customFormat,
          },
        })),
      },
    },
    { emptyStrings: false, emptyObjects: false }
  );
};
