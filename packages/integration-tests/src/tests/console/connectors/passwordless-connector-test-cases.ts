export type PasswordlessConnectorCase = {
  factoryId: string;
  isEmailConnector: boolean;
  name: string;
  skipConnectionTest?: boolean; // Only for mock connectors
  initialFormData?: Record<string, string>;
  updateFormData?: Record<string, string>;
  errorFormData?: Record<string, string>;
};

const awsSesMail: PasswordlessConnectorCase = {
  factoryId: 'aws-ses-mail',
  isEmailConnector: true,
  name: 'AWS Direct Mail',
  // Skip connection test for real-world connectors since it will send request to the 3rd party service
  skipConnectionTest: true,
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

const mockMailConnector: PasswordlessConnectorCase = {
  factoryId: 'mock-email-service',
  isEmailConnector: true,
  name: 'Mock Mail Service',
};

const twilio: PasswordlessConnectorCase = {
  factoryId: 'twilio-short-message-service',
  isEmailConnector: false,
  name: 'Twilio SMS Service',
  // Skip connection test for real-world connectors since it will send request to the 3rd party service
  skipConnectionTest: true,
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

const mockSmsConnector: PasswordlessConnectorCase = {
  factoryId: 'mock-short-message-service',
  isEmailConnector: false,
  name: 'Mock SMS Service',
};

export const passwordlessConnectorTestCases = [
  // Email
  awsSesMail,
  mockMailConnector,
  // SMS
  twilio,
  mockSmsConnector,
];
