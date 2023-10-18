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
  // SMS
  twilio,
  smsaeroShortMessage,
];
