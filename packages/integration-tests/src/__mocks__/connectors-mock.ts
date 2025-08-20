export const aliyunSmsConnectorId = 'aliyun-short-message-service';
export const aliyunSmsConnectorConfig = {
  accessKeyId: 'access-key-id-value',
  accessKeySecret: 'access-key-secret-value',
  signName: 'sign-name-value',
  templates: [
    {
      usageType: 'SignIn',
      templateCode: 'template-code-value',
    },
    {
      usageType: 'Register',
      templateCode: 'template-code-value',
    },
    {
      usageType: 'Test',
      templateCode: 'template-code-value',
    },
  ],
};

export const twilioSmsConnectorId = 'twilio-short-message-service';
export const twilioSmsConnectorConfig = {
  accountSID: 'account-sid-value',
  authToken: 'auth-token-value',
  fromMessagingServiceSID: 'from-messaging-service-sid-value',
  templates: [
    {
      content: 'This is for sign-in purposes only. Your passcode is {{code}}.',
      usageType: 'SignIn',
    },
    {
      content: 'This is for registering purposes only. Your passcode is {{code}}.',
      usageType: 'Register',
    },
    {
      content: 'This is for testing purposes only. Your passcode is {{code}}.',
      usageType: 'Test',
    },
  ],
};

export const aliyunEmailConnectorId = 'aliyun-direct-mail';
export const aliyunEmailConnectorConfig = {
  accessKeyId: 'your-access-key-id-value',
  accessKeySecret: 'your-access-key-secret-value',
  accountName: 'noreply@logto.io',
  fromAlias: 'from-alias-value',
  templates: [
    {
      subject: 'register-template-subject-value',
      content: 'Logto: Your passcode is {{code}}. (regitser template)',
      usageType: 'Register',
    },
    {
      subject: 'sign-in-template-subject-value',
      content: 'Logto: Your passcode is {{code}}. (sign-in template)',
      usageType: 'SignIn',
    },
    {
      subject: 'test-template-subject-value',
      content: 'Logto: Your passcode is {{code}}. (test template)',
      usageType: 'Test',
    },
  ],
};

export const sendgridEmailConnectorId = 'sendgrid-email-service';
export const sendgridEmailConnectorConfig = {
  apiKey: 'api-key-value',
  fromEmail: 'noreply@logto.test.io',
  fromName: 'from-name-value',
  templates: [
    {
      usageType: 'SignIn',
      type: 'text/plain',
      subject: 'Logto SignIn Template',
      content: 'This is for sign-in purposes only. Your passcode is {{code}}.',
    },
    {
      usageType: 'Register',
      type: 'text/plain',
      subject: 'Logto Register Template',
      content: 'This is for registering purposes only. Your passcode is {{code}}.',
    },
    {
      usageType: 'Test',
      type: 'text/plain',
      subject: 'Logto Test Template',
      content: 'This is for testing purposes only. Your passcode is {{code}}.',
    },
  ],
};

export const mockSmsConnectorId = 'mock-short-message-service';
export const mockSmsConnectorConfig = {
  accountSID: 'account-sid-value',
  authToken: 'auth-token-value',
  fromMessagingServiceSID: 'from-messaging-service-sid-value',
  templates: [
    {
      content: 'This is for sign-in purposes only. Your passcode is {{code}}.',
      usageType: 'SignIn',
    },
    {
      content: 'This is for registering purposes only. Your passcode is {{code}}.',
      usageType: 'Register',
    },
    {
      usageType: 'ForgotPassword',
      content: 'This is for forgot-password purposes only. Your passcode is {{code}}.',
    },
    {
      usageType: 'Generic',
      content: 'This is for Management API call only. Your passcode is {{code}}.',
    },
    {
      usageType: 'Test',
      content: 'This is for testing purposes only. Your passcode is {{code}}.',
    },
    {
      usageType: 'UserPermissionValidation',
      content: 'This is for user permission validation purposes only. Your passcode is {{code}}.',
    },
    {
      usageType: 'BindNewIdentifier',
      content: 'This is for binding new identifier purposes only. Your passcode is {{code}}.',
    },
    {
      usageType: 'MfaVerification',
      content: 'This is for MFA verification purposes only. Your passcode is {{code}}.',
    },
  ],
};

