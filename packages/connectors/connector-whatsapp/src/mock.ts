import type { WhatsAppSmsConfig } from './types.js';

const mockedAccessToken = 'test-access-token';
const mockedPhoneNumberId = 'test-phone-number-id';

export const mockedConfig: WhatsAppSmsConfig = {
  accessToken: mockedAccessToken,
  phoneNumberId: mockedPhoneNumberId,
  templates: [
    {
      usageType: 'Generic',
      templateName: 'logto_generic',
      language: 'en',
    },
    {
      usageType: 'SignIn',
      templateName: 'logto_sign_in',
      language: 'en',
    },
    {
      usageType: 'Register',
      templateName: 'logto_register',
      language: 'en',
    },
    {
      usageType: 'ForgotPassword',
      templateName: 'logto_forgot_password',
      language: 'en',
    },
  ],
};
