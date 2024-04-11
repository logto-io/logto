import { HTTPError } from 'ky';

import {
  mockEmailConnectorConfig,
  mockEmailConnectorId,
  mockSmsConnectorConfig,
  mockSmsConnectorId,
  mockSocialConnectorConfig,
  mockSocialConnectorNewConfig,
  mockSocialConnectorId,
  mockAlternativeEmailConnectorConfig,
  mockAlternativeEmailConnectorId,
} from '#src/__mocks__/connectors-mock.js';
import {
  deleteConnectorById,
  getConnector,
  listConnectors,
  postConnector,
  sendEmailTestMessage,
  sendSmsTestMessage,
  updateConnectorConfig,
  listConnectorFactories,
  getConnectorFactory,
} from '#src/api/connector.js';
import { expectRejects } from '#src/helpers/index.js';

const connectorIdMap = new Map<string, string>();

const mockConnectorSetups = [
  { connectorId: mockSmsConnectorId, config: mockSmsConnectorConfig },
  { connectorId: mockEmailConnectorId, config: mockEmailConnectorConfig },
  { connectorId: mockSocialConnectorId, config: mockSocialConnectorConfig },
];

const cleanUpConnectorTable = async () => {
  const connectors = await listConnectors();
  await Promise.all(
    connectors.map(async ({ id }) => {
      await deleteConnectorById(id);
    })
  );
  connectorIdMap.clear();
};

/*
 * We'd better only use mock connectors in integration tests.
 * Since we will refactor connectors soon, keep using some real connectors
 * for testing updating configs and enabling/disabling for now.
 */
test('connector set-up flow', async () => {
  /**
   * Check whether mock connector factories are properly installed using
   * both connector factory APIs:
   * 1. GET /connector-factories (listConnectorFactories()).
   * 2. GET /connector-factories/:connectorId (getConnectorFactory()).
   */
  const connectorFactories = await listConnectorFactories();
  await Promise.all(
    mockConnectorSetups.map(async ({ connectorId }) => {
      expect(connectorFactories.find(({ id }) => id === connectorId)).toBeDefined();

      const connectorFactory = await getConnectorFactory(connectorId);
      expect(connectorFactory).toBeDefined();
    })
  );

  await cleanUpConnectorTable();

  /*
   * Set up social/SMS/email connectors
   */
  await Promise.all(
    mockConnectorSetups.map(async ({ connectorId, config }) => {
      const { id } = await postConnector({ connectorId, config });
      connectorIdMap.set(connectorId, id);

      // The result of getting a connector should be same as the result of updating a connector above.
      const connector = await getConnector(id);
      expect(connector.config).toEqual(config);
    })
  );

  /*
   * It should update the connector config successfully when it is valid; otherwise, it should fail.
   * We will test updating to the invalid connector config, that is the case not covered above.
   */
  await expect(
    updateConnectorConfig(connectorIdMap.get(mockSocialConnectorId)!, mockSmsConnectorConfig)
  ).rejects.toThrow(HTTPError);
  // To confirm the failed updating request above did not modify the original config,
  // we check: the mock connector config should stay the same.
  const mockSocialConnector = await getConnector(connectorIdMap.get(mockSocialConnectorId)!);
  expect(mockSocialConnector.config).toEqual(mockSocialConnectorConfig);
  const { config: updatedConfig } = await updateConnectorConfig(
    connectorIdMap.get(mockSocialConnectorId)!,
    mockSocialConnectorNewConfig
  );
  expect(updatedConfig).toEqual(mockSocialConnectorNewConfig);

  /*
   * Change to another SMS/Email connector
   */
  const { id } = await postConnector({
    connectorId: mockAlternativeEmailConnectorId,
    config: mockAlternativeEmailConnectorConfig,
  });
  connectorIdMap.set(mockAlternativeEmailConnectorId, id);
  const currentConnectors = await listConnectors();
  // Only one SMS/email connector should be added at a time, hence previous SMS/email connector will be deleted automatically.
  expect(
    currentConnectors.some((connector) => connector.connectorId === mockEmailConnectorId)
  ).toBeFalsy();
  connectorIdMap.delete(mockEmailConnectorId);
  expect(
    currentConnectors.find((connector) => connector.connectorId === mockAlternativeEmailConnectorId)
      ?.config
  ).toEqual(mockAlternativeEmailConnectorConfig);
  // Can reset the connector config to empty object `{}` (when it is valid).
  await expect(updateConnectorConfig(id, { config: {} })).resolves.not.toThrow();
  const alternativeEmailConnector = await getConnector(id);
  expect(alternativeEmailConnector.config).toEqual({});

  /*
   * Delete (i.e. disable) a connector
   */
  await expect(
    deleteConnectorById(connectorIdMap.get(mockAlternativeEmailConnectorId)!)
  ).resolves.not.toThrow();
  await expect(getConnector(connectorIdMap.get(mockAlternativeEmailConnectorId)!)).rejects.toThrow(
    HTTPError
  );
  connectorIdMap.delete(mockAlternativeEmailConnectorId);

  /**
   * List connectors after manually setting up connectors.
   * The result of listing connectors should be same as the result of updating connectors above.
   */
  const allConnectorsAfterSetup = await listConnectors();
  expect(
    allConnectorsAfterSetup.find(({ id }) => id === connectorIdMap.get(mockSmsConnectorId))
  ).toEqual(
    expect.objectContaining({
      id: connectorIdMap.get(mockSmsConnectorId),
      connectorId: mockSmsConnectorId,
      config: mockSmsConnectorConfig,
    })
  );
  expect(
    allConnectorsAfterSetup.find(({ id }) => id === connectorIdMap.get(mockSocialConnectorId))
  ).toEqual(
    expect.objectContaining({
      id: connectorIdMap.get(mockSocialConnectorId),
      connectorId: mockSocialConnectorId,
      config: mockSocialConnectorNewConfig,
    })
  );
});

