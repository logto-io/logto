import {
  type UpdateCustomProfileFieldData,
  type CustomProfileFieldUnion,
  type UpdateCustomProfileFieldSieOrder,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';

import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import { validateCustomProfileFieldData } from './utils.js';

export const createCustomProfileFieldsLibrary = (queries: Queries) => {
  const {
    insertCustomProfileFields,
    findCustomProfileFieldsByNames,
    updateCustomProfileFieldsByName,
    updateFieldOrderInSignInExperience,
    bulkInsertCustomProfileFields,
  } = queries.customProfileFields;

  const createCustomProfileField = async (data: CustomProfileFieldUnion) => {
    validateCustomProfileFieldData(data);

    return insertCustomProfileFields({ ...data, id: generateStandardId() });
  };

  const createCustomProfileFieldsBatch = async (data: CustomProfileFieldUnion[]) => {
    for (const item of data) {
      validateCustomProfileFieldData(item);
    }
    const rows = data.map((item) => ({ ...item, id: generateStandardId() }));
    return bulkInsertCustomProfileFields(rows);
  };

  const updateCustomProfileField = async (name: string, data: UpdateCustomProfileFieldData) => {
    // Use strict validation on update
    validateCustomProfileFieldData({ ...data, name }, true);

    return updateCustomProfileFieldsByName({
      where: { name },
      set: data,
      jsonbMode: 'replace',
    });
  };

  const updateCustomProfileFieldsSieOrder = async (data: UpdateCustomProfileFieldSieOrder[]) => {
    const names = data.map(({ name }) => name);
    const profileFields = await findCustomProfileFieldsByNames(names);
    const notExistsNames = names.filter(
      (name) => !profileFields.some((field) => field.name === name)
    );

    assertThat(
      profileFields.length === names.length,
      new RequestError({
        code: 'custom_profile_fields.entity_not_exists_with_names',
        names: notExistsNames.join(', '),
      })
    );

    return updateFieldOrderInSignInExperience(data);
  };

  return {
    createCustomProfileField,
    createCustomProfileFieldsBatch,
    updateCustomProfileField,
    updateCustomProfileFieldsSieOrder,
  };
};
