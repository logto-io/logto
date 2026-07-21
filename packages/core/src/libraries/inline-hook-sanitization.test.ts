import {
  buildSafeInlineHookErrorSummary,
  buildSafeInlineHookTelemetryError,
  sanitizeInlineHookEvent,
  sanitizeInlineHookResult,
} from './inline-hook-sanitization.js';

describe('sanitizeInlineHookResult', () => {
  it('redacts sensitive values from untrusted property names', () => {
    const sensitiveValue = 'environment-secret-value';
    const sanitizedResult = sanitizeInlineHookResult(
      {
        [sensitiveValue]: true,
        nested: {
          [`prefix-${sensitiveValue}`]: 'safe value',
        },
      },
      [sensitiveValue]
    );

    expect(sanitizedResult).toEqual({
      '[redacted]': '******',
      nested: {
        'prefix-[redacted]': '******',
      },
    });
    expect(JSON.stringify(sanitizedResult)).not.toContain(sensitiveValue);
  });

  it('redacts sensitive values from events and telemetry errors', () => {
    const sensitiveValue = 'plain-text-password';
    const sanitizedEvent = sanitizeInlineHookEvent(
      {
        password: sensitiveValue,
        note: `received ${sensitiveValue}`,
      },
      [sensitiveValue]
    );
    const telemetryError = buildSafeInlineHookTelemetryError(
      new Error(`execution failed for ${sensitiveValue}`),
      [sensitiveValue]
    );

    expect(sanitizedEvent).toEqual({
      password: '******',
      note: 'received [redacted]',
    });
    expect(telemetryError).toMatchObject({
      name: 'Error',
      message: 'execution failed for [redacted]',
    });
    expect(JSON.stringify({ sanitizedEvent, telemetryError })).not.toContain(sensitiveValue);
  });

  it('uses the shared sensitive-data policy while preserving safe metadata', () => {
    const sanitizedEvent = sanitizeInlineHookEvent(
      {
        javaScript: 'private script',
        environmentVariablesBackup: { TOKEN: 'private environment value' },
        applicationSecret: { name: 'rotation-2' },
        unsafeApplicationSecret: { name: 'rotation-2', value: 'private application secret' },
        passwordVerified: true,
      },
      []
    );

    expect(sanitizedEvent).toEqual({
      applicationSecret: { name: 'rotation-2' },
      unsafeApplicationSecret: '******',
      passwordVerified: true,
    });
  });

  it('keeps only safe validation issue fields from wrapped runner errors', () => {
    const sensitiveValue = 'private-field-name';
    const summary = buildSafeInlineHookErrorSummary(
      {
        message: `Invalid ${sensitiveValue}`,
        error: {
          errors: [
            {
              path: ['event', sensitiveValue, 0],
              code: 'invalid_type',
              message: sensitiveValue,
              received: sensitiveValue,
            },
            {
              path: sensitiveValue,
              code: `unknown-${sensitiveValue}`,
            },
          ],
          request: { authorization: sensitiveValue },
        },
      },
      [sensitiveValue]
    );

    expect(summary).toEqual({
      name: 'Error',
      message: 'Invalid [redacted]',
      errors: [{ path: ['event', '[redacted]', 0], code: 'invalid_type' }],
    });
    expect(JSON.stringify(summary)).not.toContain(sensitiveValue);
  });
});
