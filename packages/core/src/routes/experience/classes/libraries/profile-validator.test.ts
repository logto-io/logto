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
  });
});
