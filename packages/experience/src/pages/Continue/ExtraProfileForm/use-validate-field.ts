import { isValidUrl } from '@logto/core-kit';
import {
  type CustomProfileField,
  CustomProfileFieldType,
  type CustomProfileFieldConfig,
} from '@logto/schemas';
import { format, parse, isValid } from 'date-fns';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import * as s from 'superstruct';

import { addressFieldValueGuard, addressFieldConfigGuard } from '@/types/guard';

import useFieldLabel from './use-field-label';

const isValidAddressField = (value: unknown, config: CustomProfileFieldConfig): boolean => {
  s.assert(value, addressFieldValueGuard);
  s.assert(config, addressFieldConfigGuard);

  return !config.parts.filter(({ enabled }) => enabled).some(({ key }) => !value?.[key]);
};

const isValidDateField = (value: unknown, config: CustomProfileFieldConfig): boolean => {
  s.assert(value, s.string());
  s.assert(config.format, s.string());

  const parsedDate = parse(value, config.format, new Date(), {
    useAdditionalDayOfYearTokens: true,
    useAdditionalWeekYearTokens: true,
  });

  return isValid(parsedDate) && format(parsedDate, config.format) === value;
};

const isValidRegexField = (value: unknown, config: CustomProfileFieldConfig): boolean => {
  s.assert(value, s.string());

  const regex = new RegExp(config.format ?? '');
  return regex.test(value);
};

const isValidUrlField = (value: unknown): boolean => {
  s.assert(value, s.string());

  return isValidUrl(value);
};

const isValidNumberRange = (value: unknown, config: CustomProfileFieldConfig): boolean => {
  s.assert(value, s.string());

  const parsedNumber = Number(value);
  return (
    !Number.isNaN(parsedNumber) &&
    (config.minValue === undefined || parsedNumber >= config.minValue) &&
    (config.maxValue === undefined || parsedNumber <= config.maxValue)
  );
};

const isValidTextLengthRange = (value: unknown, config: CustomProfileFieldConfig): boolean => {
  s.assert(value, s.string());

  return (
    (!config.maxLength || value.length <= config.maxLength) &&
    (!config.minLength || value.length >= config.minLength)
  );
};

const useValidateField = () => {
  const { t } = useTranslation();
  const getFieldLabel = useFieldLabel();

  const validate = useCallback(
    (value: unknown, field: CustomProfileField) => {
      const { type, name, label, required, config } = field;
      const generalInvalidMessage = t('error.general_invalid', {
        types: [getFieldLabel(name, label)],
      });

      if (type === CustomProfileFieldType.Address) {
        return !required || isValidAddressField(value, config) || generalInvalidMessage;
      }

      if (type === CustomProfileFieldType.Date) {
        return isValidDateField(value, config) || generalInvalidMessage;
      }

      if (type === CustomProfileFieldType.Regex) {
        return isValidRegexField(value, config) || generalInvalidMessage;
      }

      if (type === CustomProfileFieldType.Url) {
        return isValidUrlField(value) || generalInvalidMessage;
      }

      if (type === CustomProfileFieldType.Number) {
        if (Number.isNaN(Number(value))) {
          return generalInvalidMessage;
        }
        return (
          isValidNumberRange(value, config) ||
          t('error.invalid_min_max_input', {
            minValue: config.minValue,
            maxValue: config.maxValue,
          })
        );
      }

      if (type === CustomProfileFieldType.Text) {
        return (
          isValidTextLengthRange(value, config) ||
          t('error.invalid_min_max_length', {
            minLength: config.minLength,
            maxLength: config.maxLength,
          })
        );
      }

      return true;
    },
    [t, getFieldLabel]
  );

  return validate;
};

export default useValidateField;
