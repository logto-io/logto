import { type EmailTemplateDetails } from '@logto/connector-kit';

export const mockedConfig = {
  accessKeyId: 'accessKeyId',
  accessKeySecret: 'accessKeySecret+cltHAJ',
  region: 'region',
  emailAddress: 'fromEmail',
  templates: [
    {
      usageType: 'SignIn',
      content: 'Your code is {{code}}, {{code}} is your code',
      subject: 'Sign-in code {{code}}',
    },
    {
      usageType: 'Register',
      content: 'Your register code is {{code}}, {{code}} is your code',
      subject: 'subject',
    },
    {
      usageType: 'ForgotPassword',
      content: 'Your forgot password code is {{code}}, {{code}} is your code',
      subject: 'subject',
    },
    {
      usageType: 'Generic',
      content: 'Your generic code is {{code}}, {{code}} is your code',
      subject: 'subject',
    },
    {
      usageType: 'OrganizationInvitation',
      content: 'Your link is {{link}}',
      subject: 'Organization invitation',
    },
  ],
};
export const mockGenericI18nEmailTemplate: EmailTemplateDetails = {
  subject: 'Generic email',
  content: 'Verification code is {{code}}',
  replyTo: 'Reply-to {{to}}',
  sendFrom: 'Foo',
};
