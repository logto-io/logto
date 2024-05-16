import type { PostmarkConfig } from './types.js';

export const mockedServerToken = 'serverToken';

export const mockedConfig: PostmarkConfig = {
  serverToken: mockedServerToken,
  fromEmail: 'noreply@logto.test.io',
  templates: [
    {
      usageType: 'SignIn',
      templateAlias: 'logto-sign-in',
    },
    {
      usageType: 'Register',
      templateAlias: 'logto-register',
    },
    {
      usageType: 'ForgotPassword',
      templateAlias: 'logto-forgot-password',
    },
    {
      usageType: 'Generic',
      templateAlias: 'logto-generic',
    },
  ],
};
