import type { PostmarkConfig } from './types.js';

export const mockedServerToken = 'serverToken';

export const mockedConfig: PostmarkConfig = {
  serverToken: mockedServerToken,
  fromEmail: 'noreply@logto.test.io',
  templates: [
    {
      usageType: 'Generic',
      templateAlias: 'logto-generic',
    },
  ],
};
