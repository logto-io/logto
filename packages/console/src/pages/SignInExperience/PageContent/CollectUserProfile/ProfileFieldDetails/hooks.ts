import {
  CustomProfileFieldType,
  type CustomProfileField,
  fullnameKeys,
  userProfileAddressKeys,
} from '@logto/schemas';
import { condString, type Optional } from '@silverhand/essentials';
import cleanDeep from 'clean-deep';
import { useCallback } from 'react';
import { type DeepPartial } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { isBuiltInCustomProfileFieldKey, getProfileFieldTypeByName } from '../utils';

import { type ProfileFieldForm } from './types';

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

  const fromResponse = useCallback(
    (
      data: DeepPartial<CustomProfileField> & {
        name: string;
      }
    ): ProfileFieldForm => {
      const { name, type, label, description, required, config } = data;
      const fieldType = type ?? getProfileFieldTypeByName(name);

      return {
        name,
        type: fieldType,
        label: label ?? getDefaultLabel(name) ?? '',
        description: description ?? '',
        required: required ?? true,
        options: parseOptionsArrayToString(config?.options),
        placeholder: config?.placeholder ?? '',
        minLength: config?.minLength === undefined ? '' : config.minLength.toString(),
        maxLength: config?.maxLength === undefined ? '' : config.maxLength.toString(),
        minValue: config?.minValue === undefined ? '' : config.minValue.toString(),
        maxValue: config?.maxValue === undefined ? '' : config.maxValue.toString(),
        format: config?.format ?? '',
        customFormat: config?.customFormat ?? '',
        parts:
          config?.parts?.map((part) => ({
            name: part?.name ?? '',
            type: part?.type ?? CustomProfileFieldType.Text,
            label: part?.label ?? getDefaultLabel(part?.name) ?? '',
            description: part?.description ?? '',
            required: part?.required ?? true,
            placeholder: part?.config?.placeholder ?? '',
            minLength: part?.config?.minLength ? String(part.config.minLength) : '',
            maxLength: part?.config?.maxLength ? String(part.config.maxLength) : '',
            minValue: part?.config?.minValue ? String(part.config.minValue) : '',
            maxValue: part?.config?.maxValue ? String(part.config.maxValue) : '',
            format: part?.config?.format ?? '',
            options: parseOptionsArrayToString(part?.config?.options),
            enabled: part?.enabled ?? true,
          })) ?? getDefaultParts(fieldType),
      };
    },
    [getDefaultLabel, getDefaultParts]
  );

  const toRequestPayload = useCallback((data: ProfileFieldForm): Partial<CustomProfileField> => {
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

    return cleanDeep({
      name,
      type,
      label,
      description: condString(description),
      required,
      config: {
        options: parseOptionsStringToArray(options),
        placeholder,
        minLength: minLength ? Number(minLength) : undefined,
        maxLength: maxLength ? Number(maxLength) : undefined,
        minValue: minValue ? Number(minValue) : undefined,
        maxValue: maxValue ? Number(maxValue) : undefined,
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
            minLength: part.minLength ? Number(part.minLength) : undefined,
            maxLength: part.maxLength ? Number(part.maxLength) : undefined,
            minValue: part.minValue ? Number(part.minValue) : undefined,
            maxValue: part.maxValue ? Number(part.maxValue) : undefined,
            options: parseOptionsStringToArray(part.options),
            format: part.format,
            customFormat: part.customFormat,
          },
        })),
      },
    });
  }, []);

  return {
    getDefaultLabel,
    fromResponse,
    toRequestPayload,
  };
};
