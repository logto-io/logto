import { ConnectorError, ConnectorErrorCodes, ValidateConfig } from '@logto/connector-types';
import { Connector, ConnectorType } from '@logto/schemas';

import { mockConnectorInstanceList, mockMetadata, mockConnector } from '@/__mocks__';
import { ConnectorMetadata } from '@/connectors/types';
import RequestError from '@/errors/RequestError';
import { updateConnector } from '@/queries/connector';
import assertThat from '@/utils/assert-that';
import { createRequester } from '@/utils/test-utils';

import connectorRoutes from './connector';

type ConnectorInstance = {
  connector: Connector;
  instance: {
    metadata: ConnectorMetadata;
    validateConfig?: ValidateConfig<unknown>;
    sendMessage?: unknown;
  };
};

const getConnectorInstancesPlaceHolder = jest.fn() as jest.MockedFunction<
  () => Promise<ConnectorInstance[]>
>;
const getConnectorInstanceByIdPlaceHolder = jest.fn(async (connectorId: string) => {
  const connectorInstances = await getConnectorInstancesPlaceHolder();
  const connectorInstance = connectorInstances.find(
    ({ connector }) => connector.id === connectorId
  );
  assertThat(
    connectorInstance,
    new RequestError({
      code: 'entity.not_found',
      connectorId,
      status: 404,
    })
  );

  const { instance, connector } = connectorInstance;

  return {
    connector,
    instance: {
      ...instance,
      validateConfig: validateConfigPlaceHolder,
      sendMessage: sendMessagePlaceHolder,
    },
  };
});
const validateConfigPlaceHolder = jest.fn() as jest.MockedFunction<ValidateConfig<unknown>>;
const sendMessagePlaceHolder = jest.fn();

jest.mock('@/queries/connector', () => ({
  updateConnector: jest.fn(),
}));
jest.mock('@/connectors', () => ({
  getConnectorInstances: async () => getConnectorInstancesPlaceHolder(),
  getConnectorInstanceById: async (connectorId: string) =>
    getConnectorInstanceByIdPlaceHolder(connectorId),
}));

