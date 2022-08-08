import { GetConnectorConfig, ValidateConfig } from '@logto/connector-types';
import { Connector, ConnectorType } from '@logto/schemas';

import { mockConnectorInstanceList, mockMetadata, mockConnector } from '@/__mocks__';
import { ConnectorMetadata } from '@/connectors/types';
import RequestError from '@/errors/RequestError';
import assertThat from '@/utils/assert-that';
import { createRequester } from '@/utils/test-utils';

import connectorRoutes from './connector';

type ConnectorInstance = {
  connector: Connector;
  instance: {
    metadata: ConnectorMetadata;
    validateConfig?: ValidateConfig<unknown>;
    getConfig?: GetConnectorConfig;
    sendMessage?: unknown;
    sendTestMessage?: unknown;
  };
};

const getConnectorInstancesPlaceHolder = jest.fn() as jest.MockedFunction<
  () => Promise<ConnectorInstance[]>
>;

jest.mock('@/connectors', () => ({
  getConnectorInstances: async () => getConnectorInstancesPlaceHolder(),
  getConnectorInstanceById: async (connectorId: string) => {
    const connectorInstances = await getConnectorInstancesPlaceHolder();
    const connector = connectorInstances.find(({ connector }) => connector.id === connectorId);
    assertThat(
      connector,
      new RequestError({
        code: 'entity.not_found',
        connectorId,
        status: 404,
      })
    );

    return connector;
  },
}));

describe('connector route', () => {
  const connectorRequest = createRequester({ authedRoutes: connectorRoutes });

  describe('GET /connectors', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('throws if more than one email connector is enabled', async () => {
      getConnectorInstancesPlaceHolder.mockResolvedValueOnce(mockConnectorInstanceList);
      const response = await connectorRequest.get('/connectors').send({});
      expect(response).toHaveProperty('statusCode', 400);
    });

    it('throws if more than one SMS connector is enabled', async () => {
      getConnectorInstancesPlaceHolder.mockResolvedValueOnce(
        mockConnectorInstanceList.filter(
          (connectorInstance) => connectorInstance.instance.metadata.type !== ConnectorType.Email
        )
      );
      const response = await connectorRequest.get('/connectors').send({});
      expect(response).toHaveProperty('statusCode', 400);
    });

    it('shows all connectors', async () => {
      getConnectorInstancesPlaceHolder.mockResolvedValueOnce(
        mockConnectorInstanceList.filter(
          (connectorInstance) => connectorInstance.instance.metadata.type === ConnectorType.Social
        )
      );
      const response = await connectorRequest.get('/connectors').send({});
      expect(response).toHaveProperty('statusCode', 200);
    });
  });

  describe('GET /connectors/:id', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('throws when connector can not be found by given connectorId (locally)', async () => {
      getConnectorInstancesPlaceHolder.mockResolvedValueOnce(mockConnectorInstanceList.slice(2));
      const response = await connectorRequest.get('/connectors/findConnector').send({});
      expect(response).toHaveProperty('statusCode', 404);
    });

    it('throws when connector can not be found by given connectorId (remotely)', async () => {
      getConnectorInstancesPlaceHolder.mockResolvedValueOnce([]);
      const response = await connectorRequest.get('/connectors/id0').send({});
      expect(response).toHaveProperty('statusCode', 404);
    });

    it('shows found connector information', async () => {
      getConnectorInstancesPlaceHolder.mockResolvedValueOnce(mockConnectorInstanceList);
      const response = await connectorRequest.get('/connectors/id0').send({});
      expect(response).toHaveProperty('statusCode', 200);
    });
  });

  describe('POST /connectors/:id/test', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should get SMS connector and send test message', async () => {
      const mockSendTestMessage = jest.fn();
      const mockedMetadata = {
        ...mockMetadata,
        type: ConnectorType.SMS,
      };
      const mockedSmsConnectorInstance: ConnectorInstance = {
        connector: mockConnector,
        instance: {
          metadata: mockedMetadata,
          validateConfig: jest.fn(),
          getConfig: jest.fn(),
          sendMessage: jest.fn(),
          sendTestMessage: mockSendTestMessage,
        },
      };
      getConnectorInstancesPlaceHolder.mockResolvedValueOnce([mockedSmsConnectorInstance]);
      const response = await connectorRequest
        .post('/connectors/id/test')
        .send({ phone: '12345678901', config: { test: 123 } });
      expect(mockSendTestMessage).toHaveBeenCalledTimes(1);
      expect(mockSendTestMessage).toHaveBeenCalledWith({ test: 123 }, '12345678901', 'Test', {
        code: '123456',
      });
      expect(response).toHaveProperty('statusCode', 204);
    });

    it('should get email connector and send test message', async () => {
      const sendTestMessage = jest.fn();
      const mockedEmailConnector: ConnectorInstance = {
        connector: mockConnector,
        instance: {
          metadata: mockMetadata,
          validateConfig: jest.fn(),
          getConfig: jest.fn(),
          sendMessage: jest.fn(),
          sendTestMessage,
        },
      };
      getConnectorInstancesPlaceHolder.mockResolvedValueOnce([mockedEmailConnector]);
      const response = await connectorRequest
        .post('/connectors/id/test')
        .send({ email: 'test@email.com', config: { test: 123 } });
      expect(sendTestMessage).toHaveBeenCalledTimes(1);
      expect(sendTestMessage).toHaveBeenCalledWith({ test: 123 }, 'test@email.com', 'Test', {
        code: 'email-test',
      });
      expect(response).toHaveProperty('statusCode', 204);
    });

    it('should throw when neither phone nor email is provided', async () => {
      const response = await connectorRequest.post('/connectors/id/test').send({});
      expect(response).toHaveProperty('statusCode', 400);
    });

    it('should throw when sms connector is not found', async () => {
      getConnectorInstancesPlaceHolder.mockResolvedValueOnce([]);
      const response = await connectorRequest
        .post('/connectors/id/test')
        .send({ phone: '12345678901' });
      expect(response).toHaveProperty('statusCode', 400);
    });

    it('should throw when email connector is not found', async () => {
      getConnectorInstancesPlaceHolder.mockResolvedValueOnce([]);
      const response = await connectorRequest
        .post('/connectors/id/test')
        .send({ email: 'test@email.com' });
      expect(response).toHaveProperty('statusCode', 400);
    });
  });
});
