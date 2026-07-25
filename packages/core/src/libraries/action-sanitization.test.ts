import {
  InteractionEvent,
  LogtoActionKey,
  SignInIdentifier,
  VerificationType,
} from '@logto/schemas';

import {
  buildActionTelemetryError,
  buildSafeActionErrorSummary,
  toLoggableActionEvent,
  toLoggableActionResult,
} from './action-sanitization.js';

describe('toLoggableActionEvent', () => {
  it('drops the end user password from post first factor verification events', () => {
    const event = toLoggableActionEvent(LogtoActionKey.PostFirstFactorVerification, {
      key: LogtoActionKey.PostFirstFactorVerification,
      interactionEvent: InteractionEvent.SignIn,
      verificationType: VerificationType.Password,
      identifier: { type: SignInIdentifier.Username, value: 'old_user' },
      user: { id: 'user_id', username: 'old_user', primaryEmail: 'old_user@example.com' },
      password: 'plain-text-password',
    });

    expect(event).toEqual({
      key: LogtoActionKey.PostFirstFactorVerification,
      interactionEvent: InteractionEvent.SignIn,
      verificationType: VerificationType.Password,
      identifier: { type: SignInIdentifier.Username, value: 'old_user' },
      user: { id: 'user_id' },
    });
    expect(JSON.stringify(event)).not.toContain('plain-text-password');
    expect(JSON.stringify(event)).not.toContain('old_user@example.com');
  });

  it('keeps the identifier when it happens to equal the password', () => {
    const event = toLoggableActionEvent(LogtoActionKey.PostFirstFactorVerification, {
      key: LogtoActionKey.PostFirstFactorVerification,
      interactionEvent: InteractionEvent.SignIn,
      verificationType: VerificationType.Password,
      identifier: { type: SignInIdentifier.Username, value: 'old_user' },
      user: null,
      password: 'old_user',
    });

    expect(event).toEqual({
      key: LogtoActionKey.PostFirstFactorVerification,
      interactionEvent: InteractionEvent.SignIn,
      verificationType: VerificationType.Password,
      identifier: { type: SignInIdentifier.Username, value: 'old_user' },
      user: null,
    });
  });

  it('reduces the post sign-in user context to its ID', () => {
    const event = toLoggableActionEvent(LogtoActionKey.PostSignIn, {
      key: LogtoActionKey.PostSignIn,
      interactionEvent: InteractionEvent.SignIn,
      user: {
        id: 'user_id',
        username: 'old_user',
        primaryEmail: 'old_user@example.com',
        primaryPhone: '+1234567890',
        hasPassword: true,
        ssoIdentities: [{ issuer: 'https://sso.example.com' }],
        mfaVerificationFactors: ['Totp'],
        roles: [{ id: 'role_id', name: 'admin', scopes: [{ id: 'scope_id', name: 'all' }] }],
        organizations: [{ id: 'org_id', name: 'Org' }],
      },
    });

    expect(event).toEqual({
      key: LogtoActionKey.PostSignIn,
      interactionEvent: InteractionEvent.SignIn,
      user: { id: 'user_id' },
    });

    const serialized = JSON.stringify(event);
    for (const leaked of [
      'old_user@example.com',
      '+1234567890',
      'sso.example.com',
      'role_id',
      'org_id',
    ]) {
      expect(serialized).not.toContain(leaked);
    }
  });

  it('degrades to the action key when the event shape does not match', () => {
    expect(
      toLoggableActionEvent(LogtoActionKey.PostSignIn, { unexpected: 'private value' })
    ).toEqual({ key: LogtoActionKey.PostSignIn });
  });

  it('degrades to the action key when a discriminant drifts from the schema', () => {
    expect(
      toLoggableActionEvent(LogtoActionKey.PostFirstFactorVerification, {
        key: LogtoActionKey.PostFirstFactorVerification,
        interactionEvent: InteractionEvent.Register,
        verificationType: VerificationType.Password,
        identifier: { type: SignInIdentifier.Username, value: 'old_user' },
        user: null,
        password: 'plain-text-password',
      })
    ).toEqual({ key: LogtoActionKey.PostFirstFactorVerification });
  });

  it('degrades to the action key when reading the event throws', () => {
    const event = {
      get user() {
        throw new Error('private failure');
      },
    };

    expect(toLoggableActionEvent(LogtoActionKey.PostSignIn, event)).toEqual({
      key: LogtoActionKey.PostSignIn,
    });
  });
});

