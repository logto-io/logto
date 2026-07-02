import { type JwtCustomizerUserContext, UsersPasswordEncryptionMethod } from '@logto/schemas';

import { mockUser } from '#src/__mocks__/user.js';
import RequestError from '#src/errors/RequestError/index.js';

import {
  type ValidatedPostFirstFactorVerificationHookResult,
  type ValidatedPostSignInHookResult,
  validatePostFirstFactorVerificationHookResult,
  validatePostSignInHookResult,
} from './inline-hook-result-validation.js';

const hookUser: JwtCustomizerUserContext = {
  id: mockUser.id,
  username: mockUser.username,
  primaryEmail: mockUser.primaryEmail,
  primaryPhone: mockUser.primaryPhone,
  name: mockUser.name,
  avatar: mockUser.avatar,
  customData: mockUser.customData,
  identities: mockUser.identities,
  lastSignInAt: mockUser.lastSignInAt,
  createdAt: mockUser.createdAt,
  updatedAt: mockUser.updatedAt,
  profile: mockUser.profile,
  applicationId: mockUser.applicationId,
  isSuspended: mockUser.isSuspended,
  hasPassword: true,
  ssoIdentities: [],
  mfaVerificationFactors: [],
  roles: [],
  organizations: [],
  organizationRoles: [],
};
const invalidCredentialsResult: ValidatedPostFirstFactorVerificationHookResult = {
  action: 'rejectInvalidCredentials',
};
const continueResult: ValidatedPostSignInHookResult = {
  action: 'continue',
};

describe('validatePostFirstFactorVerificationHookResult', () => {
  it.each([
    undefined,
    null,
    {},
    [],
    { action: 'createUser', user: { name: 'Jane Doe' } },
    { action: 'createUser', passwordVerified: true },
    { action: 'createUser', passwordVerified: false, user: { name: 'Jane Doe' } },
    { action: 'updateUser', passwordVerified: true, user: { id: 'not-allowed' } },
    {
      action: 'createUser',
      passwordVerified: true,
      user: {
        name: 'Jane Doe',
        passwordEncrypted: 'script-supplied-hash',
        passwordEncryptionMethod: UsersPasswordEncryptionMethod.Argon2i,
      },
    },
    {
      action: 'createUser',
      passwordVerified: true,
      user: {
        name: 'Jane Doe',
        passwordDigest: 'script-supplied-hash',
        passwordAlgorithm: UsersPasswordEncryptionMethod.Argon2i,
      },
    },
    { action: 'deleteUser', passwordVerified: true, user: { name: 'Jane Doe' } },
  ])('returns invalid-credentials rejection for invalid result %#', (result) => {
    expect(
      validatePostFirstFactorVerificationHookResult({
        event: {
          user: null,
        },
        result,
      })
    ).toEqual(invalidCredentialsResult);
  });

  it('accepts createUser when the event user is null', () => {
    expect(
      validatePostFirstFactorVerificationHookResult({
        event: {
          user: null,
        },
        result: {
          action: 'createUser',
          passwordVerified: true,
          user: {
            primaryEmail: 'jane@example.com',
            name: 'Jane Doe',
          },
        },
      })
    ).toEqual({
      action: 'createUser',
      user: {
        primaryEmail: 'jane@example.com',
        name: 'Jane Doe',
      },
    });
  });

  it('accepts updateUser when the event user exists', () => {
    expect(
      validatePostFirstFactorVerificationHookResult({
        event: {
          user: hookUser,
        },
        result: {
          action: 'updateUser',
          passwordVerified: true,
          user: {
            name: 'Jane Doe',
          },
        },
      })
    ).toEqual({
      action: 'updateUser',
      userId: hookUser.id,
      user: {
        name: 'Jane Doe',
      },
    });
  });

  it('throws identity conflict when createUser is returned for an existing event user', () => {
    expect(() =>
      validatePostFirstFactorVerificationHookResult({
        event: {
          user: hookUser,
        },
        result: {
          action: 'createUser',
          passwordVerified: true,
          user: {
            name: 'Jane Doe',
          },
        },
      })
    ).toMatchError(new RequestError({ code: 'session.identity_conflict', status: 409 }));
  });

  it('throws identity conflict when updateUser is returned for a missing event user', () => {
    expect(() =>
      validatePostFirstFactorVerificationHookResult({
        event: {
          user: null,
        },
        result: {
          action: 'updateUser',
          passwordVerified: true,
          user: {
            name: 'Jane Doe',
          },
        },
      })
    ).toMatchError(new RequestError({ code: 'session.identity_conflict', status: 409 }));
  });
});

describe('validatePostSignInHookResult', () => {
  it.each([undefined, null, {}, { action: 'updateUser' }])(
    'returns continue for no-op result %#',
    (result) => {
      expect(
        validatePostSignInHookResult({
          event: {
            user: hookUser,
          },
          result,
        })
      ).toEqual(continueResult);
    }
  );

  it('accepts updateUser with a sanitized provisioning profile', () => {
    expect(
      validatePostSignInHookResult({
        event: {
          user: hookUser,
        },
        result: {
          action: 'updateUser',
          user: {
            name: 'Jane Doe',
            profile: {
              givenName: 'Jane',
              familyName: 'Doe',
              ignored: 'not persisted',
            },
            customData: {
              plan: 'pro',
            },
          },
        },
      })
    ).toEqual({
      action: 'updateUser',
      userId: hookUser.id,
      user: {
        name: 'Jane Doe',
        profile: {
          givenName: 'Jane',
          familyName: 'Doe',
        },
        customData: {
          plan: 'pro',
        },
      },
    });
  });

  it.each([
    [],
    { action: 'createUser' },
    { action: 'createUser', user: { name: 'Jane Doe' } },
    { action: 'rejectInvalidCredentials' },
    { action: 'rejectInvalidCredentials', user: { name: 'Jane Doe' } },
    { action: 'denyAccess' },
    { action: 'denyAccess', user: { name: 'Jane Doe' } },
    { action: 'continue' },
    { action: 'continue', user: { name: 'Jane Doe' } },
    { user: { name: 'Jane Doe' } },
    { action: 'updateUser', user: null },
    { action: 'updateUser', user: { id: 'not-allowed' } },
    {
      action: 'updateUser',
      user: {
        name: 'Jane Doe',
        passwordEncrypted: 'script-supplied-hash',
        passwordEncryptionMethod: UsersPasswordEncryptionMethod.Argon2i,
      },
    },
    {
      action: 'updateUser',
      user: {
        name: 'Jane Doe',
        passwordDigest: 'script-supplied-hash',
        passwordAlgorithm: UsersPasswordEncryptionMethod.Argon2i,
      },
    },
  ])('throws verification failure for invalid result %#', (result) => {
    expect(() =>
      validatePostSignInHookResult({
        event: {
          user: hookUser,
        },
        result,
      })
    ).toMatchError(new RequestError({ code: 'session.verification_failed', status: 400 }));
  });
});
