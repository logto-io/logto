import {
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
});
