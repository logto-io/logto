// 2026-11-16 02:10 +03: kwtSMS connector test fixtures, placeholder credentials only (task: integration kwtsms_logto)
import type { KwtSmsConfig } from './types.js';

export const mockedConfig: KwtSmsConfig = {
  username: 'api-username',
  password: 'api-password',
  senderId: 'KWT-SMS',
  testMode: true,
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
