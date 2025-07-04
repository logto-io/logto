import { consoleUserPreferenceKey } from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
import { MockQueries } from '#src/test-utils/tenant.js';

import { ProfileValidator } from './profile-validator.js';

describe('ProfileValidator', () => {
  const queries = new MockQueries();
  const profileValidator = new ProfileValidator(queries);

  describe('validateAndParseCustomProfile', () => {
    it('should parse and split profile data into built-in and custom fields', () => {
      const profile = {
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
        preferredUsername: 'John',
        gender: 'male',
        birthdate: '2000-01-01',
        website: 'https://example.com',
        customField: 'customValue',
      };
      expect(profileValidator.validateAndParseCustomProfile(profile)).toEqual({
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
        profile: {
          preferredUsername: 'John',
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
          preferredUsername: 'John',
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
          preferredUsername: 'John',
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
});
