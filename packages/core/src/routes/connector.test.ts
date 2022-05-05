/* eslint-disable max-lines, max-nested-callbacks */
import {
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorPlatform,
  EmailMessageTypes,
  ValidateConfig,
} from '@logto/connector-types';
import { Connector, ConnectorType } from '@logto/schemas';

import { mockConnectorInstanceList, mockConnectorList } from '@/__mocks__';
import {
  ConnectorMetadata,
  EmailConnectorInstance,
  SmsConnectorInstance,
} from '@/connectors/types';
import RequestError from '@/errors/RequestError';
import { updateConnector } from '@/queries/connector';
import assertThat from '@/utils/assert-that';
import { createRequester } from '@/utils/test-utils';

import connectorRoutes from './connector';

const mockMetadata: ConnectorMetadata = {
  id: 'connector_0',
  type: ConnectorType.Social,
  platform: ConnectorPlatform.NA,
  name: {},
  logo: './logo.png',
  description: {},
  readme: 'README.md',
  configTemplate: 'config-template.md',
};
const mockConnector: Connector = {
  id: 'connector_0',
  name: 'connector_0',
  platform: ConnectorPlatform.NA,
  type: ConnectorType.Social,
  enabled: true,
  metadata: mockMetadata,
  config: {},
  createdAt: 1_234_567_890_123,
};

type ConnectorInstance = {
  connector: Connector;
  metadata: ConnectorMetadata;
  validateConfig?: ValidateConfig;
};

const findConnectorByIdPlaceHolder = jest.fn() as jest.MockedFunction<
  (connectorId: string) => Promise<Connector>
>;
const getConnectorInstanceByIdPlaceHolder = jest.fn() as jest.MockedFunction<
  (connectorId: string) => Promise<ConnectorInstance>
>;
const getConnectorInstanceByTypePlaceHolder = jest.fn() as jest.MockedFunction<
  (type: ConnectorType) => Promise<ConnectorInstance>
>;
const getConnectorInstancesPlaceHolder = jest.fn() as jest.MockedFunction<
  () => Promise<ConnectorInstance[]>
>;

jest.mock('@/queries/connector', () => ({
  findConnectorById: async (connectorId: string) => findConnectorByIdPlaceHolder(connectorId),
  findAllConnectors: jest.fn(),
  updateConnector: jest.fn(),
}));
jest.mock('@/connectors', () => ({
  getConnectorInstanceById: async (connectorId: string) =>
    getConnectorInstanceByIdPlaceHolder(connectorId),
  getConnectorInstanceByType: async (type: ConnectorType) =>
    getConnectorInstanceByTypePlaceHolder(type),
  getConnectorInstances: async () => getConnectorInstancesPlaceHolder(),
}));

