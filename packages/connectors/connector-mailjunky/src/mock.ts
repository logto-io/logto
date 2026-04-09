import type { MailJunkyConfig, PublicParameters } from './types.js';

export const toEmail = 'foo@logto.io';
export const fromEmail = 'noreply@logto.test.io';
export const fromName = 'Logto Test';

export const mockedFrom = `${fromName} <${fromEmail}>`;

export const mockedGenericEmailParameters: PublicParameters = {
  from: mockedFrom,
  to: toEmail,
  subject: 'Logto Generic Template',
  text: 'Your Logto verification code is 123456. The code will remain active for 10 minutes.',
  html: 'Your Logto verification code is 123456. The code will remain active for 10 minutes.',
};

export const mockedApiKey = 'mj_test_apikey';

export const mockedConfig: MailJunkyConfig = {
  apiKey: mockedApiKey,
  fromEmail,
  fromName,
  templates: [
    {
      usageType: 'SignIn',
      subject: 'Logto SignIn Template',
      content:
        'Your Logto sign-in verification code is {{code}}. The code will remain active for 10 minutes.',
    },
    {
      usageType: 'Register',
      subject: 'Logto Register Template',
      content:
        'Your Logto sign-up verification code is {{code}}. The code will remain active for 10 minutes.',
    },
    {
      usageType: 'ForgotPassword',
      subject: 'Logto ForgotPassword Template',
      content:
        'Your Logto password change verification code is {{code}}. The code will remain active for 10 minutes.',
    },
    {
      usageType: 'Generic',
      subject: 'Logto Generic Template',
      content:
        'Your Logto verification code is {{code}}. The code will remain active for 10 minutes.',
    },
  ],
};
