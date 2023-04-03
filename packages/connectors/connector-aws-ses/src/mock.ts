export const mockedConfig = {
  accessKeyId: 'accessKeyId',
  accessKeySecret: 'accessKeySecret+cltHAJ',
  region: 'region',
  emailAddress: 'fromEmail',
  templates: [
    {
      usageType: 'SignIn',
      content: 'Your code is {{code}}, {{code}} is your code',
      subject: 'subject',
    },
    {
      usageType: 'Register',
      content: 'Your code is {{code}}, {{code}} is your code',
      subject: 'subject',
    },
    {
      usageType: 'ForgotPassword',
      content: 'Your code is {{code}}, {{code}} is your code',
      subject: 'subject',
    },
    {
      usageType: 'Generic',
      content: 'Your code is {{code}}, {{code}} is your code',
      subject: 'subject',
    },
  ],
};
