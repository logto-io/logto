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

test('connector flow', async () => {
  // List connectors after initializing a new Logto instance
  const allConnectors = await listConnectors();

  // There should be no connectors, or all connectors should be disabled.
  for (const connectorDto of allConnectors) {
    expect(connectorDto.enabled).toBeFalsy();
  }

  // Set up a social connector
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

  // Next up:
  // - set up an SMS connector and then change to another SMS connector
  // - set up an email connector and then change to another email connector
  // - validate wrong connector config
  // - send sms/email test message
  // - list all connectors after manually setting up connectors
});
