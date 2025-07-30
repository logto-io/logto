import {
  CustomProfileFieldType,
  type CustomProfileField,
  fullnameKeys,
  userProfileAddressKeys,
  supportedDateFormat,
} from '@logto/schemas';
import { cond, type Optional } from '@silverhand/essentials';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { type ProfileFieldForm } from './ProfileFieldDetails/types';
import { isBuiltInCustomProfileFieldKey, getProfileFieldTypeByName } from './utils';

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

export const useDataParser = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const getDefaultLabel = useCallback(
    (fieldName?: string) => {
      if (isBuiltInCustomProfileFieldKey(fieldName)) {
        if (fieldName === 'address') {
          return t('profile.fields.address.formatted');
        }
        return t(`profile.fields.${fieldName}`);
      }
      return fieldName;
    },
    [t]
  );

  const getDefaultParts = useCallback(
    (type: CustomProfileFieldType) => {
      if (type === CustomProfileFieldType.Address) {
        return userProfileAddressKeys.map((name) => ({
          name,
          type: CustomProfileFieldType.Text,
          label: t(`profile.fields.address.${name}`),
          required: true,
          enabled: name === 'formatted',
        }));
      }
      if (type === CustomProfileFieldType.Fullname) {
        return fullnameKeys.map((name) => ({
          name,
          type: CustomProfileFieldType.Text,
          label: t(`profile.fields.${name}`),
          required: true,
          enabled: name !== 'middleName',
        }));
      }
    },
    [t]
  );

  const getInitialRequestPayloadByFieldName = useCallback(
    (name: string) => {
      const type = getProfileFieldTypeByName(name);

      return {
        name,
        type,
        label: getDefaultLabel(name) ?? name,
        required: true,
        config: {
          format: cond(type === CustomProfileFieldType.Date && supportedDateFormat.US),
          parts: getDefaultParts(type),
          options: cond(
            (type === CustomProfileFieldType.Select || type === CustomProfileFieldType.Checkbox) &&
              []
          ),
        },
      };
    },
    [getDefaultParts, getDefaultLabel]
  );

  const parseResponseToFormData = useCallback((data: CustomProfileField): ProfileFieldForm => {
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
        label: part.label,
        description: part.description,
        required: part.required,
        placeholder: part.config?.placeholder ?? '',
        minLength: part.config?.minLength ? String(part.config.minLength) : '',
        maxLength: part.config?.maxLength ? String(part.config.maxLength) : '',
        minValue: part.config?.minValue ? String(part.config.minValue) : '',
        maxValue: part.config?.maxValue ? String(part.config.maxValue) : '',
        format: part.config?.format ?? '',
        options: parseOptionsArrayToString(part.config?.options),
        enabled: part.enabled,
      })),
    };
  }, []);

  const parseFormDataToRequestPayload = useCallback(
    (data: ProfileFieldForm): Partial<CustomProfileField> => {
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

      return {
        name,
        type,
        label,
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
            label: part.label,
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
      };
    },
    []
  );

  return {
    getDefaultLabel,
    getInitialRequestPayloadByFieldName,
    parseResponseToFormData,
    parseFormDataToRequestPayload,
  };
};