describe('connector route', () => {
  const connectorRequest = createRequester({ authedRoutes: connectorRoutes });

  describe('GET /connectors', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('throws if more than one email connector is enabled', async () => {
      getConnectorInstancesPlaceHolder.mockResolvedValue(mockConnectorInstanceList);
      const response = await connectorRequest.get('/connectors').send({});
      expect(response).toHaveProperty('statusCode', 400);
    });

    it('throws if more than one SMS connector is enabled', async () => {
      getConnectorInstancesPlaceHolder.mockResolvedValue(
        mockConnectorInstanceList.filter(
          (connectorInstance) => connectorInstance.metadata.type !== ConnectorType.Email
        )
      );
      const response = await connectorRequest.get('/connectors').send({});
      expect(response).toHaveProperty('statusCode', 400);
    });

    it('shows all connectors', async () => {
      getConnectorInstancesPlaceHolder.mockResolvedValue(
        mockConnectorInstanceList.filter(
          (connectorInstance) => connectorInstance.metadata.type === ConnectorType.Social
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
      getConnectorInstanceByIdPlaceHolder.mockImplementationOnce(async (_id: string) => {
        const found = mockConnectorInstanceList.find(
          (connectorInstance) => connectorInstance.metadata.id === 'connector'
        );
        assertThat(found, new RequestError({ code: 'entity.not_found', status: 404 }));

        return found;
      });
      const response = await connectorRequest.get('/connectors/findConnector').send({});
      expect(response).toHaveProperty('statusCode', 404);
    });

    it('throws when connector can not be found by given connectorId (remotely)', async () => {
      getConnectorInstanceByIdPlaceHolder.mockImplementationOnce(async (id: string) => {
        const foundConnectorInstance = mockConnectorInstanceList.find(
          (connectorInstance) => connectorInstance.metadata.id === id
        );
        assertThat(
          foundConnectorInstance,
          new RequestError({ code: 'entity.not_found', status: 404 })
        );

        const foundConnector = mockConnectorList.find((connector) => connector.id === 'connector0');
        assertThat(foundConnector, 'entity.not_found');

        return { foundConnector, ...foundConnectorInstance };
      });
      const response = await connectorRequest.get('/connectors/connector_0').send({});
      expect(response).toHaveProperty('statusCode', 400);
    });

    it('shows found connector information', async () => {
      getConnectorInstanceByIdPlaceHolder.mockImplementationOnce(async (id: string) => {
        const foundConnectorInstance = mockConnectorInstanceList.find(
          (connectorInstance) => connectorInstance.metadata.id === id
        );
        assertThat(
          foundConnectorInstance,
          new RequestError({ code: 'entity.not_found', status: 404 })
        );

        const foundConnector = mockConnectorList.find((connector) => connector.id === id);
        assertThat(foundConnector, 'entity.not_found');

        return { foundConnector, ...foundConnectorInstance };
      });
      const response = await connectorRequest.get('/connectors/connector_0').send({});
      expect(response).toHaveProperty('statusCode', 200);
    });
  });

  describe('PATCH /connectors/:id/enabled', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('throws if connector can not be found (locally)', async () => {
      getConnectorInstanceByIdPlaceHolder.mockImplementationOnce(async (_id: string) => {
        const found = mockConnectorInstanceList.find(
          (connectorInstance) => connectorInstance.metadata.id === 'connector'
        );
        assertThat(found, new RequestError({ code: 'entity.not_found', status: 404 }));

        return found;
      });
      const response = await connectorRequest
        .patch('/connectors/findConnector/enabled')
        .send({ enabled: true });
      expect(response).toHaveProperty('statusCode', 404);
    });

    it('throws if connector can not be found (remotely)', async () => {
      getConnectorInstanceByIdPlaceHolder.mockImplementationOnce(async (id: string) => {
        const foundConnectorInstance = mockConnectorInstanceList.find(
          (connectorInstance) => connectorInstance.metadata.id === id
        );
        assertThat(
          foundConnectorInstance,
          new RequestError({ code: 'entity.not_found', status: 404 })
        );

        const foundConnector = mockConnectorList.find((connector) => connector.id === 'connector0');
        assertThat(foundConnector, 'entity.not_found');

        return { foundConnector, ...foundConnectorInstance };
      });
      const response = await connectorRequest
        .patch('/connectors/connector_0/enabled')
        .send({ enabled: true });
      expect(response).toHaveProperty('statusCode', 400);
    });

    it('enables one of the social connectors (with valid config)', async () => {
      getConnectorInstanceByIdPlaceHolder.mockImplementationOnce(async (_id: string) => {
        return {
          connector: mockConnector,
          metadata: mockMetadata,
          validateConfig: jest.fn(),
        };
      });
      const response = await connectorRequest
        .patch('/connectors/connector_0/enabled')
        .send({ enabled: true });
      expect(updateConnector).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'connector_0' },
          set: { enabled: true },
        })
      );
      expect(response.body).toMatchObject({
        metadata: mockMetadata,
      });
      expect(response).toHaveProperty('statusCode', 200);
    });

    it('enables one of the social connectors (with invalid config)', async () => {
      getConnectorInstanceByIdPlaceHolder.mockImplementationOnce(async (_id: string) => {
        return {
          connector: mockConnector,
          metadata: mockMetadata,
          validateConfig: async () => {
            throw new ConnectorError(ConnectorErrorCodes.InvalidConfig);
          },
        };
      });
      const response = await connectorRequest
        .patch('/connectors/connector_0/enabled')
        .send({ enabled: true });
      expect(response).toHaveProperty('statusCode', 500);
    });

    it('disables one of the social connectors', async () => {
      getConnectorInstanceByIdPlaceHolder.mockImplementationOnce(async (_id: string) => {
        return {
          connector: mockConnector,
          metadata: mockMetadata,
          validateConfig: async () => {
            throw new ConnectorError(ConnectorErrorCodes.InvalidConfig);
          },
        };
      });
      const response = await connectorRequest
        .patch('/connectors/connector_0/enabled')
        .send({ enabled: false });
      expect(updateConnector).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'connector_0' },
          set: { enabled: false },
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
        id: 'connector_1',
        type: ConnectorType.SMS,
      };
      const mockedConnector = {
        ...mockConnector,
        id: 'connector_1',
        name: 'connector_1',
        platform: ConnectorPlatform.NA,
        type: ConnectorType.SMS,
        metadata: mockedMetadata,
      };
      getConnectorInstanceByIdPlaceHolder.mockImplementationOnce(async (_id: string) => {
        return {
          connector: mockedConnector,
          metadata: mockedMetadata,
          validateConfig: jest.fn(),
        };
      });
      const response = await connectorRequest
        .patch('/connectors/connector_1/enabled')
        .send({ enabled: true });
      expect(updateConnector).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          where: { id: 'connector_1' },
          set: { enabled: false },
        })
      );
      expect(updateConnector).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          where: { id: 'connector_5' },
          set: { enabled: false },
        })
      );
      expect(updateConnector).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({
          where: { id: 'connector_1' },
          set: { enabled: true },
        })
      );
      expect(response.body).toMatchObject({
        metadata: mockedMetadata,
      });
      expect(response).toHaveProperty('statusCode', 200);
    });

    it('enables one of the email/sms connectors (with invalid config)', async () => {
      getConnectorInstancesPlaceHolder.mockResolvedValueOnce(mockConnectorInstanceList);
      const mockedMetadata = {
        ...mockMetadata,
        id: 'connector_1',
        type: ConnectorType.SMS,
      };
      const mockedConnector = {
        ...mockConnector,
        id: 'connector_1',
        name: 'connector_1',
        platform: ConnectorPlatform.NA,
        type: ConnectorType.SMS,
        metadata: mockedMetadata,
      };
      getConnectorInstanceByIdPlaceHolder.mockImplementationOnce(async (_id: string) => {
        return {
          connector: mockedConnector,
          metadata: mockedMetadata,
          validateConfig: async () => {
            throw new ConnectorError(ConnectorErrorCodes.InvalidConfig);
          },
        };
      });
      const response = await connectorRequest
        .patch('/connectors/connector_1/enabled')
        .send({ enabled: true });
      expect(response).toHaveProperty('statusCode', 500);
    });

    it('disables one of the email/sms connectors', async () => {
      const mockedMetadata = {
        ...mockMetadata,
        id: 'connector_4',
        type: ConnectorType.Email,
        platform: ConnectorPlatform.NA,
      };
      const mockedConnector = {
        ...mockConnector,
        id: 'connector_4',
        name: 'connector_4',
        platform: ConnectorPlatform.NA,
        type: ConnectorType.Email,
        metadata: mockedMetadata,
      };
      getConnectorInstanceByIdPlaceHolder.mockImplementationOnce(async (_id: string) => {
        return {
          connector: mockedConnector,
          metadata: mockedMetadata,
        };
      });
      const response = await connectorRequest
        .patch('/connectors/connector_4/enabled')
        .send({ enabled: false });
      expect(updateConnector).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'connector_4' },
          set: { enabled: false },
        })
      );
      expect(response.body).toMatchObject({
        metadata: mockedMetadata,
      });
      expect(response).toHaveProperty('statusCode', 200);
    });
  });

  describe('PATCH /connectors/:id', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('throws when connector can not be found by given connectorId (locally)', async () => {
      getConnectorInstanceByIdPlaceHolder.mockImplementationOnce(async (_id: string) => {
        const found = mockConnectorInstanceList.find(
          (connectorInstance) => connectorInstance.metadata.id === 'connector'
        );
        assertThat(found, new RequestError({ code: 'entity.not_found', status: 404 }));

        return found;
      });
      const response = await connectorRequest.patch('/connectors/findConnector').send({});
      expect(response).toHaveProperty('statusCode', 404);
    });

    it('throws when connector can not be found by given connectorId (remotely)', async () => {
      getConnectorInstanceByIdPlaceHolder.mockImplementationOnce(async (id: string) => {
        const foundConnectorInstance = mockConnectorInstanceList.find(
          (connectorInstance) => connectorInstance.metadata.id === id
        );
        assertThat(
          foundConnectorInstance,
          new RequestError({ code: 'entity.not_found', status: 404 })
        );

        const foundConnector = mockConnectorList.find((connector) => connector.id === 'connector0');
        assertThat(foundConnector, 'entity.not_found');

        return { foundConnector, ...foundConnectorInstance };
      });
      const response = await connectorRequest.patch('/connectors/connector_0').send({});
      expect(response).toHaveProperty('statusCode', 400);
    });

    it('config validation fails', async () => {
      getConnectorInstanceByIdPlaceHolder.mockImplementationOnce(async (_id: string) => {
        return {
          connector: mockConnector,
          metadata: mockMetadata,
          validateConfig: async () => {
            throw new ConnectorError(ConnectorErrorCodes.InvalidConfig);
          },
        };
      });
      const response = await connectorRequest
        .patch('/connectors/connector_0')
        .send({ config: { cliend_id: 'client_id', client_secret: 'client_secret' } });
      expect(response).toHaveProperty('statusCode', 500);
    });

    it('successfully updates connector configs', async () => {
      getConnectorInstanceByIdPlaceHolder.mockImplementationOnce(async (_id: string) => {
        return {
          connector: mockConnector,
          metadata: mockMetadata,
          validateConfig: jest.fn(),
        };
      });
      const response = await connectorRequest
        .patch('/connectors/connector_0')
        .send({ config: { cliend_id: 'client_id', client_secret: 'client_secret' } });
      expect(updateConnector).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'connector_0' },
          set: { config: { cliend_id: 'client_id', client_secret: 'client_secret' } },
        })
      );
      expect(response.body).toMatchObject({
        metadata: mockMetadata,
      });
      expect(response).toHaveProperty('statusCode', 200);
    });
  });

  describe('POST /connectors/test/email', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should get email connector and send message', async () => {
      const mockedMetadata = {
        ...mockMetadata,
        type: ConnectorType.Email,
      };
      const mockedConnector = {
        ...mockConnector,
        type: ConnectorType.Email,
        metadata: mockedMetadata,
      };
      const mockedEmailConnector: EmailConnectorInstance = {
        connector: mockedConnector,
        metadata: mockedMetadata,
        validateConfig: jest.fn(),
        getConfig: jest.fn(),
        sendMessage: async (
          address: string,
          type: keyof EmailMessageTypes,
          _payload: EmailMessageTypes[typeof type]
          // eslint-disable-next-line @typescript-eslint/no-empty-function
        ): Promise<any> => {},
      };

      getConnectorInstanceByTypePlaceHolder.mockImplementationOnce(async (_: ConnectorType) => {
        return mockedEmailConnector;
      });

      const sendMessageSpy = jest.spyOn(mockedEmailConnector, 'sendMessage');
      const response = await connectorRequest
        .post('/connectors/test/email')
        .send({ email: 'test@email.com' });
      expect(getConnectorInstanceByTypePlaceHolder).toHaveBeenCalledWith(ConnectorType.Email);
      expect(sendMessageSpy).toHaveBeenCalledTimes(1);
      expect(response).toHaveProperty('statusCode', 204);
    });
  });

  describe('POST /connectors/test/sms', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should get SMS connector and send message', async () => {
      const mockedMetadata = {
        ...mockMetadata,
        type: ConnectorType.SMS,
      };
      const mockedConnector = {
        ...mockConnector,
        type: ConnectorType.SMS,
        metadata: mockedMetadata,
      };
      const mockedSmsConnectorInstance: SmsConnectorInstance = {
        connector: mockedConnector,
        metadata: mockedMetadata,
        validateConfig: jest.fn(),
        getConfig: jest.fn(),
        sendMessage: async (
          address: string,
          type: keyof EmailMessageTypes,
          _payload: EmailMessageTypes[typeof type]
          // eslint-disable-next-line @typescript-eslint/no-empty-function
        ): Promise<any> => {},
      };

      getConnectorInstanceByTypePlaceHolder.mockImplementationOnce(async (_: ConnectorType) => {
        return mockedSmsConnectorInstance;
      });

      const sendMessageSpy = jest.spyOn(mockedSmsConnectorInstance, 'sendMessage');
      const response = await connectorRequest
        .post('/connectors/test/sms')
        .send({ phone: '12345678901' });
      expect(getConnectorInstanceByTypePlaceHolder).toHaveBeenCalledWith(ConnectorType.SMS);
      expect(sendMessageSpy).toHaveBeenCalledTimes(1);
      expect(response).toHaveProperty('statusCode', 204);
    });
  });
});
/* eslint-enable max-lines, max-nested-callbacks */