describe('toLoggableActionResult', () => {
  it('names only allowlisted patch fields and counts the rest', () => {
    expect(
      toLoggableActionResult({
        action: 'createUser',
        passwordVerified: true,
        user: {
          name: 'Foo',
          primaryEmail: 'foo@example.com',
          passwordEncrypted: 'private digest',
          'environment-secret-value': true,
        },
      })
    ).toEqual({
      passwordVerified: true,
      userFields: ['primaryEmail', 'name'],
      unknownFieldCount: 2,
    });
  });

  it('does not report a forged passwordVerified as verified', () => {
    expect(toLoggableActionResult({ action: 'createUser', passwordVerified: 'yes' })).toEqual({
      passwordVerified: false,
      userFields: [],
      unknownFieldCount: 0,
    });
  });

  it('reports non-object results as an empty patch', () => {
    expect(toLoggableActionResult(null)).toEqual({
      passwordVerified: false,
      userFields: [],
      unknownFieldCount: 0,
    });
  });

  it('falls back when reading the result throws', () => {
    expect(
      toLoggableActionResult({
        get user() {
          throw new Error('private failure');
        },
      })
    ).toBe('[unavailable]');
  });
});

describe('buildSafeActionErrorSummary', () => {
  it('keeps only safe validation issue fields from wrapped runner errors', () => {
    const summary = buildSafeActionErrorSummary({
      message: 'Invalid user patch',
      status: 422,
      data: {
        errors: [
          {
            path: ['event', 'user', 0],
            code: 'invalid_type',
            message: 'Expected string',
            received: 'private received value',
          },
          {
            path: 'user',
            code: 'unknown-issue-code',
          },
        ],
        request: { authorization: 'private authorization header' },
      },
    });

    expect(summary).toEqual({
      name: 'Error',
      message: 'Invalid user patch',
      status: 422,
      errors: [{ path: ['event', 'user', 0], code: 'invalid_type' }],
    });

    const serialized = JSON.stringify(summary);
    expect(serialized).not.toContain('private received value');
    expect(serialized).not.toContain('private authorization header');
  });

  it('scrubs exact end-user credentials from the message and issue paths when requested', () => {
    const password = 'plain-text-password';

    expect(
      buildSafeActionErrorSummary(
        {
          message: `failed for ${password}`,
          errors: [
            {
              path: ['event', password, 0],
              code: 'invalid_type',
            },
            {
              path: password,
              code: 'invalid_type',
            },
          ],
        },
        { redactValues: [password] }
      )
    ).toEqual({
      name: 'Error',
      message: 'failed for [redacted]',
      errors: [
        { path: ['event', '[redacted]', 0], code: 'invalid_type' },
        { path: '[redacted]', code: 'invalid_type' },
      ],
    });
  });

  it('falls back to a fixed message when no message is available', () => {
    expect(buildSafeActionErrorSummary({ message: '' })).toEqual({
      name: 'Error',
      message: 'Action execution failed.',
    });
  });
});

describe('buildActionTelemetryError', () => {
  it('reports only the failure category and status', () => {
    class RemoteRunnerError extends Error {
      get status() {
        return 502;
      }
    }

    const telemetryError = buildActionTelemetryError(
      new RemoteRunnerError('execution failed for plain-text-password')
    );

    expect(telemetryError).toMatchObject({
      name: 'ActionExecutionError',
      message: 'Action execution failed. Status: 502.',
    });
    expect(JSON.stringify({ ...telemetryError, stack: telemetryError.stack })).not.toContain(
      'plain-text-password'
    );
  });

  it('omits the status when the error does not carry one', () => {
    expect(buildActionTelemetryError(new Error('private failure'))).toMatchObject({
      name: 'ActionExecutionError',
      message: 'Action execution failed.',
    });
  });
});
