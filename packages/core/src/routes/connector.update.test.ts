import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';
import { ConnectorType } from '@logto/schemas';

import {
  mockMetadata,
  mockConnector,
  mockLogtoConnectorList,
  mockLogtoConnector,
} from '#src/__mocks__/index.js';
import type { LogtoConnector } from '#src/connectors/types.js';
import RequestError from '#src/errors/RequestError/index.js';
import { updateConnector } from '#src/queries/connector.js';
import assertThat from '#src/utils/assert-that.js';
import { createRequester } from '#src/utils/test-utils.js';

import connectorRoutes from './connector.js';

const getLogtoConnectorsPlaceholder = jest.fn() as jest.MockedFunction<
  () => Promise<LogtoConnector[]>
>;
const getLogtoConnectorByIdPlaceholder = jest.fn(async (connectorId: string) => {
  const connectors = await getLogtoConnectorsPlaceholder();
  const connector = connectors.find(({ dbEntry }) => dbEntry.id === connectorId);

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
const mockedUpdateConnector = updateConnector as jest.Mock;
const sendMessagePlaceHolder = jest.fn();

jest.mock('#src/queries/connector.js', () => ({
  updateConnector: jest.fn(),
}));
jest.mock('#src/connectors.js', () => ({
  getLogtoConnectors: async () => getLogtoConnectorsPlaceholder(),
  getLogtoConnectorById: async (connectorId: string) =>
    getLogtoConnectorByIdPlaceholder(connectorId),
}));
jest.mock('#src/lib/sign-in-experience.js', () => ({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  removeUnavailableSocialConnectorTargets: async () => {},
}));

describe('connector PATCH routes', () => {
  const connectorRequest = createRequester({ authedRoutes: connectorRoutes });

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
          dbEntry: mockConnector,
          metadata: mockMetadata,
          type: ConnectorType.Sms,
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

    it('throws when trying to update target', async () => {
      getLogtoConnectorsPlaceholder.mockResolvedValue([
        {
          dbEntry: mockConnector,
          metadata: { ...mockMetadata, isStandard: true },
          type: ConnectorType.Social,
          ...mockLogtoConnector,
        },
      ]);
      const response = await connectorRequest.patch('/connectors/id').send({
        metadata: {
          target: 'target',
        },
      });
      expect(response).toHaveProperty('statusCode', 400);
    });

    it('successfully updates connector configs', async () => {
      getLogtoConnectorsPlaceholder.mockResolvedValue([
        {
          dbEntry: mockConnector,
          metadata: { ...mockMetadata, isStandard: true },
          type: ConnectorType.Social,
          ...mockLogtoConnector,
        },
      ]);
      mockedUpdateConnector.mockResolvedValueOnce({
        ...mockConnector,
        metadata: {
          target: 'connector',
          name: { en: 'connector_name', fr: 'connector_name' },
          logo: 'new_logo.png',
        },
      });
      const response = await connectorRequest.patch('/connectors/id').send({
        config: { cliend_id: 'client_id', client_secret: 'client_secret' },
        metadata: {
          name: { en: 'connector_name', fr: 'connector_name' },
          logo: 'new_logo.png',
          logoDark: null,
          target: 'connector',
        },
      });
      expect(updateConnector).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'id' },
          set: {
            config: { cliend_id: 'client_id', client_secret: 'client_secret' },
            metadata: {
              name: { en: 'connector_name', fr: 'connector_name' },
              logo: 'new_logo.png',
              target: 'connector',
            },
          },
          jsonbMode: 'replace',
        })
      );
      expect(response).toHaveProperty('statusCode', 200);
    });

    it('successfully clear connector config metadata', async () => {
      getLogtoConnectorsPlaceholder.mockResolvedValueOnce([
        {
          dbEntry: mockConnector,
          metadata: { ...mockMetadata, isStandard: true },
          type: ConnectorType.Social,
          ...mockLogtoConnector,
        },
      ]);
      mockedUpdateConnector.mockResolvedValueOnce({
        ...mockConnector,
        metadata: {
          target: 'connector',
          name: { en: '' },
          logo: '',
          logoDark: '',
        },
      });
      const response = await connectorRequest.patch('/connectors/id').send({
        metadata: { target: 'connector', name: { en: '' }, logo: '', logoDark: '' },
      });
      expect(updateConnector).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'id' },
          set: {
            metadata: { target: 'connector' },
          },
          jsonbMode: 'replace',
        })
      );
      expect(response).toHaveProperty('statusCode', 200);
    });

    it('throws when set syncProfile to `true` and with non-social connector', async () => {
      getLogtoConnectorsPlaceholder.mockResolvedValueOnce([
        {
          dbEntry: mockConnector,
          metadata: mockMetadata,
          type: ConnectorType.Sms,
          ...mockLogtoConnector,
        },
      ]);
      const response = await connectorRequest.patch('/connectors/id').send({ syncProfile: true });
      expect(response).toHaveProperty('statusCode', 422);
      expect(updateConnector).toHaveBeenCalledTimes(0);
    });

    it('successfully set syncProfile to `true` and with social connector', async () => {
      getLogtoConnectorsPlaceholder.mockResolvedValue([
        {
          dbEntry: { ...mockConnector, syncProfile: false },
          metadata: mockMetadata,
          type: ConnectorType.Social,
          ...mockLogtoConnector,
        },
      ]);
      const response = await connectorRequest
        .patch('/connectors/id')
        .send({ syncProfile: true, metadata: { target: 'connector' } });
      expect(updateConnector).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'id' },
          set: { syncProfile: true, metadata: { target: 'connector' } },
          jsonbMode: 'replace',
        })
      );
      expect(response).toHaveProperty('statusCode', 200);
    });

    it('successfully set syncProfile to `false`', async () => {
      getLogtoConnectorsPlaceholder.mockResolvedValue([
        {
          dbEntry: { ...mockConnector, syncProfile: false },
          metadata: mockMetadata,
          type: ConnectorType.Social,
          ...mockLogtoConnector,
        },
      ]);
      const response = await connectorRequest
        .patch('/connectors/id')
        .send({ syncProfile: false, metadata: { target: 'connector' } });
      expect(updateConnector).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'id' },
          set: { syncProfile: false, metadata: { target: 'connector' } },
          jsonbMode: 'replace',
        })
      );
      expect(response).toHaveProperty('statusCode', 200);
    });
  });
});
