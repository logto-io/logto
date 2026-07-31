import type { SmsAeroConfig } from './types.js';

const mockedEmail = 'test@test.com';
const mockedApiKey = 'api-key';
const mockedSenderName = 'sender-name';

export const mockedConfig: SmsAeroConfig = {
  email: mockedEmail,
  apiKey: mockedApiKey,
  senderName: mockedSenderName,
  templates: [
    {
      usageType: 'SignIn',
      content: 'This is for testing purposes only. Your sign-in verification code is {{code}}.',
    },
    {
      usageType: 'Register',
      content: 'This is for testing purposes only. Your sign-up verification code is {{code}}.',
    },
    {
      usageType: 'ForgotPassword',
      content:
        'This is for testing purposes only. Your password change verification code is {{code}}.',
    },
    {
      usageType: 'Generic',
      content: 'This is for testing purposes only. Your verification code is {{code}}.',
    },
  ],
};
