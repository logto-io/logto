import type { VonageSmsConfig } from './types.js';

const mockedApiKey = 'api-key';
const mockedApiSecret = 'api-secret';
const mockedBrandName = 'brand name';

export const mockedConfig: VonageSmsConfig = {
  apiKey: mockedApiKey,
  apiSecret: mockedApiSecret,
  brandName: mockedBrandName,
  templates: [
    {
      usageType: 'Generic',
      content: 'This is for testing purposes only. Your verification code is {{code}}.',
    },
  ],
};
