import {
  type AccountCenter,
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

type ProfileFieldsList = ReadonlyArray<{ name: string }>;
type NormalizableProfileFields =
  | SignInExperience['signUpProfileFields']
  | AccountCenter['profileFields']
  | undefined;

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

  const validateProfileFieldsList = async (fields: ProfileFieldsList) => {
    if (fields.length === 0) {
      return;
    }

    const names = fields.map(({ name }) => name);
    const uniqueNames = [...new Set(names)];
    const profileFields = await findCustomProfileFieldsByNames(uniqueNames);
    const existingNames = new Set(profileFields.map(({ name }) => name));
    const missing = uniqueNames.filter((name) => !existingNames.has(name));
    assertThat(
      missing.length === 0,
      new RequestError({
        code: 'custom_profile_fields.entity_not_exists_with_names',
        names: missing.join(', '),
      })
    );

    const duplicateNames = uniqueNames.filter(
      (name) => names.indexOf(name) !== names.lastIndexOf(name)
    );
    assertThat(
      duplicateNames.length === 0,
      new RequestError(
        {
          code: 'request.invalid_input',
          details: `Duplicate profile field names: ${duplicateNames.join(', ')}`,
        },
        { duplicateNames }
      )
    );
  };

  const updateCustomProfileFieldsSieOrder = async (data: UpdateCustomProfileFieldSieOrder[]) => {
    await validateProfileFieldsList(data);

    return updateFieldOrderInSignInExperience(data);
  };

  /**
   * Returns `undefined` when the dev feature is off (the field is silently dropped) so callers can
   * conditionally spread the value into the update payload without changing legacy behavior.
   */
  const normalizeProfileFields = async <ProfileFields extends NormalizableProfileFields>(
    profileFields: ProfileFields
  ): Promise<ProfileFields | undefined> => {
    if (!EnvSet.values.isDevFeaturesEnabled) {
      return undefined;
    }
    if (!profileFields) {
      return profileFields;
    }

    await validateProfileFieldsList(profileFields);
    return profileFields;
  };

  return {
    createCustomProfileField,
    createCustomProfileFieldsBatch,
    updateCustomProfileField,
    updateCustomProfileFieldsSieOrder,
    normalizeProfileFields,
  };
};
