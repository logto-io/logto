export type PasswordlessConnectorCase = {
  factoryId: string;
  isEmailConnector: boolean;
  name: string;
  initialFormData: Record<string, string>;
  updateFormData: Record<string, string>;
  errorFormData: Record<string, string>;
};

const awsSesMail: PasswordlessConnectorCase = {
  factoryId: 'aws-ses-mail',
  isEmailConnector: true,
  name: 'AWS Direct Mail',
  initialFormData: {
    'formConfig.accessKeyId': 'access-key-id',
    'formConfig.accessKeySecret': 'access-key-config',
    'formConfig.region': 'region',
    'formConfig.emailAddress': 'email-address',
    'formConfig.emailAddressIdentityArn': 'email-address-identity-arn',
    'formConfig.feedbackForwardingEmailAddress': 'feedback-forwarding-email-address',
    'formConfig.feedbackForwardingEmailAddressIdentityArn':
      'feedback-forwarding-email-address-identity-arn',
    'formConfig.configurationSetName': 'configuration-set-name',
  },
  updateFormData: {
    'formConfig.accessKeyId': 'new-access-key-id',
    'formConfig.accessKeySecret': 'new-access-key-config',
    'formConfig.region': 'new-region',
    'formConfig.emailAddress': 'new-email-address',
    'formConfig.emailAddressIdentityArn': 'new-email-address-identity-arn',
    'formConfig.feedbackForwardingEmailAddress': 'new-feedback-forwarding-email-address',
    'formConfig.feedbackForwardingEmailAddressIdentityArn':
      'new-feedback-forwarding-email-address-identity-arn',
    'formConfig.configurationSetName': 'new-configuration-set-name',
  },
  errorFormData: {
    'formConfig.accessKeyId': '',
    'formConfig.accessKeySecret': '',
    'formConfig.region': '',
  },
};

const sendGrid: PasswordlessConnectorCase = {
  factoryId: 'sendgrid-email-service',
  isEmailConnector: true,
  name: 'SendGrid Email',
  initialFormData: {
    'formConfig.apiKey': 'api-key',
    'formConfig.fromEmail': 'foo@example.com',
    'formConfig.fromName': 'Logto',
  },
  updateFormData: {
    'formConfig.apiKey': 'new-api-key',
    'formConfig.fromEmail': 'new-foo@example.com',
    'formConfig.fromName': 'new-Logto',
  },
  errorFormData: {
    'formConfig.apiKey': '',
    'formConfig.fromEmail': '',
  },
};

const aliyunDirectMail: PasswordlessConnectorCase = {
  factoryId: 'aliyun-direct-mail',
  isEmailConnector: true,
  name: 'Aliyun Direct Mail',
  initialFormData: {
    'formConfig.accessKeyId': 'access-key-id',
    'formConfig.accessKeySecret': 'access-key-config',
    'formConfig.accountName': 'account-name',
    'formConfig.fromAlias': 'from-alias',
  },
  updateFormData: {
    'formConfig.accessKeyId': 'new-access-key-id',
    'formConfig.accessKeySecret': 'new-access-key-config',
    'formConfig.accountName': 'new-account-name',
    'formConfig.fromAlias': 'new-from-alias',
  },
  errorFormData: {
    'formConfig.accessKeyId': '',
    'formConfig.accessKeySecret': '',
    'formConfig.accountName': '',
  },
};

const mailgun: PasswordlessConnectorCase = {
  factoryId: 'mailgun-email',
  isEmailConnector: true,
  name: 'Mailgun',
  initialFormData: {
    'formConfig.endpoint': 'https://fake.mailgun.net',
    'formConfig.domain': 'mailgun-domain.com',
    'formConfig.apiKey': 'api-key',
    'formConfig.from': 'from',
  },
  updateFormData: {
    'formConfig.endpoint': 'https://new-fake.mailgun.net',
    'formConfig.domain': 'new-mailgun-domain.com',
    'formConfig.apiKey': 'new-api-key',
    'formConfig.from': 'new-from',
  },
  errorFormData: {
    'formConfig.domain': '',
    'formConfig.apiKey': '',
    'formConfig.from': '',
  },
};

