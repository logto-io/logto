import { consoleUserPreferenceKey } from '@logto/schemas';

import { mockUser } from '#src/__mocks__/user.js';
import RequestError from '#src/errors/RequestError/index.js';
import { MockQueries } from '#src/test-utils/tenant.js';

import { ProfileValidator } from './profile-validator.js';

const { jest } = import.meta;

describe('ProfileValidator', () => {
  const mockFindAllCustomProfileFields = jest.fn();
  const queries = new MockQueries({
    customProfileFields: {
      findAllCustomProfileFields: mockFindAllCustomProfileFields,
    },
  });
  const profileValidator = new ProfileValidator(queries);

  describe('validateAndParseCustomProfile', () => {
    it('should parse and split profile data into built-in and custom fields', () => {
      const profile = {
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
        gender: 'male',
        birthdate: '2000-01-01',
        website: 'https://example.com',
        customField: 'customValue',
      };
      expect(profileValidator.validateAndParseCustomProfile(profile)).toEqual({
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
        profile: {
          gender: 'male',
          birthdate: '2000-01-01',
          website: 'https://example.com',
        },
        customData: {
          customField: 'customValue',
        },
      });
    });

    it('should throw error if sign-in identifier key is used', () => {
      expect(() =>
        profileValidator.validateAndParseCustomProfile({
          name: 'John Doe',
          gender: 'male',
          birthdate: '2000-01-01',
          email: 'john@example.com',
        })
      ).toThrow(
        new RequestError({
          code: 'custom_profile_fields.name_conflict_sign_in_identifier',
          name: 'email',
        }).message
      );

      expect(() =>
        profileValidator.validateAndParseCustomProfile({
          name: 'John Doe',
          primaryEmail: 'john@example.com',
        })
      ).toThrow(
        new RequestError({
          code: 'custom_profile_fields.name_conflict_sign_in_identifier',
          name: 'primaryEmail',
        }).message
      );

      expect(() =>
        profileValidator.validateAndParseCustomProfile({
          name: 'John',
          primaryPhone: '1234567890',
        })
      ).toThrow(
        new RequestError({
          code: 'custom_profile_fields.name_conflict_sign_in_identifier',
          name: 'primaryPhone',
        }).message
      );

      expect(() =>
        profileValidator.validateAndParseCustomProfile({
          username: 'janedoe',
          gender: 'female',
          phone: '1234567890',
        })
      ).toThrow(
        new RequestError({
          code: 'custom_profile_fields.name_conflict_sign_in_identifier',
          name: 'username, phone',
        }).message
      );
    });

    it('should throw error if reserved custom data key is used', () => {
      expect(() =>
        profileValidator.validateAndParseCustomProfile({
          name: 'John Doe',
          gender: 'male',
          birthdate: '2000-01-01',
          [consoleUserPreferenceKey]: 'customValue',
        })
      ).toThrow(
        new RequestError({
          code: 'custom_profile_fields.name_conflict_custom_data',
          name: consoleUserPreferenceKey,
        }).message
      );
    });
  });

  describe('hasMissingExtraProfileFields', () => {
    it('should return true if missing mandatory custom profile fields', async () => {
      mockFindAllCustomProfileFields.mockResolvedValue([
        {
          type: 'Text',
          name: 'name',
          required: true,
        },
      ]);
      expect(await profileValidator.hasMissingExtraProfileFields({})).toBe(true);
    });
    it('should return false if mandatory custom profile fields are provided', async () => {
      mockFindAllCustomProfileFields.mockResolvedValue([
        {
          type: 'Text',
          name: 'name',
          required: true,
        },
      ]);
      expect(await profileValidator.hasMissingExtraProfileFields({ name: 'John Doe' })).toBe(false);
      expect(
        await profileValidator.hasMissingExtraProfileFields({}, { ...mockUser, name: 'John Doe' })
      ).toBe(false);
    });
    it('should check "fullname" field into "givenName", "middleName" and "familyName" instead of fullname', async () => {
      mockFindAllCustomProfileFields.mockResolvedValue([
        {
          type: 'Fullname',
          name: 'fullname',
          required: true,
          config: {
            parts: [
              { name: 'givenName', enabled: true },
              { name: 'middleName', enabled: true },
              { name: 'familyName', enabled: true },
            ],
          },
        },
      ]);
      expect(await profileValidator.hasMissingExtraProfileFields({ name: 'John Doe' })).toBe(true);
      expect(
        await profileValidator.hasMissingExtraProfileFields({
          profile: { givenName: 'John', middleName: 'M', familyName: 'Doe' },
        })
      ).toBe(false);
      expect(
        await profileValidator.hasMissingExtraProfileFields(
          {},
          { ...mockUser, profile: { givenName: 'John', middleName: 'M', familyName: 'Doe' } }
        )
      ).toBe(false);
    });
  });
});
