/* eslint-disable max-lines -- Action result validation scenarios share extensive fixtures. */
import {
  type ActionMfaVerification,
  type ActionUser,
  type JwtCustomizerUserContext,
  MfaFactor,
  SignInIdentifier,
} from '@logto/schemas';

import { mockUser } from '#src/__mocks__/user.js';
import RequestError from '#src/errors/RequestError/index.js';
import { WorkerThreadScriptRunner } from '#src/libraries/script-runner/worker-thread-script-runner.js';

import {
  type ValidatedPostFirstFactorVerificationActionResult,
  type ValidatedPostSignInActionResult,
  validatePostFirstFactorVerificationActionResult,
  validatePostSignInActionResult,
} from './action-result-validation.js';

// Jest's asymmetric matcher is typed as `any`; the cast keeps the expected objects typed.
const anyString = expect.any(String) as string;
const signInIdentifier = {
  type: SignInIdentifier.Email,
  value: 'jane@example.com',
} as const;
const p1Event = (
  // eslint-disable-next-line @typescript-eslint/ban-types -- matches PostFirstFactorVerificationEvent.user
  user: ActionUser | null
) => ({
  user,
  identifier: signInIdentifier,
});
const actionUser: JwtCustomizerUserContext = {
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
  cimdClientId: mockUser.cimdClientId,
  isSuspended: mockUser.isSuspended,
  hasPassword: true,
  ssoIdentities: [],
  mfaVerificationFactors: [],
  roles: [],
  organizations: [],
  organizationRoles: [],
};
const invalidCredentialsResult: ValidatedPostFirstFactorVerificationActionResult = {
  action: 'rejectInvalidCredentials',
};
const continueResult: ValidatedPostSignInActionResult = {
  action: 'continue',
};
const totpSecret = 'JBSWY3DPEHPK3PXP';
const backupCodes = [
  'd94c2f29ae',
  '74fa801bb7',
  '2cbcc9323c',
  '87299f89aa',
  '0d95df8598',
  '78eedbf35d',
  '0fa4c1fd19',
  '7384b69eb5',
  '7bf2481db7',
  'f00febc9ae',
];
const migratedMfaVerifications: ActionMfaVerification[] = [
  {
    type: MfaFactor.TOTP,
    secret: totpSecret,
  },
  {
    type: MfaFactor.BackupCode,
    codes: backupCodes,
  },
  {
    type: MfaFactor.WebAuthn,
    credentialId: 'AQIDBA',
    publicKey: 'AQIDBAUGBwgJ',
    counter: 1,
    rpId: 'example.com',
    transports: ['internal'],
    agent: 'agent',
    name: 'Laptop',
  },
];

