import { isValidUrl } from '@logto/core-kit';
import {
  CustomProfileFieldType,
  SupportedDateFormat,
  type FieldPart,
  type CustomProfileFieldBaseConfig,
} from '@logto/schemas';
import { format, parse, isValid } from 'date-fns';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import * as s from 'superstruct';

import { dateFieldConfigGuard } from '@/types/guard';

import useFieldLabel from './use-field-label';

const isValidDateField = (value: unknown, config: CustomProfileFieldBaseConfig): boolean => {
  s.assert(value, s.string());
  s.assert(config, dateFieldConfigGuard);
  const dateFormat =
    config.format === SupportedDateFormat.Custom ? config.customFormat : config.format;
  s.assert(dateFormat, s.string());
  const parsedDate = parse(value, dateFormat, new Date(), {
    useAdditionalDayOfYearTokens: true,
    useAdditionalWeekYearTokens: true,
  });

  return isValid(parsedDate) && format(parsedDate, dateFormat) === value;
};

const isValidRegexField = (value: unknown, config: CustomProfileFieldBaseConfig): boolean => {
  s.assert(value, s.string());
  s.assert(config.format, s.string());
  const regex = new RegExp(config.format);
  return regex.test(value);
};

const isValidUrlField = (value: unknown): boolean => {
  s.assert(value, s.string());

  return isValidUrl(value);
};

const isValidNumberRange = (value: unknown, config: CustomProfileFieldBaseConfig): boolean => {
  s.assert(value, s.string());
  const parsedNumber = Number(value);
  return (
    !Number.isNaN(parsedNumber) &&
    (config.minValue === undefined || parsedNumber >= config.minValue) &&
    (config.maxValue === undefined || parsedNumber <= config.maxValue)
  );
};

const isValidTextLengthRange = (value: unknown, config: CustomProfileFieldBaseConfig): boolean => {
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
    (value: unknown, field: Omit<FieldPart, 'enabled'>) => {
      const { type, name, label, required, config = {} } = field;
      const labelWithI18nFallback = getFieldLabel(name, label);
      const generalInvalidMessage = t('error.general_invalid', { types: [labelWithI18nFallback] });
      const generalRequireMessage = t('error.general_required', { types: [labelWithI18nFallback] });

      if (!value) {
        return !required || generalRequireMessage;
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
