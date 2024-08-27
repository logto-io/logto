export const mockedConfig = {
  host: '<test.smtp.host>',
  port: 80,
  auth: { pass: '<password>', user: '<username>' },
  fromEmail: '<notice@test.smtp>',
  templates: [
    {
      contentType: 'text/plain',
      content: 'This is for testing purposes only. Your verification code is {{    code }}.',
      subject: 'Logto Test with SMTP',
      usageType: 'Generic',
    },
    {
      contentType: 'text/plain',
      content: 'This is for sign-in purposes only. Your verification code is {{ code  }}.',
      subject: 'Logto sign-in with SMTP {{   code   }}',
      usageType: 'SignIn',
    },
    {
      contentType: 'text/plain',
      content: 'This is for register purposes only. Your verification code is {{code}}.',
      subject: 'Logto register with SMTP',
      usageType: 'Register',
    },
    {
      contentType: 'text/plain',
      content: 'This is for resetting password purposes only. Your verification code is {{code}}.',
      subject: 'Logto Forgot Password with SMTP',
      usageType: 'ForgotPassword',
    },
    {
      contentType: 'text/plain',
      content: 'This is for organization invitation. Your link is {{  link}}.',
      subject: 'Organization invitation',
      usageType: 'OrganizationInvitation',
    },
  ],
  customHeaders: {},
};

export const mockedOauth2AuthWithToken = {
  user: '<user@logto.io>',
  type: 'oauth2',
  clientId: '<client-id>',
  clientSecret: '<client-secret>',
  accessToken: '<access-token>',
};

export const mockedOauth2AuthWithKey = {
  user: '<user@logto.io>',
  serviceClient: '<service-client>',
  privateKey: '<private-key>',
};

export const mockedTlsOptionsWithoutTls = {
  servername: '<servername>',
  ignoreTLS: false,
  requireTLS: true,
};

export const mockedTlsOptionsWithTls = {
  tls: { rejectUnauthorized: true },
  servername: '<servername>',
  ignoreTLS: false,
  requireTLS: true,
};

export const mockedConnectionOptionsValid = {
  localAddress: '<local-address>',
  name: '<name>',
};

export const mockedConnectionOptionsInvalid = {
  name: '<name>',
};

export const mockedDebuggingOptions = {
  logger: true,
  debug: false,
};

export const mockedSecurityOptions = {
  disableFileAccess: true,
  disableUrlAccess: false,
};
