import type { SignInExperience } from '@logto/schemas';

import { EnvSet } from '#src/env-set/index.js';
import { MockQueries } from '#src/test-utils/tenant.js';

import { createCustomProfileFieldsLibrary } from './index.js';

const { jest } = import.meta;

describe('createCustomProfileFieldsLibrary', () => {
  const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;
  const findCustomProfileFieldsByNames = jest.fn();
  const updateFieldOrderInSignInExperience = jest.fn();
  const queries = new MockQueries({
    customProfileFields: {
      findCustomProfileFieldsByNames,
      updateFieldOrderInSignInExperience,
    },
  });
  const { normalizeProfileFields, updateCustomProfileFieldsSieOrder } =
    createCustomProfileFieldsLibrary(queries);

  const setDevFeaturesEnabled = (enabled: boolean) => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled = enabled;
  };

  beforeEach(() => {
    setDevFeaturesEnabled(true);
    findCustomProfileFieldsByNames.mockReset();
    updateFieldOrderInSignInExperience.mockReset();
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
});
