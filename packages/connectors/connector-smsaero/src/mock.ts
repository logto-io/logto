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
      usageType: 'Generic',
      content: 'This is for testing purposes only. Your verification code is {{code}}.',
    },
  ],
};
