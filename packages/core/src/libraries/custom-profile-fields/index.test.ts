import { type AccountCenter, CustomProfileFields, type SignInExperience } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';

import { EnvSet } from '#src/env-set/index.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

const findCustomProfileFieldsByNames = jest.fn();
const updateFieldOrderInSignInExperience = jest.fn();
const deleteCustomProfileFieldsByName = jest.fn();
const findSignInExperienceById = jest.fn();
const updateSignInExperience = jest.fn();
const findAccountCenterById = jest.fn();
const updateAccountCenter = jest.fn();

const customProfileFieldsQueriesMock = {
  findCustomProfileFieldsByNames,
  updateFieldOrderInSignInExperience,
  deleteCustomProfileFieldsByName,
};

const resolveFindBySchema = (schema: { table: string }) =>
  schema.table === 'sign_in_experiences' ? findSignInExperienceById : findAccountCenterById;

const resolveUpdateBySchema = (schema: { table: string }) =>
  schema.table === 'sign_in_experiences' ? updateSignInExperience : updateAccountCenter;

const findEntitiesByIdsStub = jest.fn();
const buildFindEntitiesByIdsStub = () => findEntitiesByIdsStub;

mockEsm('#src/database/find-entity-by-id.js', () => ({
  buildFindEntityByIdWithPool: () => resolveFindBySchema,
  buildFindEntitiesByIdsWithPool: () => buildFindEntitiesByIdsStub,
}));
mockEsm('#src/database/update-where.js', () => ({
  buildUpdateWhereWithPool: () => resolveUpdateBySchema,
}));
mockEsm('#src/queries/custom-profile-fields.js', () => ({
  createCustomProfileFieldsQueries: () => customProfileFieldsQueriesMock,
}));

const { MockQueries } = await import('#src/test-utils/tenant.js');
const { createCustomProfileFieldsLibrary } = await import('./index.js');

