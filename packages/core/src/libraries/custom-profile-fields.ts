import { isValidRegEx } from '@logto/core-kit';
import {
  checkboxProfileFieldGuard,
  CustomProfileFieldType,
  numberProfileFieldGuard,
  regexProfileFieldGuard,
  selectProfileFieldGuard,
  textProfileFieldGuard,
  addressProfileFieldGuard,
  fullnameProfileFieldGuard,
  type CreateCustomProfileFieldData,
  type UpdateCustomProfileFieldSieOrder,
  urlProfileFieldGuard,
  dateProfileFieldGuard,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';

import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

export const createCustomProfileFieldsLibrary = (queries: Queries) => {
  const {
    insertCustomProfileFields,
    findCustomProfileFieldsByIds,
    updateFieldOrderInSignInExperience,
  } = queries.customProfileFields;

  const createCustomProfileField = async (data: CreateCustomProfileFieldData) => {
    validateCustomProfileField(data);
    return insertCustomProfileFields({
      ...data,
      id: generateStandardId(),
    });
  };

  const updateCustomProfileFieldsSieOrder = async (data: UpdateCustomProfileFieldSieOrder[]) => {
    const ids = data.map(({ id }) => id);
    const profileFields = await findCustomProfileFieldsByIds(ids);
    const notExistsIds = ids.filter((id) => !profileFields.some((field) => field.id === id));

    assertThat(
      profileFields.length === ids.length,
      new RequestError({
        code: 'custom_profile_fields.entity_not_exists_with_ids',
        ids: notExistsIds.join(', '),
      })
    );

    return updateFieldOrderInSignInExperience(data);
  };

  return {
    createCustomProfileField,
    updateCustomProfileFieldsSieOrder,
  };
};

// eslint-disable-next-line complexity
const validateCustomProfileField = (data: CreateCustomProfileFieldData) => {
  switch (data.type) {
    case CustomProfileFieldType.Text: {
      const { minLength, maxLength } = textProfileFieldGuard.parse(data);
      assertThat(
        minLength && maxLength && minLength <= maxLength,
        'custom_profile_fields.invalid_min_max_input'
      );
      break;
    }
    case CustomProfileFieldType.Number: {
      const { minValue, maxValue } = numberProfileFieldGuard.parse(data);
      assertThat(
        minValue && maxValue && minValue <= maxValue,
        'custom_profile_fields.invalid_min_max_input'
      );
      break;
    }
    case CustomProfileFieldType.Checkbox: {
      const { options } = checkboxProfileFieldGuard.parse(data);
      assertThat(options.length > 0, 'custom_profile_fields.invalid_options');
      break;
    }
    case CustomProfileFieldType.Select: {
      const { options } = selectProfileFieldGuard.parse(data);
      assertThat(options.length > 0, 'custom_profile_fields.invalid_options');
      break;
    }
    case CustomProfileFieldType.Regex: {
      const { format } = regexProfileFieldGuard.parse(data);
      assertThat(isValidRegEx(format), 'custom_profile_fields.invalid_regex_format');
      break;
    }
    case CustomProfileFieldType.Address: {
      const { parts } = addressProfileFieldGuard.parse(data);
      assertThat(parts.length > 0, 'custom_profile_fields.invalid_address_parts');
      break;
    }
    case CustomProfileFieldType.Fullname: {
      const { parts } = fullnameProfileFieldGuard.parse(data);
      assertThat(parts.length > 0, 'custom_profile_fields.invalid_fullname_parts');
      break;
    }
    case CustomProfileFieldType.Url: {
      urlProfileFieldGuard.parse(data);
      break;
    }
    case CustomProfileFieldType.Date: {
      dateProfileFieldGuard.parse(data);
    }
  }
};
