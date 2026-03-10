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
      language: 'es_AR',
    },
    {
      usageType: 'SignIn',
      templateName: 'logto_sign_in',
      language: 'es_AR',
    },
    {
      usageType: 'Register',
      templateName: 'logto_register',
      language: 'es_AR',
    },
    {
      usageType: 'ForgotPassword',
      templateName: 'logto_forgot_password',
      language: 'es_AR',
    },
  ],
};
