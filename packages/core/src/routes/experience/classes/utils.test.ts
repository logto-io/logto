import { type InteractionIdentifier, SignInIdentifier } from '@logto/schemas';

import { type InteractionProfile } from '../types.js';

import { interactionIdentifierToUserProfile } from './utils.js';

const identifierToProfileTestCase = [
  {
    identifier: {
      type: SignInIdentifier.Username,
      value: 'username',
    },
    expected: { username: 'username' },
  },
  {
    identifier: {
      type: SignInIdentifier.Email,
      value: 'email',
    },
    expected: { primaryEmail: 'email' },
  },
  {
    identifier: {
      type: SignInIdentifier.Phone,
      value: 'phone',
    },
    expected: { primaryPhone: 'phone' },
  },
] satisfies Array<{ identifier: InteractionIdentifier; expected: InteractionProfile }>;

describe('experience utils tests', () => {
  it.each(identifierToProfileTestCase)(
    `interactionIdentifierToUserProfile %p`,
    ({ identifier, expected }) => {
      expect(interactionIdentifierToUserProfile(identifier)).toEqual(expected);
    }
  );
});
