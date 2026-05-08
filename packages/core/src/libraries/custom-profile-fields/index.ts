import {
  type AccountCenterProfileFields,
  type SignInExperience,
  type UpdateCustomProfileFieldData,
  type CustomProfileFieldUnion,
  type UpdateCustomProfileFieldSieOrder,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { AccountCenterQueries } from '#src/queries/account-center.js';
import { createCustomProfileFieldsQueries } from '#src/queries/custom-profile-fields.js';
import { createSignInExperienceQueries } from '#src/queries/sign-in-experience.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import { validateCustomProfileFieldData } from './utils.js';

type ProfileFieldsList = ReadonlyArray<{ name: string }>;
type NormalizableProfileFields =
  | SignInExperience['signUpProfileFields']
  | AccountCenterProfileFields
  | undefined;
type RemovableProfileFields = SignInExperience['signUpProfileFields'] | AccountCenterProfileFields;

function removeProfileFieldByName(
  profileFields: SignInExperience['signUpProfileFields'],
  name: string
): SignInExperience['signUpProfileFields'];
function removeProfileFieldByName(
  profileFields: AccountCenterProfileFields,
  name: string
): AccountCenterProfileFields;
function removeProfileFieldByName(
  profileFields: RemovableProfileFields,
  name: string
): RemovableProfileFields {
  if (!profileFields) {
    return profileFields;
  }

  return profileFields.filter(({ name: fieldName }) => fieldName !== name);
}

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

  const deleteCustomProfileField = async (name: string) => {
    const [signInExperience, accountCenter] = await Promise.all([
      queries.signInExperiences.findDefaultSignInExperience(),
      queries.accountCenters.findDefaultAccountCenter(),
    ]);
    const signUpProfileFields = removeProfileFieldByName(
      signInExperience.signUpProfileFields,
      name
    );
    const accountCenterProfileFields = removeProfileFieldByName(accountCenter.profileFields, name);

    return queries.pool.transaction(async (connection) => {
      const signInExperienceQueries = createSignInExperienceQueries(
        connection,
        queries.wellKnownCache
      );
      const accountCenterQueries = new AccountCenterQueries(connection, queries.wellKnownCache);
      const customProfileFieldsQueries = createCustomProfileFieldsQueries(connection);

      if (
        signInExperience.signUpProfileFields &&
        signUpProfileFields &&
        signUpProfileFields.length !== signInExperience.signUpProfileFields.length
      ) {
        await signInExperienceQueries.updateDefaultSignInExperience({ signUpProfileFields });
      }

      if (
        accountCenter.profileFields &&
        accountCenterProfileFields &&
        accountCenterProfileFields.length !== accountCenter.profileFields.length
      ) {
        await accountCenterQueries.updateDefaultAccountCenter({
          profileFields: accountCenterProfileFields,
        });
      }

      return customProfileFieldsQueries.deleteCustomProfileFieldsByName(name);
    });
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
    deleteCustomProfileField,
    normalizeProfileFields,
  };
};
