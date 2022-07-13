import { GetConnectorConfig } from '@logto/connector-types';

import SmtpConnector from '.';

const getConnectorConfig = jest.fn() as GetConnectorConfig;

const smtpMethods = new SmtpConnector(getConnectorConfig);

describe('validateConfig()', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should pass on valid config', async () => {
    expect(
      smtpMethods.validateConfig({
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
      })
    ).toEqual(true);
  });

  it('should be false if config is invalid', async () => {
    expect(smtpMethods.validateConfig({})).toEqual(false);
  });
});
