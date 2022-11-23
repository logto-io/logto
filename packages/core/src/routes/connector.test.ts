import type { EmailConnector, SmsConnector } from '@logto/connector-kit';
import { MessageTypes } from '@logto/connector-kit';
import { ConnectorType } from '@logto/schemas';
import { any } from 'zod';

import {
  mockMetadata,
  mockConnector,
  mockConnectorFactory,
  mockLogtoConnectorList,
} from '#src/__mocks__/index.js';
import { defaultConnectorMethods } from '#src/connectors/consts.js';
import type { ConnectorFactory, LogtoConnector } from '#src/connectors/types.js';
import RequestError from '#src/errors/RequestError/index.js';
import { countConnectorByConnectorId, deleteConnectorById } from '#src/queries/connector.js';
import assertThat from '#src/utils/assert-that.js';
import { createRequester } from '#src/utils/test-utils.js';

import connectorRoutes from './connector.js';

const loadConnectorFactoriesPlaceHolder = jest.fn() as jest.MockedFunction<
  () => Promise<ConnectorFactory[]>
>;
const getLogtoConnectorsPlaceHolder = jest.fn() as jest.MockedFunction<
  () => Promise<LogtoConnector[]>
>;

jest.mock('#src/queries/connector.js', () => ({
  countConnectorByConnectorId: jest.fn(),
  deleteConnectorById: jest.fn(),
  insertConnector: jest.fn(async (body: unknown) => body),
}));