describe('validatePostFirstFactorVerificationActionResult', () => {
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
    {
      action: 'createUser',
      passwordVerified: true,
      user: { name: 'Jane Doe' },
      mfaVerifications: [{ type: MfaFactor.TOTP }],
    },
  ])('returns invalid-credentials rejection for invalid result %#', (result) => {
    expect(
      validatePostFirstFactorVerificationActionResult({
        event: p1Event(null),
        result,
      })
    ).toEqual(invalidCredentialsResult);
  });

  it('accepts createUser when the event user is null', () => {
    expect(
      validatePostFirstFactorVerificationActionResult({
        event: p1Event(null),
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
      validatePostFirstFactorVerificationActionResult({
        event: p1Event(actionUser),
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
      userId: actionUser.id,
      user: {
        name: 'Jane Doe',
      },
    });
  });

  it('accepts migrated MFA factors alongside a createUser result', () => {
    expect(
      validatePostFirstFactorVerificationActionResult({
        event: p1Event(null),
        result: {
          action: 'createUser',
          passwordVerified: true,
          user: {
            name: 'Jane Doe',
          },
          mfaVerifications: migratedMfaVerifications,
        },
      })
    ).toEqual({
      action: 'createUser',
      user: {
        name: 'Jane Doe',
      },
      mfaVerifications: [
        {
          id: anyString,
          createdAt: anyString,
          type: MfaFactor.TOTP,
          key: totpSecret,
        },
        {
          id: anyString,
          createdAt: anyString,
          type: MfaFactor.BackupCode,
          codes: backupCodes.map((code) => ({ code })),
        },
        {
          id: anyString,
          createdAt: anyString,
          type: MfaFactor.WebAuthn,
          credentialId: 'AQIDBA',
          publicKey: 'AQIDBAUGBwgJ',
          counter: 1,
          rpId: 'example.com',
          transports: ['internal'],
          agent: 'agent',
          name: 'Laptop',
        },
      ],
    });
  });

  it('accepts migrated MFA factors alongside an updateUser result', () => {
    expect(
      validatePostFirstFactorVerificationActionResult({
        event: p1Event(actionUser),
        result: {
          action: 'updateUser',
          passwordVerified: true,
          user: {},
          mfaVerifications: [
            {
              type: MfaFactor.WebAuthn,
              credentialId: 'AQIDBA',
              publicKey: 'AQIDBAUGBwgJ',
              counter: 0,
            },
          ],
        },
      })
    ).toEqual({
      action: 'updateUser',
      userId: actionUser.id,
      user: {},
      mfaVerifications: [
        {
          id: anyString,
          createdAt: anyString,
          type: MfaFactor.WebAuthn,
          credentialId: 'AQIDBA',
          publicKey: 'AQIDBAUGBwgJ',
          counter: 0,
          agent: '',
        },
      ],
    });
  });

  it.each([
    { type: MfaFactor.TOTP, secret: 'invalid' },
    { type: MfaFactor.BackupCode, codes: ['invalid'] },
    {
      type: MfaFactor.WebAuthn,
      credentialId: 'AQIDBA',
      publicKey: 'not base64url!',
      counter: 0,
    },
  ])('rejects malformed MFA credential %#', (mfaVerification) => {
    expect(
      validatePostFirstFactorVerificationActionResult({
        event: p1Event(null),
        result: {
          action: 'createUser',
          passwordVerified: true,
          user: {
            name: 'Jane Doe',
          },
          mfaVerifications: [mfaVerification],
        },
      })
    ).toEqual(invalidCredentialsResult);
  });

  it('throws identity conflict when createUser is returned for an existing event user', () => {
    expect(() =>
      validatePostFirstFactorVerificationActionResult({
        event: p1Event(actionUser),
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
      validatePostFirstFactorVerificationActionResult({
        event: p1Event(null),
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

  it('allows omitting the anchor identifier field', () => {
    expect(
      validatePostFirstFactorVerificationActionResult({
        event: p1Event(null),
        result: {
          action: 'createUser',
          passwordVerified: true,
          user: {
            name: 'Jane Doe',
          },
        },
      })
    ).toEqual({
      action: 'createUser',
      user: {
        name: 'Jane Doe',
      },
    });
  });

  it('rejects changing the anchor identifier value', () => {
    expect(() =>
      validatePostFirstFactorVerificationActionResult({
        event: p1Event(null),
        result: {
          action: 'createUser',
          passwordVerified: true,
          user: {
            primaryEmail: 'other@example.com',
          },
        },
      })
    ).toMatchError(
      new RequestError(
        { code: 'action.sign_in_identifier_changed', status: 422 },
        { identifierType: SignInIdentifier.Email }
      )
    );
  });

  it('allows the same email with different casing', () => {
    expect(
      validatePostFirstFactorVerificationActionResult({
        event: p1Event(null),
        result: {
          action: 'createUser',
          passwordVerified: true,
          user: {
            primaryEmail: 'Jane@Example.com',
            name: 'Jane Doe',
          },
        },
      })
    ).toEqual({
      action: 'createUser',
      user: {
        primaryEmail: 'Jane@Example.com',
        name: 'Jane Doe',
      },
    });
  });

  it('allows the same phone in a different format', () => {
    expect(
      validatePostFirstFactorVerificationActionResult({
        event: {
          user: null,
          identifier: {
            type: SignInIdentifier.Phone,
            value: '12025550123',
          },
        },
        result: {
          action: 'createUser',
          passwordVerified: true,
          user: {
            primaryPhone: '+1 (202) 555-0123',
            name: 'Jane Doe',
          },
        },
      })
    ).toEqual({
      action: 'createUser',
      user: {
        primaryPhone: '+1 (202) 555-0123',
        name: 'Jane Doe',
      },
    });
  });
});

describe('validatePostSignInActionResult', () => {
  it.each([undefined, null, {}, { action: 'updateUser' }])(
    'returns continue for no-op result %#',
    (result) => {
      expect(
        validatePostSignInActionResult({
          userId: actionUser.id,
          result,
        })
      ).toEqual(continueResult);
    }
  );

  // End-to-end guard on the shape validation actually receives: a script result is rebuilt by the
  // structured-clone round trip across the thread boundary, so what reaches the validator is a
  // plain object it never saw the script construct. An empty one must still read as a no-op.
  it('accepts an empty plain object returned across the worker thread boundary as a no-op', async () => {
    const runner = new WorkerThreadScriptRunner();

    try {
      const result = await runner.run({
        script: 'const runAction = () => ({})',
        entry: 'runAction',
        payload: {},
        limits: { wallClockMs: 5000, memoryMb: 64 },
        egress: { mode: 'allowAll' },
      });

      expect(result).toEqual({ ok: true, value: {} });
      expect(
        validatePostSignInActionResult({
          userId: actionUser.id,
          result: result.ok ? result.value : undefined,
        })
      ).toEqual(continueResult);
    } finally {
      await runner.dispose();
    }
  }, 10_000);

  it('accepts updateUser with a sanitized provisioning profile', () => {
    expect(
      validatePostSignInActionResult({
        userId: actionUser.id,
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
      userId: actionUser.id,
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

  it('ignores MFA factors in a PostSignIn result', () => {
    expect(
      validatePostSignInActionResult({
        userId: actionUser.id,
        result: {
          action: 'updateUser',
          user: {
            name: 'Jane Doe',
          },
          mfaVerifications: [
            {
              type: MfaFactor.TOTP,
              secret: totpSecret,
            },
          ],
        },
      })
    ).toEqual({
      action: 'updateUser',
      userId: actionUser.id,
      user: {
        name: 'Jane Doe',
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
    new Date(),
    new Map(),
    new (class {
      isInvalidResult() {
        return true;
      }
    })(),
    { ignored: true },
    { user: { name: 'Jane Doe' } },
    { action: 'updateUser', user: null },
    { action: 'updateUser', user: { id: 'not-allowed' } },
  ])('throws verification failure for invalid result %#', (result) => {
    expect(() =>
      validatePostSignInActionResult({
        userId: actionUser.id,
        result,
      })
    ).toMatchError(new RequestError({ code: 'session.verification_failed', status: 400 }));
  });
});
/* eslint-enable max-lines */
