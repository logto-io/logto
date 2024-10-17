import type { GatewayApiSmsConfig } from './types.js';

const mockedEndpoint = 'https://gatewayapi.com/rest/mtsms';
const mockedApiToken = 'api-token';
const mockedSender = 'sender';

export const mockedConfig: GatewayApiSmsConfig = {
  endpoint: mockedEndpoint,
  apiToken: mockedApiToken,
  sender: mockedSender,
  templates: [
    {
      usageType: 'Generic',
      content: 'This is for testing purposes only. Your verification code is {{code}}.',
    },
  ],
};
