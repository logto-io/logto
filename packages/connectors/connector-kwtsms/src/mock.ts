import { TemplateType } from '@logto/connector-kit';

import type { KwtSmsConfig } from './types.js';

export const mockedConfig: KwtSmsConfig = {
  username: 'api-username',
  password: 'api-password',
  senderId: 'KWT-SMS',
  testMode: true,
  templates: [
    {
      usageType: TemplateType.SignIn,
      content: 'This is for testing purposes only. Your sign-in verification code is {{code}}.',
    },
    {
      usageType: TemplateType.Register,
      content: 'This is for testing purposes only. Your sign-up verification code is {{code}}.',
    },
    {
      usageType: TemplateType.ForgotPassword,
      content:
        'This is for testing purposes only. Your password change verification code is {{code}}.',
    },
    {
      usageType: TemplateType.Generic,
      content: 'This is for testing purposes only. Your verification code is {{code}}.',
    },
  ],
};