jest.mock('#src/connectors/index.js', () => ({
  loadConnectorFactories: async () => loadConnectorFactoriesPlaceHolder(),
  getLogtoConnectors: async () => getLogtoConnectorsPlaceHolder(),
  getLogtoConnectorById: async (connectorId: string) => {
    const connectors = await getLogtoConnectorsPlaceHolder();
    const connector = connectors.find(({ dbEntry }) => dbEntry.id === connectorId);
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
      getLogtoConnectorsPlaceHolder.mockResolvedValueOnce(mockLogtoConnectorList);
      const response = await connectorRequest.get('/connectors').send({});
      expect(response).toHaveProperty('statusCode', 400);
    });

    it('throws if more than one SMS connector is enabled', async () => {
      getLogtoConnectorsPlaceHolder.mockResolvedValueOnce(
        mockLogtoConnectorList.filter((connector) => connector.type !== ConnectorType.Email)
      );
      const response = await connectorRequest.get('/connectors').send({});
      expect(response).toHaveProperty('statusCode', 400);
    });

    it('shows all connectors', async () => {
      getLogtoConnectorsPlaceHolder.mockResolvedValueOnce(
        mockLogtoConnectorList.filter((connector) => connector.type === ConnectorType.Social)
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
      getLogtoConnectorsPlaceHolder.mockResolvedValueOnce(mockLogtoConnectorList.slice(2));
      const response = await connectorRequest.get('/connectors/findConnector').send({});
      expect(response).toHaveProperty('statusCode', 404);
    });

    it('throws when connector can not be found by given connectorId (remotely)', async () => {
      getLogtoConnectorsPlaceHolder.mockResolvedValueOnce([]);
      const response = await connectorRequest.get('/connectors/id0').send({});
      expect(response).toHaveProperty('statusCode', 404);
    });

    it('shows found connector information', async () => {
      getLogtoConnectorsPlaceHolder.mockResolvedValueOnce(mockLogtoConnectorList);
      const response = await connectorRequest.get('/connectors/id0').send({});
      expect(response).toHaveProperty('statusCode', 200);
    });
  });

  describe('POST /connectors', () => {
    const mockedCountConnectorByConnectorId = countConnectorByConnectorId as jest.Mock;
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should post a new connector record', async () => {
      loadConnectorFactoriesPlaceHolder.mockResolvedValueOnce([
        {
          ...mockConnectorFactory,
          metadata: { ...mockConnectorFactory.metadata, id: 'connectorId' },
        },
      ]);
      mockedCountConnectorByConnectorId.mockResolvedValueOnce({ count: 0 });
      const response = await connectorRequest.post('/connectors').send({
        connectorId: 'connectorId',
        config: { cliend_id: 'client_id', client_secret: 'client_secret' },
      });
      expect(response.body).toMatchObject(
        expect.objectContaining({
          connectorId: 'connectorId',
          config: {
            cliend_id: 'client_id',
            client_secret: 'client_secret',
          },
        })
      );
      expect(response).toHaveProperty('statusCode', 200);
    });

    it('throws when connector factory not found', async () => {
      loadConnectorFactoriesPlaceHolder.mockResolvedValueOnce([
        {
          ...mockConnectorFactory,
          metadata: { ...mockConnectorFactory.metadata, id: 'connectorId' },
        },
      ]);
      mockedCountConnectorByConnectorId.mockResolvedValueOnce({ count: 0 });
      const response = await connectorRequest.post('/connectors').send({
        connectorId: 'id0',
        config: { cliend_id: 'client_id', client_secret: 'client_secret' },
      });
      expect(response).toHaveProperty('statusCode', 422);
    });

    it('should post a new record when add more than 1 instance with connector factory', async () => {
      loadConnectorFactoriesPlaceHolder.mockResolvedValueOnce([
        {
          ...mockConnectorFactory,
          metadata: { ...mockConnectorFactory.metadata, id: 'id0', isStandard: true },
        },
      ]);
      mockedCountConnectorByConnectorId.mockResolvedValueOnce({ count: 1 });
      const response = await connectorRequest.post('/connectors').send({
        connectorId: 'id0',
        config: { cliend_id: 'client_id', client_secret: 'client_secret' },
      });
      expect(response.body).toMatchObject(
        expect.objectContaining({
          connectorId: 'id0',
          config: {
            cliend_id: 'client_id',
            client_secret: 'client_secret',
          },
        })
      );
      expect(response).toHaveProperty('statusCode', 200);
    });

    it('throws when add more than 1 instance with non-connector factory', async () => {
      loadConnectorFactoriesPlaceHolder.mockResolvedValueOnce([
        {
          ...mockConnectorFactory,
          metadata: { ...mockConnectorFactory.metadata, id: 'id0' },
        },
      ]);
      mockedCountConnectorByConnectorId.mockResolvedValueOnce({ count: 1 });
      const response = await connectorRequest.post('/connectors').send({
        connectorId: 'id0',
        config: { cliend_id: 'client_id', client_secret: 'client_secret' },
      });
      expect(response).toHaveProperty('statusCode', 422);
    });
  });

  describe('POST /connectors/:id/test', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should get SMS connector and send test message', async () => {
      const mockedMetadata = {
        ...mockMetadata,
      };
      const sendMessage = jest.fn();
      const mockedSmsConnector: LogtoConnector<SmsConnector> = {
        dbEntry: mockConnector,
        metadata: mockedMetadata,
        type: ConnectorType.Sms,
        configGuard: any(),
        ...defaultConnectorMethods,
        sendMessage,
      };
      getLogtoConnectorsPlaceHolder.mockResolvedValueOnce([mockedSmsConnector]);
      const response = await connectorRequest
        .post('/connectors/id/test')
        .send({ phone: '12345678901', config: { test: 123 } });
      expect(sendMessage).toHaveBeenCalledTimes(1);
      expect(sendMessage).toHaveBeenCalledWith(
        {
          to: '12345678901',
          type: MessageTypes.Test,
          payload: {
            code: '123456',
          },
        },
        { test: 123 }
      );
      expect(response).toHaveProperty('statusCode', 204);
    });

    it('should get email connector and send test message', async () => {
      const sendMessage = jest.fn();
      const mockedEmailConnector: LogtoConnector<EmailConnector> = {
        dbEntry: mockConnector,
        metadata: mockMetadata,
        type: ConnectorType.Email,
        configGuard: any(),
        ...defaultConnectorMethods,
        sendMessage,
      };
      getLogtoConnectorsPlaceHolder.mockResolvedValueOnce([mockedEmailConnector]);
      const response = await connectorRequest
        .post('/connectors/id/test')
        .send({ email: 'test@email.com', config: { test: 123 } });
      expect(sendMessage).toHaveBeenCalledTimes(1);
      expect(sendMessage).toHaveBeenCalledWith(
        {
          to: 'test@email.com',
          type: MessageTypes.Test,
          payload: {
            code: 'email-test',
          },
        },
        { test: 123 }
      );
      expect(response).toHaveProperty('statusCode', 204);
    });

    it('should throw when neither phone nor email is provided', async () => {
      const response = await connectorRequest.post('/connectors/id/test').send({});
      expect(response).toHaveProperty('statusCode', 400);
    });

    it('should throw when sms connector is not found', async () => {
      getLogtoConnectorsPlaceHolder.mockResolvedValueOnce([]);
      const response = await connectorRequest
        .post('/connectors/id/test')
        .send({ phone: '12345678901' });
      expect(response).toHaveProperty('statusCode', 400);
    });

    it('should throw when email connector is not found', async () => {
      getLogtoConnectorsPlaceHolder.mockResolvedValueOnce([]);
      const response = await connectorRequest
        .post('/connectors/id/test')
        .send({ email: 'test@email.com' });
      expect(response).toHaveProperty('statusCode', 400);
    });
  });

  describe('DELETE /connectors/:id', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('delete connector instance', async () => {
      await connectorRequest.delete('/connectors/id').send({});
      expect(deleteConnectorById).toHaveBeenCalledTimes(1);
    });
  });
});
