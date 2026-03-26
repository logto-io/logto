import { mockUser } from '#src/__mocks__/user.js';
import { getUserIdentifierCount } from '#src/utils/user.js';

const buildUser = () => ({
  ...mockUser,
  username: null,
  primaryEmail: null,
  primaryPhone: null,
  passwordEncrypted: null,
  passwordEncryptionMethod: null,
  identities: { github: { userId: 'github-user', details: {} } },
  mfaVerifications: [],
});

describe('account social identity unlink guard', () => {
  it('counts the remaining social identity as an identifier', () => {
    expect(getUserIdentifierCount(buildUser())).toBe(1);
  });

  it('counts primary identifiers and social identities together', () => {
    const user = {
      ...buildUser(),
      username: 'user',
      primaryEmail: 'foo@example.com',
      primaryPhone: '123456789',
      identities: {
        custom_social: { userId: 'custom-social-user', details: {} },
        github: { userId: 'github-user', details: {} },
      },
    };

    expect(getUserIdentifierCount(user)).toBe(5);
  });

  it('does not count password or mfa as identifiers', () => {
    const user = {
      ...buildUser(),
      passwordEncrypted: 'encrypted',
      passwordEncryptionMethod: mockUser.passwordEncryptionMethod,
      mfaVerifications: mockUser.mfaVerifications,
    };

    expect(getUserIdentifierCount(user)).toBe(1);
  });

  it('counts enterprise SSO identities as identifiers', () => {
    expect(getUserIdentifierCount(buildUser(), 2)).toBe(3);
  });
});