test('create connector with non-exist connectorId', async () => {
  await cleanUpConnectorTable();
  await expectRejects(postConnector({ connectorId: 'non-exist-id' }), {
    code: 'connector.not_found_with_connector_id',
    status: 422,
  });
});

test('create non standard social connector with target', async () => {
  await cleanUpConnectorTable();
  await expectRejects(
    postConnector({ connectorId: mockSocialConnectorId, metadata: { target: 'target' } }),
    {
      code: 'connector.cannot_overwrite_metadata_for_non_standard_connector',
      status: 400,
    }
  );
});

test('create duplicated social connector', async () => {
  await cleanUpConnectorTable();
  await postConnector({ connectorId: mockSocialConnectorId });
  await expectRejects(postConnector({ connectorId: mockSocialConnectorId }), {
    code: 'connector.multiple_instances_not_supported',
    status: 422,
  });
});

test('override metadata for non-standard social connector', async () => {
  await cleanUpConnectorTable();
  const { id } = await postConnector({ connectorId: mockSocialConnectorId });
  await expectRejects(updateConnectorConfig(id, {}, { target: 'target' }), {
    code: 'connector.cannot_overwrite_metadata_for_non_standard_connector',
    status: 400,
  });
});

test('send SMS/email test message', async () => {
  await cleanUpConnectorTable();

  const generatePhone = '8612345678901';
  const generateEmail = 'test@example.com';

  // Can send test message without enabling passwordless connectors (test whether `config` works).
  await expect(
    sendSmsTestMessage(mockSmsConnectorId, generatePhone, mockSmsConnectorConfig)
  ).resolves.not.toThrow();
  await expect(
    sendEmailTestMessage(mockEmailConnectorId, generateEmail, mockEmailConnectorConfig)
  ).resolves.not.toThrow();

  // Set up passwordless connectors.
  await Promise.all(
    [{ connectorId: mockSmsConnectorId }, { connectorId: mockEmailConnectorId }].map(
      async ({ connectorId }) => {
        const { id } = await postConnector({ connectorId });
        connectorIdMap.set(connectorId, id);
      }
    )
  );

  await expect(
    sendSmsTestMessage(mockSmsConnectorId, generatePhone, mockSmsConnectorConfig)
  ).resolves.not.toThrow();
  await expect(
    sendEmailTestMessage(mockEmailConnectorId, generateEmail, mockEmailConnectorConfig)
  ).resolves.not.toThrow();
  // Throws due to invalid `config`s.
  await expect(sendSmsTestMessage(mockSmsConnectorId, generatePhone, {})).rejects.toThrow(
    HTTPError
  );
  await expect(sendEmailTestMessage(mockEmailConnectorId, generateEmail, {})).rejects.toThrow(
    HTTPError
  );

  for (const [_connectorId, id] of connectorIdMap.entries()) {
    // eslint-disable-next-line no-await-in-loop
    await deleteConnectorById(id);
  }
});
