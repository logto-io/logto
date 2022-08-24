import { validateConfig } from '@logto/connector-core';

import { SmtpConfig, smtpConfigGuard } from './types';

function validator(config: unknown): asserts config is SmtpConfig {
  validateConfig<SmtpConfig>(config, smtpConfigGuard);
}

describe('validateConfig()', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should pass on valid config', async () => {
    expect(() => {
      validator({
        host: 'smtp.testing.com',
        port: 80,
        password: 'password',
        username: 'username',
        fromEmail: 'test@smtp.testing.com',
        templates: [
          {
            contentType: 'text/plain',
            content: 'This is for testing purposes only.',
            subject: 'Logto Test with SMTP',
            usageType: 'Test',
          },
          {
            contentType: 'text/plain',
            content: 'This is for sign-in purposes only.',
            subject: 'Logto Sign In with SMTP',
            usageType: 'SignIn',
          },
          {
            contentType: 'text/plain',
            content: 'This is for register purposes only.',
            subject: 'Logto Register with SMTP',
            usageType: 'Register',
          },
          {
            contentType: 'text/plain',
            content: 'This is for forgot-password purposes only.',
            subject: 'Logto Forgot Password with SMTP',
            usageType: 'ForgotPassword',
          },
        ],
      });
    }).not.toThrow();
  });

  it('should be false if config is invalid', async () => {
    expect(() => {
      validator({});
    }).toThrow();
  });
});
