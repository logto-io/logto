import type { SmsbaoSmsConfig } from './types.js';

export const mockedConfig: SmsbaoSmsConfig = {
  username: 'smsbao-user',
  passwordOrApiKey: 'smsbao-api-key-or-md5-password',
  goodsId: '123456',
  templates: [
    {
      usageType: 'Generic',
      content: '您的验证码是 {{code}}。如非本人操作，请忽略本短信',
    },
    {
      usageType: 'SignIn',
      content: '您的登录验证码是 {{code}}。如非本人操作，请忽略本短信',
    },
    {
      usageType: 'Register',
      content: '您的注册验证码是 {{code}}。如非本人操作，请忽略本短信',
    },
    {
      usageType: 'ForgotPassword',
      content: '您的重置密码验证码是 {{code}}。如非本人操作，请忽略本短信',
    },
  ],
};
