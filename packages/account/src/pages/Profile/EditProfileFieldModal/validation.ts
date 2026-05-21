import { isValidUrl } from '@logto/core-kit';
import { CustomProfileFieldType, type CustomProfileFieldBaseConfig } from '@logto/schemas';
import { format, isValid, parse } from 'date-fns';

import { getDateFormat, type EditableField, type EditableValue } from './utils';

type Translate = (key: string, options?: Record<string, unknown>) => string;

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

const getRegexValidationError = (
  value: string,
  config: CustomProfileFieldBaseConfig,
  invalidMessage: string
): string | undefined => {
  if (!config.format) {
    return;
  }

  try {
    return new RegExp(config.format).test(value) ? undefined : invalidMessage;
  } catch {
    return invalidMessage;
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

  if (type === CustomProfileFieldType.Regex) {
    return getRegexValidationError(value, config, invalidMessage);
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
