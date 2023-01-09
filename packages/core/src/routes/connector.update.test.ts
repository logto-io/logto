import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';
import { ConnectorType } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import {
  mockMetadata,
  mockConnector,
  mockLogtoConnectorList,
  mockLogtoConnector,
} from '#src/__mocks__/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import assertThat from '#src/utils/assert-that.js';
import type { LogtoConnector } from '#src/utils/connectors/types.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const getLogtoConnectors: jest.MockedFunction<() => Promise<LogtoConnector[]>> = jest.fn();
const getLogtoConnectorById: jest.MockedFunction<(connectorId: string) => Promise<LogtoConnector>> =
  jest.fn(async (connectorId: string) => {
    const connectors = await getLogtoConnectors();
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
  });

const sendMessagePlaceHolder = jest.fn();
const updateConnector = jest.fn();

const tenantContext = new MockTenant(
  undefined,
  { connectors: { updateConnector } },
  {
    connectors: {
      getLogtoConnectors,
      getLogtoConnectorById,
    },
    signInExperiences: {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      removeUnavailableSocialConnectorTargets: async () => {},
    },
  }
);

const connectorRoutes = await pickDefault(import('./connector.js'));

describe('connector PATCH routes', () => {
  const connectorRequest = createRequester({ authedRoutes: connectorRoutes, tenantContext });

  describe('PATCH /connectors/:id', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('throws when connector can not be found by given connectorId (locally)', async () => {
      getLogtoConnectors.mockResolvedValueOnce(mockLogtoConnectorList.slice(0, 1));
      const response = await connectorRequest.patch('/connectors/findConnector').send({});
      expect(response).toHaveProperty('statusCode', 404);
    });

    it('throws when connector can not be found by given connectorId (remotely)', async () => {
      getLogtoConnectors.mockResolvedValueOnce([]);
      const response = await connectorRequest.patch('/connectors/id0').send({});
      expect(response).toHaveProperty('statusCode', 404);
    });

    it('config validation fails', async () => {
      getLogtoConnectors.mockResolvedValueOnce([
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
      getLogtoConnectors.mockResolvedValue([
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

    it('throws when updates non-standard connector metadata', async () => {
      getLogtoConnectors.mockResolvedValue([
        {
          dbEntry: mockConnector,
          metadata: { ...mockMetadata },
          type: ConnectorType.Social,
          ...mockLogtoConnector,
        },
      ]);
      const response = await connectorRequest.patch('/connectors/id').send({
        metadata: {
          target: 'connector',
          name: { en: 'connector_name', fr: 'connector_name' },
          logo: 'new_logo.png',
        },
      });
      expect(response).toHaveProperty('statusCode', 400);
    });

    it('successfully updates connector config', async () => {
      getLogtoConnectors.mockResolvedValue([
        {
          dbEntry: mockConnector,
          metadata: { ...mockMetadata, isStandard: true },
          type: ConnectorType.Social,
          ...mockLogtoConnector,
        },
      ]);
      updateConnector.mockResolvedValueOnce({
        ...mockConnector,
        config: { cliend_id: 'client_id', client_secret: 'client_secret' },
      });
      const response = await connectorRequest.patch('/connectors/id').send({
        config: { cliend_id: 'client_id', client_secret: 'client_secret' },
      });
      expect(response).toHaveProperty('statusCode', 200);
      expect(updateConnector).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'id' },
          set: {
            config: { cliend_id: 'client_id', client_secret: 'client_secret' },
          },
          jsonbMode: 'replace',
        })
      );
    });

    it('successfully updates connector config and metadata', async () => {
      getLogtoConnectors.mockResolvedValue([
        {
          dbEntry: mockConnector,
          metadata: { ...mockMetadata, isStandard: true },
          type: ConnectorType.Social,
          ...mockLogtoConnector,
        },
      ]);
      updateConnector.mockResolvedValueOnce({
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
      getLogtoConnectors.mockResolvedValueOnce([
        {
          dbEntry: mockConnector,
          metadata: { ...mockMetadata, isStandard: true },
          type: ConnectorType.Social,
          ...mockLogtoConnector,
        },
      ]);
      updateConnector.mockResolvedValueOnce({
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
      getLogtoConnectors.mockResolvedValueOnce([
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
      getLogtoConnectors.mockResolvedValue([
        {
          dbEntry: { ...mockConnector, syncProfile: false },
          metadata: mockMetadata,
          type: ConnectorType.Social,
          ...mockLogtoConnector,
        },
      ]);
      const response = await connectorRequest.patch('/connectors/id').send({ syncProfile: true });
      expect(updateConnector).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'id' },
          set: { syncProfile: true },
          jsonbMode: 'replace',
        })
      );
      expect(response).toHaveProperty('statusCode', 200);
    });

    it('successfully set syncProfile to `false`', async () => {
      getLogtoConnectors.mockResolvedValue([
        {
          dbEntry: { ...mockConnector, syncProfile: false },
          metadata: mockMetadata,
          type: ConnectorType.Social,
          ...mockLogtoConnector,
        },
      ]);
      const response = await connectorRequest.patch('/connectors/id').send({ syncProfile: false });
      expect(updateConnector).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'id' },
          set: { syncProfile: false },
          jsonbMode: 'replace',
        })
      );
      expect(response).toHaveProperty('statusCode', 200);
    });
  });
});
