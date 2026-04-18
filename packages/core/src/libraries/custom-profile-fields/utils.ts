import { isValidRegEx, numberAndAlphabetRegEx } from '@logto/core-kit';
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
  type CustomProfileField,
  type SignInExperience,
} from '@logto/schemas';
import { ZodError } from 'zod';

import {
  reservedBuiltInProfileKeySet,
  reservedCustomDataKeySet,
  reservedSignInIdentifierKeySet,
} from '#src/constants/index.js';
import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';

type ValidateCustomProfileField = (
  data: { name: string; type: CustomProfileFieldType } & Record<string, unknown>,
  isStrict?: boolean
) => void;

const validateTextProfileField: ValidateCustomProfileField = (data) => {
  const { config } = textProfileFieldGuard.parse(data);
  const { minLength, maxLength } = config ?? {};

  assertThat(
    minLength === undefined || maxLength === undefined || minLength <= maxLength,
    'custom_profile_fields.invalid_min_max_input'
  );
};

const validateNumberProfileField: ValidateCustomProfileField = (data) => {
  const { config } = numberProfileFieldGuard.parse(data);
  const { minValue, maxValue } = config ?? {};

  assertThat(
    minValue === undefined || maxValue === undefined || minValue <= maxValue,
    'custom_profile_fields.invalid_min_max_input'
  );
};

const validateCheckboxProfileField: ValidateCustomProfileField = (data, isStrict) => {
  const { config } = checkboxProfileFieldGuard.parse(data);
  if (isStrict) {
    assertThat(config?.defaultValue !== undefined, 'custom_profile_fields.invalid_default_value');
  }
};

const validateSelectProfileField: ValidateCustomProfileField = (data, isStrict) => {
  const { config } = selectProfileFieldGuard.parse(data);
  if (isStrict) {
    assertThat(config.options.length > 0, 'custom_profile_fields.invalid_options');
  }
};

const validateRegexProfileField: ValidateCustomProfileField = (data, isStrict) => {
  const { config } = regexProfileFieldGuard.parse(data);
  if (isStrict) {
    assertThat(isValidRegEx(config.format), 'custom_profile_fields.invalid_regex_format');
  }
};

const validateAddressProfileField: ValidateCustomProfileField = (data, isStrict) => {
  const { config } = addressProfileFieldGuard.parse(data);
  assertThat(config.parts.length > 0, 'custom_profile_fields.invalid_address_components');
  assertThat(
    !config.parts.some(({ type }) =>
      [CustomProfileFieldType.Address, CustomProfileFieldType.Fullname].includes(type)
    ),
    'custom_profile_fields.invalid_sub_component_type'
  );

  if (isStrict) {
    for (const part of config.parts) {
      validateCustomProfileFieldData(part, true);
    }
  }
};

const validateFullnameProfileField: ValidateCustomProfileField = (data, isStrict) => {
  const { config } = fullnameProfileFieldGuard.parse(data);
  assertThat(config.parts.length > 0, 'custom_profile_fields.invalid_fullname_components');
  assertThat(
    !config.parts.some(({ type }) =>
      [CustomProfileFieldType.Address, CustomProfileFieldType.Fullname].includes(type)
    ),
    'custom_profile_fields.invalid_sub_component_type'
  );

  if (isStrict) {
    for (const part of config.parts) {
      validateCustomProfileFieldData(part, true);
    }
  }
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
  assertThat(numberAndAlphabetRegEx.test(name), 'custom_profile_fields.invalid_name');
  assertThat(
    !reservedBuiltInProfileKeySet.has(name),
    new RequestError({ code: 'custom_profile_fields.name_conflict_built_in_prop', name })
  );
  assertThat(
    !reservedCustomDataKeySet.has(name),
    new RequestError({ code: 'custom_profile_fields.name_conflict_custom_data', name })
  );
  assertThat(
    !reservedSignInIdentifierKeySet.has(name),
    new RequestError({ code: 'custom_profile_fields.name_conflict_sign_in_identifier', name })
  );
};

/**
 * Resolve the ordered list of custom profile fields that should be collected during sign-up.
 *
 * - When the dev feature is OFF, or `signUpProfileFields` is `null`/`undefined` (legacy tenants),
 *   fall back to returning the full catalog as-is (the caller already orders by `sie_order`).
 * - When the dev feature is ON and `signUpProfileFields` is an explicit array, filter the catalog
 *   down to entries in that list and preserve the list order. Unknown names are dropped silently,
 *   since they may have been deleted since the config was saved.
 */
export const resolveSignUpCustomProfileFields = (
  catalog: Readonly<CustomProfileField[]>,
  signUpProfileFields: SignInExperience['signUpProfileFields']
): Readonly<CustomProfileField[]> => {
  if (!EnvSet.values.isDevFeaturesEnabled || !signUpProfileFields) {
    return catalog;
  }

  const byName = new Map(catalog.map((field) => [field.name, field]));
  return signUpProfileFields
    .map(({ name }) => byName.get(name))
    .filter((field): field is CustomProfileField => field !== undefined);
};

export const validateCustomProfileFieldData: ValidateCustomProfileField = (
  data,
  isStrict = false
) => {
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
      validateCheckboxProfileField(data, isStrict);
      break;
    }
    case CustomProfileFieldType.Select: {
      validateSelectProfileField(data, isStrict);
      break;
    }
    case CustomProfileFieldType.Regex: {
      validateRegexProfileField(data, isStrict);
      break;
    }
    case CustomProfileFieldType.Address: {
      validateAddressProfileField(data, isStrict);
      break;
    }
    case CustomProfileFieldType.Fullname: {
      validateFullnameProfileField(data, isStrict);
      break;
    }
    case CustomProfileFieldType.Url: {
      validateUrlProfileField(data);
      break;
    }
    case CustomProfileFieldType.Date: {
      validateDateProfileField(data);
      break;
    }
  }
};