describe('connector PATCH routes', () => {
  const connectorRequest = createRequester({ authedRoutes: connectorRoutes });

  describe('PATCH /connectors/:id/enabled', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('throws if connector can not be found (locally)', async () => {
      getConnectorInstancesPlaceHolder.mockResolvedValueOnce(mockConnectorInstanceList.slice(1));
      const response = await connectorRequest
        .patch('/connectors/findConnector/enabled')
        .send({ enabled: true });
      expect(response).toHaveProperty('statusCode', 404);
    });

    it('throws if connector can not be found (remotely)', async () => {
      getConnectorInstancesPlaceHolder.mockResolvedValueOnce([]);
      const response = await connectorRequest
        .patch('/connectors/id0/enabled')
        .send({ enabled: true });
      expect(response).toHaveProperty('statusCode', 404);
    });

    it('enables one of the social connectors (with valid config)', async () => {
      getConnectorInstancesPlaceHolder.mockResolvedValueOnce([
        {
          connector: mockConnector,
          instance: { metadata: { ...mockMetadata, type: ConnectorType.Social } },
        },
      ]);
      const response = await connectorRequest
        .patch('/connectors/id/enabled')
        .send({ enabled: true });
      expect(updateConnector).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'id' },
          set: { enabled: true },
          jsonbMode: 'merge',
        })
      );
      expect(response.body).toMatchObject({
        metadata: { ...mockMetadata, type: ConnectorType.Social },
      });
      expect(response).toHaveProperty('statusCode', 200);
    });

    it('enables one of the social connectors (with invalid config)', async () => {
      validateConfigPlaceHolder.mockImplementationOnce(() => {
        throw new ConnectorError(ConnectorErrorCodes.InvalidConfig);
      });
      getConnectorInstancesPlaceHolder.mockResolvedValueOnce([
        {
          connector: mockConnector,
          instance: { metadata: mockMetadata },
        },
      ]);
      const response = await connectorRequest
        .patch('/connectors/id/enabled')
        .send({ enabled: true });
      expect(response).toHaveProperty('statusCode', 500);
    });

    it('disables one of the social connectors', async () => {
      getConnectorInstancesPlaceHolder.mockResolvedValueOnce([
        {
          connector: mockConnector,
          instance: { metadata: mockMetadata },
        },
      ]);
      const response = await connectorRequest
        .patch('/connectors/id/enabled')
        .send({ enabled: false });
      expect(updateConnector).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'id' },
          set: { enabled: false },
          jsonbMode: 'merge',
        })
      );
      expect(response.body).toMatchObject({
        metadata: mockMetadata,
      });
      expect(response).toHaveProperty('statusCode', 200);
    });

    it('enables one of the email/sms connectors (with valid config)', async () => {
      getConnectorInstancesPlaceHolder.mockResolvedValueOnce(mockConnectorInstanceList);
      const mockedMetadata = {
        ...mockMetadata,
        id: 'id1',
        type: ConnectorType.SMS,
      };
      const mockedConnector = {
        ...mockConnector,
        id: 'id1',
      };
      getConnectorInstanceByIdPlaceHolder.mockResolvedValueOnce({
        connector: mockedConnector,
        instance: { metadata: mockedMetadata, validateConfig: jest.fn(), sendMessage: jest.fn() },
      });
      const response = await connectorRequest
        .patch('/connectors/id1/enabled')
        .send({ enabled: true });
      expect(response).toHaveProperty('statusCode', 200);
      expect(updateConnector).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          where: { id: 'id1' },
          set: { enabled: false },
          jsonbMode: 'merge',
        })
      );
      expect(updateConnector).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          where: { id: 'id5' },
          set: { enabled: false },
          jsonbMode: 'merge',
        })
      );
      expect(updateConnector).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({
          where: { id: 'id1' },
          set: { enabled: true },
          jsonbMode: 'merge',
        })
      );
      expect(response.body).toMatchObject({
        metadata: mockedMetadata,
      });
    });

    it('enables one of the email/sms connectors (with invalid config)', async () => {
      validateConfigPlaceHolder.mockImplementationOnce(() => {
        throw new ConnectorError(ConnectorErrorCodes.InvalidConfig);
      });
      getConnectorInstancesPlaceHolder.mockResolvedValueOnce([
        {
          connector: mockConnector,
          instance: {
            metadata: {
              ...mockMetadata,
              type: ConnectorType.SMS,
            },
          },
        },
      ]);
      const response = await connectorRequest
        .patch('/connectors/id/enabled')
        .send({ enabled: true });
      expect(response).toHaveProperty('statusCode', 500);
    });

    it('disables one of the email/sms connectors', async () => {
      getConnectorInstancesPlaceHolder.mockResolvedValueOnce([
        {
          connector: mockConnector,
          instance: { metadata: mockMetadata },
        },
      ]);
      const response = await connectorRequest
        .patch('/connectors/id/enabled')
        .send({ enabled: false });
      expect(updateConnector).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'id' },
          set: { enabled: false },
          jsonbMode: 'merge',
        })
      );
      expect(response.body).toMatchObject({
        metadata: mockMetadata,
      });
      expect(response).toHaveProperty('statusCode', 200);
    });
  });

  describe('PATCH /connectors/:id', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('throws when connector can not be found by given connectorId (locally)', async () => {
      getConnectorInstancesPlaceHolder.mockResolvedValueOnce(mockConnectorInstanceList.slice(0, 1));
      const response = await connectorRequest.patch('/connectors/findConnector').send({});
      expect(response).toHaveProperty('statusCode', 404);
    });

    it('throws when connector can not be found by given connectorId (remotely)', async () => {
      getConnectorInstancesPlaceHolder.mockResolvedValueOnce([]);
      const response = await connectorRequest.patch('/connectors/id0').send({});
      expect(response).toHaveProperty('statusCode', 404);
    });

    it('config validation fails', async () => {
      validateConfigPlaceHolder.mockImplementationOnce(() => {
        throw new ConnectorError(ConnectorErrorCodes.InvalidConfig);
      });
      getConnectorInstancesPlaceHolder.mockResolvedValueOnce([
        {
          connector: mockConnector,
          instance: { metadata: mockMetadata },
        },
      ]);
      const response = await connectorRequest
        .patch('/connectors/id')
        .send({ config: { cliend_id: 'client_id', client_secret: 'client_secret' } });
      expect(response).toHaveProperty('statusCode', 500);
    });

    it('successfully updates connector configs', async () => {
      getConnectorInstancesPlaceHolder.mockResolvedValueOnce([
        {
          connector: mockConnector,
          instance: { metadata: mockMetadata },
        },
      ]);
      const response = await connectorRequest
        .patch('/connectors/id')
        .send({ config: { cliend_id: 'client_id', client_secret: 'client_secret' } });
      expect(updateConnector).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'id' },
          set: { config: { cliend_id: 'client_id', client_secret: 'client_secret' } },
          jsonbMode: 'replace',
        })
      );
      expect(response.body).toMatchObject({
        metadata: mockMetadata,
      });
      expect(response).toHaveProperty('statusCode', 200);
    });
  });
});
