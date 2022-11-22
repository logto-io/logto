import { ConnectorType } from '@logto/schemas';
import { HTTPError } from 'got';

import {
  mockEmailConnectorConfig,
  mockEmailConnectorId,
  mockSmsConnectorConfig,
  mockSmsConnectorId,
  mockSocialConnectorConfig,
  mockSocialConnectorId,
} from '@/__mocks__/connectors-mock';
import {
  disableConnector,
  enableConnector,
  getConnector,
  listConnectors,
  postConnector,
  sendEmailTestMessage,
  sendSmsTestMessage,
  updateConnectorConfig,
} from '@/api/connector';

/*
 * We'd better only use mock connectors in integration tests.
 * Since we will refactor connectors soon, keep using some real connectors
 * for testing updating configs and enabling/disabling for now.
 */
test('connector set-up flow', async () => {
  /*
   * Set up social/SMS/email connectors
   */
  await Promise.all(
    [
      { id: mockSmsConnectorId, config: mockSmsConnectorConfig },
      { id: mockEmailConnectorId, config: mockEmailConnectorConfig },
      { id: mockSocialConnectorId, config: mockSocialConnectorConfig },
    ].map(async ({ id, config }) => {
      const updatedConnector = await updateConnectorConfig(id, config);
      expect(updatedConnector.config).toEqual(config);
      const enabledConnector = await enableConnector(id);
      expect(enabledConnector.enabled).toBeTruthy();

      // The result of getting a connector should be same as the result of updating a connector above.
      const connector = await getConnector(id);
      expect(connector.enabled).toBeTruthy();
      expect(connector.config).toEqual(config);
    })
  );

  /*
   * It should update the connector config successfully when it is valid; otherwise, it should fail.
   * We will test updating to the invalid connector config, that is the case not covered above.
   */
  await expect(
    updateConnectorConfig(mockSocialConnectorId, mockSmsConnectorConfig)
  ).rejects.toThrow(HTTPError);
  // To confirm the failed updating request above did not modify the original config,
  // we check: the mock connector config should stay the same.
  const mockSocialConnector = await getConnector(mockSocialConnectorId);
  expect(mockSocialConnector.config).toEqual(mockSocialConnectorConfig);

  /*
   * Change to another SMS/Email connector
   */
  await Promise.all(
    [
      { id: mockSmsConnectorId, config: mockSmsConnectorConfig, type: ConnectorType.Sms },
      { id: mockEmailConnectorId, config: mockEmailConnectorConfig, type: ConnectorType.Email },
    ].map(async ({ id, config, type }) => {
      // FIXME @Darcy: fix use of `id` and `connectorId`
      try {
        await getConnector(id);
      } catch {
        await postConnector(id);
      }
      const updatedConnector = await updateConnectorConfig(id, config);
      expect(updatedConnector.config).toEqual(config);
      const enabledConnector = await enableConnector(id);
      expect(enabledConnector.enabled).toBeTruthy();

      // There should be exactly one enabled SMS/email connector after changing to another SMS/email connector.
      const connectorsAfterChanging = await listConnectors();
      const enabledConnectors = connectorsAfterChanging.filter(
        (connector) => connector.type === type && connector.enabled
      );
      expect(enabledConnectors.length).toEqual(1);
      expect(enabledConnectors[0]?.id).toEqual(id);
    })
  );

  /*
   * Delete (i.e. disable) a connector
   *
   * We have not provided the API to delete a connector for now.
   * Deleting a connector using Admin Console means disabling a connector using Management API.
   */
  const disabledMockEmailConnector = await disableConnector(mockEmailConnectorId);
  expect(disabledMockEmailConnector.enabled).toBeFalsy();
  const mockEmailConnector = await getConnector(mockEmailConnectorId);
  expect(mockEmailConnector.enabled).toBeFalsy();

  /**
   * List connectors after manually setting up connectors.
   * The result of listing connectors should be same as the result of updating connectors above.
   */
  expect(await listConnectors()).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: mockEmailConnectorId,
        config: mockEmailConnectorConfig,
        enabled: false,
      }),
      expect.objectContaining({
        id: mockSmsConnectorId,
        config: mockSmsConnectorConfig,
        enabled: true,
      }),
      expect.objectContaining({
        id: mockSocialConnectorId,
        config: mockSocialConnectorConfig,
        enabled: true,
      }),
    ])
  );
});

describe('send SMS/email test message', () => {
  const phone = '8612345678901';
  const email = 'test@example.com';

  it('should send the test message successfully when the config is valid', async () => {
    await expect(
      sendSmsTestMessage(mockSmsConnectorId, phone, mockSmsConnectorConfig)
    ).resolves.not.toThrow();
    await expect(
      sendEmailTestMessage(mockEmailConnectorId, email, mockEmailConnectorConfig)
    ).resolves.not.toThrow();
  });

  it('should fail to send the test message when the config is invalid', async () => {
    await expect(sendSmsTestMessage(mockSmsConnectorId, phone, {})).rejects.toThrow(HTTPError);
    await expect(sendEmailTestMessage(mockEmailConnectorId, email, {})).rejects.toThrow(HTTPError);
  });
});
