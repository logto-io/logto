import { type HookUser } from '@logto/schemas';

import { mockUser } from '#src/__mocks__/user.js';
import RequestError from '#src/errors/RequestError/index.js';

import {
  type ValidatedPostFirstFactorVerificationHookResult,
  type ValidatedPostSignInHookResult,
  validatePostFirstFactorVerificationHookResult,
  validatePostSignInHookResult,
} from './inline-hook-result-validation.js';

const hookUser: HookUser = mockUser;
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
  it.each([undefined, null, {}, { action: 'updateUser' }, { ignored: true }])(
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

  it('accepts updateUser with a provisioning profile', () => {
    expect(
      validatePostSignInHookResult({
        event: {
          user: hookUser,
        },
        result: {
          action: 'updateUser',
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

  it.each([
    [],
    { action: 'createUser' },
    { action: 'createUser', user: { name: 'Jane Doe' } },
    { user: { name: 'Jane Doe' } },
    { action: 'updateUser', user: null },
    { action: 'updateUser', user: { id: 'not-allowed' } },
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