describe('createCustomProfileFieldsLibrary', () => {
  const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;
  const queries = new MockQueries({
    customProfileFields: {
      findCustomProfileFieldsByNames,
      updateFieldOrderInSignInExperience,
    },
  });
  const { deleteCustomProfileField, normalizeProfileFields, updateCustomProfileFieldsSieOrder } =
    createCustomProfileFieldsLibrary(queries);

  const setDevFeaturesEnabled = (enabled: boolean) => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled = enabled;
  };

  beforeEach(() => {
    setDevFeaturesEnabled(true);
    findCustomProfileFieldsByNames.mockReset();
    updateFieldOrderInSignInExperience.mockReset();
    deleteCustomProfileFieldsByName.mockReset();
    findSignInExperienceById.mockReset();
    updateSignInExperience.mockReset();
    findAccountCenterById.mockReset();
    updateAccountCenter.mockReset();
  });

  afterAll(() => {
    setDevFeaturesEnabled(originalIsDevFeaturesEnabled);
  });

  it('should drop signUpProfileFields when dev features are disabled', async () => {
    setDevFeaturesEnabled(false);

    await expect(normalizeProfileFields([{ name: 'company' }])).resolves.toBeUndefined();
    expect(findCustomProfileFieldsByNames).not.toHaveBeenCalled();
  });

  it('should return null signUpProfileFields without reading the catalog', async () => {
    await expect(normalizeProfileFields(null)).resolves.toBeNull();
    expect(findCustomProfileFieldsByNames).not.toHaveBeenCalled();
  });

  it('should return undefined signUpProfileFields without reading the catalog', async () => {
    const signUpProfileFieldsContainer: {
      signUpProfileFields?: SignInExperience['signUpProfileFields'];
    } = {};
    const { signUpProfileFields } = signUpProfileFieldsContainer;

    await expect(normalizeProfileFields(signUpProfileFields)).resolves.toBeUndefined();
    expect(findCustomProfileFieldsByNames).not.toHaveBeenCalled();
  });

  it('should return empty profileFields without reading the catalog', async () => {
    const profileFields: Array<{ name: string }> = [];

    await expect(normalizeProfileFields(profileFields)).resolves.toBe(profileFields);
    expect(findCustomProfileFieldsByNames).not.toHaveBeenCalled();
  });

  it('should return signUpProfileFields when all names exist in the catalog', async () => {
    findCustomProfileFieldsByNames.mockResolvedValue([{ name: 'company' }, { name: 'inviteCode' }]);

    const signUpProfileFields = [{ name: 'inviteCode' }, { name: 'company' }];

    await expect(normalizeProfileFields(signUpProfileFields)).resolves.toBe(signUpProfileFields);
    expect(findCustomProfileFieldsByNames).toHaveBeenCalledWith(['inviteCode', 'company']);
  });

  it('should deduplicate missing names in the validation error', async () => {
    findCustomProfileFieldsByNames.mockResolvedValue([]);

    await expect(
      normalizeProfileFields([{ name: 'unknown' }, { name: 'unknown' }])
    ).rejects.toMatchObject({
      code: 'custom_profile_fields.entity_not_exists_with_names',
      message: 'Cannot find entities with the given names: unknown',
    });
    expect(findCustomProfileFieldsByNames).toHaveBeenCalledWith(['unknown']);
  });

  it('should include duplicate names in the validation error payload', async () => {
    findCustomProfileFieldsByNames.mockResolvedValue([{ name: 'company' }, { name: 'inviteCode' }]);

    await expect(
      normalizeProfileFields([
        { name: 'company' },
        { name: 'inviteCode' },
        { name: 'company' },
        { name: 'inviteCode' },
      ])
    ).rejects.toMatchObject({
      code: 'request.invalid_input',
      data: {
        duplicateNames: ['company', 'inviteCode'],
      },
      message: 'Input is invalid. Duplicate profile field names: company, inviteCode',
    });
  });

  it('should validate names before updating the sign-in experience order', async () => {
    const order = [
      { name: 'company', sieOrder: 1 },
      { name: 'inviteCode', sieOrder: 2 },
    ];
    findCustomProfileFieldsByNames.mockResolvedValue([{ name: 'company' }, { name: 'inviteCode' }]);
    updateFieldOrderInSignInExperience.mockResolvedValue(order);

    await expect(updateCustomProfileFieldsSieOrder(order)).resolves.toBe(order);
    expect(findCustomProfileFieldsByNames).toHaveBeenCalledWith(['company', 'inviteCode']);
    expect(updateFieldOrderInSignInExperience).toHaveBeenCalledWith(order);
  });

  it('should remove deleted profile field references from SIE and account center configs', async () => {
    const signUpProfileFields: SignInExperience['signUpProfileFields'] = [
      { name: 'company' },
      { name: 'inviteCode' },
    ];
    const accountCenterProfileFields: AccountCenter['profileFields'] = [
      { name: 'company' },
      { name: 'favoriteColor' },
    ];
    findSignInExperienceById.mockResolvedValue({ signUpProfileFields });
    findAccountCenterById.mockResolvedValue({ profileFields: accountCenterProfileFields });

    await deleteCustomProfileField('company');

    expect(updateSignInExperience).toHaveBeenCalledWith({
      set: { signUpProfileFields: [{ name: 'inviteCode' }] },
      where: { id: 'default' },
      jsonbMode: 'replace',
    });
    expect(updateAccountCenter).toHaveBeenCalledWith({
      set: { profileFields: [{ name: 'favoriteColor' }] },
      where: { id: 'default' },
      jsonbMode: 'replace',
    });
    expect(deleteCustomProfileFieldsByName).toHaveBeenCalledWith('company');
  });

  it('should skip config updates when deleting an unreferenced profile field', async () => {
    findSignInExperienceById.mockResolvedValue({ signUpProfileFields: null });
    findAccountCenterById.mockResolvedValue({ profileFields: [{ name: 'favoriteColor' }] });

    await deleteCustomProfileField('company');

    expect(updateSignInExperience).not.toHaveBeenCalled();
    expect(updateAccountCenter).not.toHaveBeenCalled();
    expect(deleteCustomProfileFieldsByName).toHaveBeenCalledWith('company');
  });

  it('should throw a deletion error when deleting a nonexistent profile field', async () => {
    findSignInExperienceById.mockResolvedValue({ signUpProfileFields: null });
    findAccountCenterById.mockResolvedValue({ profileFields: [{ name: 'favoriteColor' }] });
    deleteCustomProfileFieldsByName.mockRejectedValue(
      new DeletionError(CustomProfileFields.table, 'company')
    );

    await expect(deleteCustomProfileField('company')).rejects.toMatchError(
      new DeletionError(CustomProfileFields.table, 'company')
    );

    expect(updateSignInExperience).not.toHaveBeenCalled();
    expect(updateAccountCenter).not.toHaveBeenCalled();
    expect(deleteCustomProfileFieldsByName).toHaveBeenCalledWith('company');
  });
});
