import { EnvSet } from '#src/env-set/index.js';
import { MockQueries } from '#src/test-utils/tenant.js';

import { createCustomProfileFieldsLibrary } from './index.js';

const { jest } = import.meta;

describe('createCustomProfileFieldsLibrary', () => {
  const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;
  const findAllCustomProfileFields = jest.fn();
  const queries = new MockQueries({
    customProfileFields: {
      findAllCustomProfileFields,
    },
  });
  const { normalizeSignUpProfileFields } = createCustomProfileFieldsLibrary(queries);

  const setDevFeaturesEnabled = (enabled: boolean) => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled = enabled;
  };

  beforeEach(() => {
    setDevFeaturesEnabled(true);
    findAllCustomProfileFields.mockReset();
  });

  afterAll(() => {
    setDevFeaturesEnabled(originalIsDevFeaturesEnabled);
  });

  it('should deduplicate missing names in the validation error', async () => {
    findAllCustomProfileFields.mockResolvedValue([{ name: 'company' }]);

    await expect(
      normalizeSignUpProfileFields([{ name: 'unknown' }, { name: 'unknown' }])
    ).rejects.toMatchObject({
      code: 'custom_profile_fields.entity_not_exists_with_names',
      message: 'Cannot find entities with the given names: unknown',
    });
  });

  it('should include duplicate names in the validation error payload', async () => {
    findAllCustomProfileFields.mockResolvedValue([{ name: 'company' }, { name: 'inviteCode' }]);

    await expect(
      normalizeSignUpProfileFields([
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
      message: 'Input is invalid. Duplicate sign-up profile field names: company, inviteCode',
    });
  });
});
