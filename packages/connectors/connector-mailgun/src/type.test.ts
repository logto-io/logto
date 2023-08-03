import { VerificationCodeType } from '@logto/connector-kit';

import { mailgunConfigGuard } from './types.js';

describe('Mailgun config guard', () => {
  it('should pass with valid config', () => {
    const validConfig = {
      domain: 'example.com',
      apiKey: 'key',
      from: 'from',
      deliveries: {
        [VerificationCodeType.SignIn]: {
          html: 'html',
          subject: 'subject',
        },
        [VerificationCodeType.Register]: {
          template: 'template',
          variables: {},
          subject: 'subject',
        },
        [VerificationCodeType.ForgotPassword]: {
          html: 'html',
          text: 'text',
          subject: 'subject',
        },
        [VerificationCodeType.Generic]: {
          template: 'template',
          variables: {},
          subject: 'subject',
        },
      },
    };
    expect(() => mailgunConfigGuard.parse(validConfig)).not.toThrow();
  });

  it('should allow partial template config', () => {
    const validConfig = {
      domain: 'example.com',
      apiKey: 'key',
      from: 'from',
      deliveries: {
        [VerificationCodeType.SignIn]: {
          html: 'html',
          subject: 'subject',
        },
      },
    };
    expect(() => mailgunConfigGuard.parse(validConfig)).not.toThrow();
  });

  it('should fail with invalid delivery config', () => {
    const invalidConfig = {
      domain: 'example.com',
      apiKey: 'key',
      from: 'from',
      deliveries: {
        [VerificationCodeType.ForgotPassword]: {
          text: 'text',
          subject: 'subject',
        },
      },
    };
    expect(() => mailgunConfigGuard.parse(invalidConfig)).toThrow();
  });

  it('should fail with invalid endpoint', () => {
    const invalidConfig = {
      endpoint: 'https://api.mailgun1.net',
      domain: 'example.com',
      apiKey: 'key',
      from: 'from',
      deliveries: {
        [VerificationCodeType.ForgotPassword]: {
          html: 'html',
          subject: 'subject',
        },
      },
    };

    expect(() => mailgunConfigGuard.parse(invalidConfig)).toThrow();
  });
});
