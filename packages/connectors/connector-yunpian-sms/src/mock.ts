import type { YunpianSmsConfig } from './types.js';

export const mockedConfig: YunpianSmsConfig = {
  apikey: 'a123b456c789d0',
  templates: [
    {
      usageType: 'Generic',
      content: '您的验证码是{{code}}。如非本人操作，请忽略本短信',
    },
    {
      usageType: 'SignIn',
      content: '您的验证码是{{code}}。如非本人操作，请忽略本短信',
    },
    {
      usageType: 'Register',
      content: '您的验证码是{{code}}。如非本人操作，请忽略本短信',
    },
    {
      usageType: 'ForgotPassword',
      content: '您的验证码是{{code}}。如非本人操作，请忽略本短信',
    },
  ],
};
