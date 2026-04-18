import {
  type SignInExperience,
  type UpdateCustomProfileFieldData,
  type CustomProfileFieldUnion,
  type UpdateCustomProfileFieldSieOrder,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';

import { EnvSet } from '#src/env-set/index.js';
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

  /**
   * Validate and normalize the `signUpProfileFields` config from a Sign-in Experience patch body.
   *
   * Returns `undefined` when the dev feature is off (the field is silently dropped) so callers can
   * conditionally spread the value into the update payload without changing legacy behavior.
   */
  const normalizeSignUpProfileFields = async (
    signUpProfileFields: SignInExperience['signUpProfileFields'] | undefined
  ): Promise<SignInExperience['signUpProfileFields'] | undefined> => {
    if (!EnvSet.values.isDevFeaturesEnabled) {
      return undefined;
    }
    if (!signUpProfileFields) {
      return signUpProfileFields;
    }

    const catalog = await queries.customProfileFields.findAllCustomProfileFields();
    const validNames = new Set(catalog.map(({ name }) => name));
    const missing = signUpProfileFields
      .map(({ name }) => name)
      .filter((name) => !validNames.has(name));
    assertThat(
      missing.length === 0,
      new RequestError({
        code: 'custom_profile_fields.entity_not_exists_with_names',
        names: missing.join(', '),
      })
    );
    const uniqueNames = new Set(signUpProfileFields.map(({ name }) => name));
    assertThat(uniqueNames.size === signUpProfileFields.length, 'request.invalid_input', 400);
    return signUpProfileFields;
  };

  return {
    createCustomProfileField,
    createCustomProfileFieldsBatch,
    updateCustomProfileField,
    updateCustomProfileFieldsSieOrder,
    normalizeSignUpProfileFields,
  };
};
