import { mailJunkyConfigGuard } from './types.js';

describe('mailJunkyConfigGuard', () => {
  it('accepts valid config with required template usage types', () => {
    expect(() =>
      mailJunkyConfigGuard.parse({
        apiKey: 'mj_live_key',
        fromEmail: 'noreply@example.com',
        fromName: 'Example',
        templates: [
          { usageType: 'Register', subject: 's', content: 'c {{code}}' },
          { usageType: 'SignIn', subject: 's', content: 'c {{code}}' },
          { usageType: 'ForgotPassword', subject: 's', content: 'c {{code}}' },
          { usageType: 'Generic', subject: 's', content: 'c {{code}}' },
        ],
      })
    ).not.toThrow();
  });

  it('rejects when a required usage type is missing', () => {
    expect(() =>
      mailJunkyConfigGuard.parse({
        apiKey: 'k',
        fromEmail: 'a@b.com',
        templates: [
          { usageType: 'Register', subject: 's', content: 'c' },
          { usageType: 'SignIn', subject: 's', content: 'c' },
          { usageType: 'ForgotPassword', subject: 's', content: 'c' },
        ],
      })
    ).toThrow();
  });
});
