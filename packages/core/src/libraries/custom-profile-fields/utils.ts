import { isValidRegEx } from '@logto/core-kit';
import {
  textProfileFieldGuard,
  numberProfileFieldGuard,
  checkboxProfileFieldGuard,
  regexProfileFieldGuard,
  selectProfileFieldGuard,
  dateProfileFieldGuard,
  fullnameProfileFieldGuard,
  urlProfileFieldGuard,
  addressProfileFieldGuard,
  CustomProfileFieldType,
  userOnboardingDataKey,
  guideRequestsKey,
  consoleUserPreferenceKey,
  defaultTenantIdKey,
} from '@logto/schemas';
import { ZodError } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';

const reservedCustomDataKeys = Object.freeze([
  userOnboardingDataKey,
  guideRequestsKey,
  consoleUserPreferenceKey,
  defaultTenantIdKey,
]);

const reservedSignInIdentifierKeys = Object.freeze([
  'username',
  'primaryEmail',
  'primaryPhone',
  'email',
  'phone',
]);

type ValidateCustomProfileField = (
  data: { name: string; type: CustomProfileFieldType } & Record<string, unknown>
) => void;

const validateTextProfileField: ValidateCustomProfileField = (data) => {
  const { config } = textProfileFieldGuard.parse(data);
  const { minLength, maxLength } = config ?? {};

  assertThat(
    minLength && maxLength && minLength <= maxLength,
    'custom_profile_fields.invalid_min_max_input'
  );
};

const validateNumberProfileField: ValidateCustomProfileField = (data) => {
  const { config } = numberProfileFieldGuard.parse(data);
  const { minValue, maxValue } = config ?? {};

  assertThat(
    minValue && maxValue && minValue <= maxValue,
    'custom_profile_fields.invalid_min_max_input'
  );
};

const validateCheckboxProfileField: ValidateCustomProfileField = (data) => {
  const { config } = checkboxProfileFieldGuard.parse(data);
  assertThat(config.options.length > 0, 'custom_profile_fields.invalid_options');
};

const validateSelectProfileField: ValidateCustomProfileField = (data) => {
  const { config } = selectProfileFieldGuard.parse(data);
  assertThat(config.options.length > 0, 'custom_profile_fields.invalid_options');
};

const validateRegexProfileField: ValidateCustomProfileField = (data) => {
  const { config } = regexProfileFieldGuard.parse(data);
  assertThat(isValidRegEx(config.format), 'custom_profile_fields.invalid_regex_format');
};

const validateAddressProfileField: ValidateCustomProfileField = (data) => {
  const { config } = addressProfileFieldGuard.parse(data);
  assertThat(config.parts.length > 0, 'custom_profile_fields.invalid_address_parts');
};

const validateFullnameProfileField: ValidateCustomProfileField = (data) => {
  const { config } = fullnameProfileFieldGuard.parse(data);
  assertThat(config.parts.length > 0, 'custom_profile_fields.invalid_fullname_parts');
};

const validateUrlProfileField: ValidateCustomProfileField = (data) => {
  try {
    urlProfileFieldGuard.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new RequestError({ code: 'request.invalid_input', details: error.message }, error);
    }
    throw error;
  }
};

const validateDateProfileField: ValidateCustomProfileField = (data) => {
  try {
    dateProfileFieldGuard.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new RequestError({ code: 'request.invalid_input', details: error.message }, error);
    }
    throw error;
  }
};

const validateFieldName = (name: string) => {
  assertThat(/^[\dA-Za-z]+$/.test(name), 'custom_profile_fields.invalid_name');
  assertThat(!reservedCustomDataKeys.includes(name), 'custom_profile_fields.name_exists');
  assertThat(
    !reservedSignInIdentifierKeys.includes(name),
    new RequestError({ code: 'custom_profile_fields.name_conflict_sign_in_identifier', name })
  );
};

export const validateCustomProfileFieldData: ValidateCustomProfileField = (data) => {
  const { name, type } = data;

  validateFieldName(name);

  switch (type) {
    case CustomProfileFieldType.Text: {
      validateTextProfileField(data);
      break;
    }
    case CustomProfileFieldType.Number: {
      validateNumberProfileField(data);
      break;
    }
    case CustomProfileFieldType.Checkbox: {
      validateCheckboxProfileField(data);
      break;
    }
    case CustomProfileFieldType.Select: {
      validateSelectProfileField(data);
      break;
    }
    case CustomProfileFieldType.Regex: {
      validateRegexProfileField(data);
      break;
    }
    case CustomProfileFieldType.Address: {
      validateAddressProfileField(data);
      break;
    }
    case CustomProfileFieldType.Fullname: {
      validateFullnameProfileField(data);
      break;
    }
    case CustomProfileFieldType.Url: {
      validateUrlProfileField(data);
      break;
    }
    case CustomProfileFieldType.Date: {
      validateDateProfileField(data);
    }
  }
};
