import type { SmtpSmsConfig } from './types.js';

export const mockedConfig: SmtpSmsConfig = {
  host: 'smtp.example.com',
  port: 587,
  auth: { user: '<username>', pass: '<password>' },
  fromEmail: 'notifications@example.com',
  toEmailTemplate: '{{phoneNumberOnly}}@txt.att.net',
  subject: 'Verification Code',
  secure: false,
  tls: {},
  connectionTimeout: 120_000,
  greetingTimeout: 30_000,
  socketTimeout: 600_000,
  templates: [
    {
      usageType: 'Generic',
      content: 'Your Logto verification code is {{code}}. Expires in 10 minutes.',
    },
    {
      usageType: 'SignIn',
      content: 'Your Logto sign-in verification code is {{code}}. Expires in 10 minutes.',
    },
    {
      usageType: 'Register',
      content: 'Your Logto sign-up verification code is {{code}}. Expires in 10 minutes.',
    },
    {
      usageType: 'ForgotPassword',
      content: 'Your Logto password reset verification code is {{code}}. Expires in 10 minutes.',
    },
  ],
};
