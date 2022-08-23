import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-core';
import { ConnectorType } from '@logto/schemas';

import {
  mockMetadata,
  mockConnector,
  mockLogtoConnectorList,
  mockLogtoConnector,
} from '@/__mocks__';
import { LogtoConnector } from '@/connectors/types';
import RequestError from '@/errors/RequestError';
import { updateConnector } from '@/queries/connector';
import assertThat from '@/utils/assert-that';
import { createRequester } from '@/utils/test-utils';

import connectorRoutes from './connector';

const getLogtoConnectorsPlaceholder = jest.fn() as jest.MockedFunction<
  () => Promise<LogtoConnector[]>
>;
const getLogtoConnectorByIdPlaceholder = jest.fn(async (connectorId: string) => {
  const connectors = await getLogtoConnectorsPlaceholder();
  const connector = connectors.find(({ db }) => db.id === connectorId);

  assertThat(
    connector,
    new RequestError({
      code: 'entity.not_found',
      connectorId,
      status: 404,
    })
  );

  return {
    ...connector,
    sendMessage: sendMessagePlaceHolder,
  };
}) as jest.MockedFunction<(connectorId: string) => Promise<LogtoConnector>>;
const sendMessagePlaceHolder = jest.fn();

jest.mock('@/queries/connector', () => ({
  updateConnector: jest.fn(),
}));
jest.mock('@/connectors', () => ({
  getLogtoConnectors: async () => getLogtoConnectorsPlaceholder(),
  getLogtoConnectorById: async (connectorId: string) =>
    getLogtoConnectorByIdPlaceholder(connectorId),
}));

describe('connector PATCH routes', () => {
  const connectorRequest = createRequester({ authedRoutes: connectorRoutes });

  describe('PATCH /connectors/:id/enabled', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('throws if connector can not be found (locally)', async () => {
      getLogtoConnectorsPlaceholder.mockResolvedValueOnce(mockLogtoConnectorList.slice(1));
      const response = await connectorRequest
        .patch('/connectors/findConnector/enabled')
        .send({ enabled: true });
      expect(response).toHaveProperty('statusCode', 404);
    });

    it('throws if connector can not be found (remotely)', async () => {
      getLogtoConnectorsPlaceholder.mockResolvedValueOnce([]);
      const response = await connectorRequest
        .patch('/connectors/id0/enabled')
        .send({ enabled: true });
      expect(response).toHaveProperty('statusCode', 404);
    });

    it('enables one of the social connectors (with valid config)', async () => {
      getLogtoConnectorsPlaceholder.mockResolvedValueOnce([
        {
          db: mockConnector,
          metadata: { ...mockMetadata, type: ConnectorType.Social },
          ...mockLogtoConnector,
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
      getLogtoConnectorsPlaceholder.mockResolvedValueOnce([
        {
          db: mockConnector,
          metadata: mockMetadata,
          ...mockLogtoConnector,
          validateConfig: () => {
            throw new ConnectorError(ConnectorErrorCodes.InvalidConfig);
          },
        },
      ]);
      const response = await connectorRequest
        .patch('/connectors/id/enabled')
        .send({ enabled: true });
      expect(response).toHaveProperty('statusCode', 500);
    });

    it('disables one of the social connectors', async () => {
      getLogtoConnectorsPlaceholder.mockResolvedValueOnce([
        {
          db: mockConnector,
          metadata: mockMetadata,
          ...mockLogtoConnector,
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
      getLogtoConnectorsPlaceholder.mockResolvedValueOnce(mockLogtoConnectorList);
      const mockedMetadata = {
        ...mockMetadata,
        id: 'id1',
        type: ConnectorType.SMS,
      };
      const mockedConnector = {
        ...mockConnector,
        id: 'id1',
      };
      getLogtoConnectorByIdPlaceholder.mockResolvedValueOnce({
        db: mockedConnector,
        metadata: mockedMetadata,
        ...mockLogtoConnector,
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
      getLogtoConnectorsPlaceholder.mockResolvedValueOnce([
        {
          db: mockConnector,
          metadata: {
            ...mockMetadata,
            type: ConnectorType.SMS,
          },
          ...mockLogtoConnector,
          validateConfig: () => {
            throw new ConnectorError(ConnectorErrorCodes.InvalidConfig);
          },
        },
      ]);
      const response = await connectorRequest
        .patch('/connectors/id/enabled')
        .send({ enabled: true });
      expect(response).toHaveProperty('statusCode', 500);
    });

    it('disables one of the email/sms connectors', async () => {
      getLogtoConnectorsPlaceholder.mockResolvedValueOnce([
        {
          db: mockConnector,
          metadata: mockMetadata,
          ...mockLogtoConnector,
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
      getLogtoConnectorsPlaceholder.mockResolvedValueOnce(mockLogtoConnectorList.slice(0, 1));
      const response = await connectorRequest.patch('/connectors/findConnector').send({});
      expect(response).toHaveProperty('statusCode', 404);
    });

    it('throws when connector can not be found by given connectorId (remotely)', async () => {
      getLogtoConnectorsPlaceholder.mockResolvedValueOnce([]);
      const response = await connectorRequest.patch('/connectors/id0').send({});
      expect(response).toHaveProperty('statusCode', 404);
    });

    it('config validation fails', async () => {
      getLogtoConnectorsPlaceholder.mockResolvedValueOnce([
        {
          db: mockConnector,
          metadata: mockMetadata,
          ...mockLogtoConnector,
          validateConfig: () => {
            throw new ConnectorError(ConnectorErrorCodes.InvalidConfig);
          },
        },
      ]);
      const response = await connectorRequest
        .patch('/connectors/id')
        .send({ config: { cliend_id: 'client_id', client_secret: 'client_secret' } });
      expect(response).toHaveProperty('statusCode', 500);
    });

    it('successfully updates connector configs', async () => {
      getLogtoConnectorsPlaceholder.mockResolvedValueOnce([
        {
          db: mockConnector,
          metadata: mockMetadata,
          ...mockLogtoConnector,
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
