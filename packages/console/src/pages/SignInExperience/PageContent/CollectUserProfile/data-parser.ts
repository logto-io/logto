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
import {
  getProfileFieldTypeByName,
  isBuiltInAddressComponentKey,
  isBuiltInCustomProfileFieldKey,
} from './utils';

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
): Optional<Array<{ value: string; label?: string }>> =>
  options
    ?.split('\n')
    .map((option) => {
      const [value, label] = option.split(':');
      if (!value) {
        return;
      }
      return { value, label };
    })
    .filter((option) => option !== undefined);

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
      config: { minLength: 1, maxLength: 100 },
    }));
  }
  if (type === CustomProfileFieldType.Fullname) {
    return fullnameKeys.map((name) => ({
      name,
      type: CustomProfileFieldType.Text,
      required: true,
      enabled: name !== 'middleName',
      config: { minLength: 1, maxLength: 100 },
    }));
  }
};

/**
 * Built-in fields can leave label empty for they have i18n labels as fallback.
 * Custom fields must have a label and will use name as fallback if not provided.
 */
const getDefaultFieldLabel = (name: string): string | undefined => {
  const isBuiltInFieldName =
    isBuiltInCustomProfileFieldKey(name) || isBuiltInAddressComponentKey(name);

  if (isBuiltInFieldName) {
    return;
  }

  return name;
};

export const getInitialRequestPayloadByFieldName = (name: string) => {
  const type = getProfileFieldTypeByName(name);

  return cleanDeep(
    {
      name,
      type,
      label: getDefaultFieldLabel(name),
      required: true,
      config: {
        format: cond(type === CustomProfileFieldType.Date && SupportedDateFormat.US),
        placeholder: cond(type === CustomProfileFieldType.Date && SupportedDateFormat.US),
        parts: getDefaultParts(type),
        options: getDefaultOptions(name),
        ...cond(type === CustomProfileFieldType.Text && { minLength: 1, maxLength: 100 }),
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
    defaultValue: config.defaultValue ?? '',
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
      defaultValue: part.config?.defaultValue ?? '',
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
    defaultValue,
    parts,
  } = data;

  return cleanDeep(
    {
      name,
      type,
      label: cond(label),
      description,
      required: type === CustomProfileFieldType.Checkbox ? false : required,
      config: {
        options: parseOptionsStringToArray(options),
        placeholder,
        minLength: cond(minLength && Number(minLength)),
        maxLength: cond(maxLength && Number(maxLength)),
        minValue: cond(minValue && Number(minValue)),
        maxValue: cond(maxValue && Number(maxValue)),
        format,
        customFormat,
        defaultValue:
          type === CustomProfileFieldType.Checkbox ? String(defaultValue === 'true') : defaultValue,
        parts: parts?.map((part) => ({
          enabled: part.enabled,
          name: part.name,
          type: part.type,
          label: cond(part.label),
          description: part.description,
          required: part.type === CustomProfileFieldType.Checkbox ? false : part.required,
          config: {
            placeholder: part.placeholder,
            minLength: cond(part.minLength && Number(part.minLength)),
            maxLength: cond(part.maxLength && Number(part.maxLength)),
            minValue: cond(part.minValue && Number(part.minValue)),
            maxValue: cond(part.maxValue && Number(part.maxValue)),
            options: parseOptionsStringToArray(part.options),
            format: part.format,
            customFormat: part.customFormat,
            defaultValue:
              part.type === CustomProfileFieldType.Checkbox
                ? String(part.defaultValue === 'true')
                : part.defaultValue,
          },
        })),
      },
    },
    { emptyStrings: false, emptyObjects: false }
  );
};
