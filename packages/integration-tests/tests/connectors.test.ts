import { ConnectorType } from '@logto/schemas';

import {
  enableConnector,
  getConnector,
  listConnectors,
  updateConnectorConfig,
} from '@/connector-api';

const facebookConnectorId = 'facebook-universal';
const facebookConnectorConfig = {
  clientId: 'application_foo',
  clientSecret: 'secret_bar',
};

const aliyunSmsConnectorId = 'aliyun-short-message-service';
const aliyunSmsConnectorConfig = {
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
  accessKeyId: 'access-key-id-value',
  accessKeySecret: 'access-key-secret-value',
};

const twilioSmsConnectorId = 'twilio-short-message-service';
const twilioSmsConnectorConfig = {
  authToken: 'auth-token-value',
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
  accountSID: 'account-sid-value',
  fromMessagingServiceSID: 'from-messaging-service-sid-value',
};

test('connector flow', async () => {
  /*
   * List connectors after initializing a new Logto instance
   */
  const allConnectors = await listConnectors();

  // There should be no connectors, or all connectors should be disabled.
  for (const connectorDto of allConnectors) {
    expect(connectorDto.enabled).toBeFalsy();
  }

  /*
   * Set up a social connector
   */
  const updatedFacebookConnector = await updateConnectorConfig(
    facebookConnectorId,
    facebookConnectorConfig
  );
  expect(updatedFacebookConnector.config).toEqual(facebookConnectorConfig);
  const enabledFacebookConnector = await enableConnector(facebookConnectorId);
  expect(enabledFacebookConnector.enabled).toBeTruthy();

  // The result of getting a connector should be same as the result of updating a connector above.
  const facebookConnector = await getConnector(facebookConnectorId);
  expect(facebookConnector.enabled).toBeTruthy();
  expect(facebookConnector.config).toEqual(facebookConnectorConfig);

  /*
   * Set up an SMS connector
   */
  const updatedAliyunSmsConnector = await updateConnectorConfig(
    aliyunSmsConnectorId,
    aliyunSmsConnectorConfig
  );
  expect(updatedAliyunSmsConnector.config).toEqual(aliyunSmsConnectorConfig);
  const enabledAliyunSmsConnector = await enableConnector(aliyunSmsConnectorId);
  expect(enabledAliyunSmsConnector.enabled).toBeTruthy();

  /*
   * Change to another SMS connector
   */
  const updatedTwilioSmsConnector = await updateConnectorConfig(
    twilioSmsConnectorId,
    twilioSmsConnectorConfig
  );
  expect(updatedTwilioSmsConnector.config).toEqual(twilioSmsConnectorConfig);
  const enabledTwilioSmsConnector = await enableConnector(twilioSmsConnectorId);
  expect(enabledTwilioSmsConnector.enabled).toBeTruthy();

  // There should be exactly one enabled SMS connector after changing to another SMS connector.
  const connectorsAfterChangingSmsConnector = await listConnectors();
  const enabledSmsConnectors = connectorsAfterChangingSmsConnector.filter(
    (connector) => connector.type === ConnectorType.SMS && connector.enabled
  );
  expect(enabledSmsConnectors.length).toEqual(1);
  expect(enabledSmsConnectors[0]?.id).toEqual(twilioSmsConnectorId);

  // Next up:
  // - set up an email connector and then change to another email connector
  // - validate wrong connector config
  // - send sms/email test message
  // - list all connectors after manually setting up connectors
});