export const mockEmailConnectorId = 'mock-email-service';
export const mockEmailConnectorConfig = {
  apiKey: 'api-key-value',
  fromEmail: 'noreply@logto.test.io',
  fromName: 'from-name-value',
  templates: [
    {
      usageType: 'SignIn',
      type: 'text/plain',
      subject: 'Logto SignIn Template',
      content: 'This is for sign-in purposes only. Your passcode is {{code}}.',
    },
    {
      usageType: 'Register',
      type: 'text/plain',
      subject: 'Logto Register Template',
      content: 'This is for registering purposes only. Your passcode is {{code}}.',
    },
    {
      usageType: 'ForgotPassword',
      type: 'text/plain',
      subject: 'Logto Forgot Password Template',
      content: 'This is for forgot-password purposes only. Your passcode is {{code}}.',
    },
    {
      usageType: 'Generic',
      type: 'text/plain',
      subject: 'Logto Generic Template',
      content: 'This is for Management API call only. Your passcode is {{code}}.',
    },
    {
      usageType: 'Test',
      type: 'text/plain',
      subject: 'Logto Test Template',
      content: 'This is for testing purposes only. Your passcode is {{code}}.',
    },
    {
      usageType: 'OrganizationInvitation',
      type: 'text/plain',
      subject: 'Logto Organization Invitation Template',
      content: 'This is for organization invitation purposes only. Your link is {{link}}.',
    },
    {
      usageType: 'UserPermissionValidation',
      type: 'text/plain',
      subject: 'Logto User Permission Validation Template',
      content: 'This is for user permission validation purposes only. Your passcode is {{code}}.',
    },
    {
      usageType: 'BindNewIdentifier',
      type: 'text/plain',
      subject: 'Logto Bind New Identifier Template',
      content: 'This is for binding new identifier purposes only. Your passcode is {{code}}.',
    },
    {
      usageType: 'MfaVerification',
      type: 'text/plain',
      subject: 'Logto MFA Verification Template',
      content: 'This is for MFA verification purposes only. Your passcode is {{code}}.',
    },
  ],
};

export const mockAlternativeEmailConnectorId = 'mock-email-service-alternative';
export const mockAlternativeEmailConnectorConfig = {
  apiKey: 'api-key-value',
  fromEmail: 'noreply@logto.test.io',
  fromName: 'from-name-value',
  templates: [
    {
      usageType: 'SignIn',
      type: 'text/plain',
      subject: 'Logto SignIn Template',
      content: 'This is for sign-in purposes only. Your passcode is {{code}}.',
    },
    {
      usageType: 'Register',
      type: 'text/plain',
      subject: 'Logto Register Template',
      content: 'This is for registering purposes only. Your passcode is {{code}}.',
    },
    {
      usageType: 'ForgotPassword',
      type: 'text/plain',
      subject: 'Logto Forgot Password Template',
      content: 'This is for forgot-password purposes only. Your passcode is {{code}}.',
    },
    {
      usageType: 'Continue',
      type: 'text/plain',
      subject: 'Logto Continue Template',
      content: 'This is for completing user profile purposes only. Your passcode is {{code}}.',
    },
    {
      usageType: 'Test',
      type: 'text/plain',
      subject: 'Logto Test Template',
      content: 'This is for testing purposes only. Your passcode is {{code}}.',
    },
  ],
};

export const mockSocialConnectorId = 'mock-social-connector';
export const mockSocialConnectorTarget = 'mock-social';
export const mockSocialConnectorConfig = {
  clientId: 'client_id_value',
  clientSecret: 'client_secret_value',
};
export const mockSocialConnectorNewConfig = {
  clientId: 'client_id_value_new',
  clientSecret: 'client_secret_value_new',
};