const smpt: PasswordlessConnectorCase = {
  factoryId: 'simple-mail-transfer-protocol',
  isEmailConnector: true,
  name: 'SMTP',
  initialFormData: {
    'formConfig.host': 'host',
    'formConfig.port': '25',
    'formConfig.fromEmail': 'from',
  },
  updateFormData: {
    'formConfig.host': 'new-host',
    'formConfig.port': '26',
    'formConfig.fromEmail': 'new-from',
  },
  errorFormData: {
    'formConfig.host': '',
    'formConfig.port': '',
    'formConfig.fromEmail': '',
  },
};

const twilio: PasswordlessConnectorCase = {
  factoryId: 'twilio-short-message-service',
  isEmailConnector: false,
  name: 'Twilio SMS Service',
  initialFormData: {
    'formConfig.accountSID': 'account-sid',
    'formConfig.authToken': 'auth-token',
    'formConfig.fromMessagingServiceSID': 'from-messaging-service-sid',
  },
  updateFormData: {
    'formConfig.accountSID': 'new-account-sid',
    'formConfig.authToken': 'new-auth-token',
    'formConfig.fromMessagingServiceSID': 'new-from-messaging-service-sid',
  },
  errorFormData: {
    'formConfig.accountSID': '',
    'formConfig.authToken': '',
    'formConfig.fromMessagingServiceSID': '',
  },
};

const aliyunShortMessage: PasswordlessConnectorCase = {
  factoryId: 'aliyun-short-message-service',
  isEmailConnector: false,
  name: 'Aliyun Short Message Service',
  initialFormData: {
    'formConfig.accessKeyId': 'access-key-id',
    'formConfig.accessKeySecret': 'access-key-config',
    'formConfig.signName': 'sign-name',
  },
  updateFormData: {
    'formConfig.accessKeyId': 'new-access-key-id',
    'formConfig.accessKeySecret': 'new-access-key-config',
    'formConfig.signName': 'new-sign-name',
  },
  errorFormData: {
    'formConfig.accessKeyId': '',
    'formConfig.accessKeySecret': '',
    'formConfig.signName': '',
  },
};

// Tencent-short-message-service
const tencentShortMessage: PasswordlessConnectorCase = {
  factoryId: 'tencent-short-message-service',
  isEmailConnector: false,
  name: 'Tencent Short Message Service',
  initialFormData: {
    'formConfig.accessKeyId': 'access-key-id',
    'formConfig.accessKeySecret': 'access-key-config',
    'formConfig.signName': 'sign-name',
    'formConfig.sdkAppId': 'sdk-app-id',
    'formConfig.region': 'region',
  },
  updateFormData: {
    'formConfig.accessKeyId': 'new-access-key-id',
    'formConfig.accessKeySecret': 'new-access-key-config',
    'formConfig.signName': 'new-sign-name',
    'formConfig.sdkAppId': 'new-sdk-app-id',
    'formConfig.region': 'new-region',
  },
  errorFormData: {
    'formConfig.accessKeyId': '',
    'formConfig.accessKeySecret': '',
    'formConfig.signName': '',
    'formConfig.sdkAppId': '',
    'formConfig.region': '',
  },
};

// Smsaero-short-message-service
const smsaeroShortMessage: PasswordlessConnectorCase = {
  factoryId: 'smsaero-short-message-service',
  isEmailConnector: false,
  name: 'SMS Aero service',
  initialFormData: {
    'formConfig.email': 'fake@email.com',
    'formConfig.apiKey': 'api-key',
    'formConfig.senderName': 'sender-name',
  },
  updateFormData: {
    'formConfig.email': 'new-fake@email.com',
    'formConfig.apiKey': 'new-api-key',
    'formConfig.senderName': 'new-sender-name',
  },
  errorFormData: {
    'formConfig.email': '',
    'formConfig.apiKey': '',
    'formConfig.senderName': '',
  },
};

export const passwordlessConnectorTestCases = [
  // Email
  awsSesMail,
  sendGrid,
  aliyunDirectMail,
  mailgun,
  smpt,
  // SMS
  twilio,
  aliyunShortMessage,
  tencentShortMessage,
  smsaeroShortMessage,
];
