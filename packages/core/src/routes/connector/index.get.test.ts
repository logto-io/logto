import { ConnectorType } from '@logto/schemas';
import { pickDefault, createMockUtils } from '@logto/shared/esm';

import {
  mockMetadata0,
  mockMetadata1,
  mockMetadata2,
  mockMetadata3,
  mockConnectorFactory,
  mockLogtoConnectorList,
} from '#src/__mocks__/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import assertThat from '#src/utils/assert-that.js';
import type { LogtoConnector } from '#src/utils/connectors/types.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;
const { mockEsm, mockEsmWithActual } = createMockUtils(jest);

mockEsm('#src/utils/connectors/platform.js', () => ({
  checkSocialConnectorTargetAndPlatformUniqueness: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/ban-types
const getLogtoConnectors = jest.fn<Promise<LogtoConnector[]>, []>();

const { loadConnectorFactories } = await mockEsmWithActual(
  '#src/utils/connectors/index.js',
  () => ({
    loadConnectorFactories: jest.fn(),
  })
);

const tenantContext = new MockTenant(
  undefined,
  {},
  {
    getLogtoConnectors,
    getLogtoConnectorById: async (connectorId: string) => {
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

      return connector;
    },
  },
  {}
);

const connectorDataRoutes = await pickDefault(import('./index.js'));

describe('connector data route', () => {
  const connectorRequest = createRequester({ authedRoutes: connectorDataRoutes, tenantContext });

  describe('GET /connectors', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('throws if more than one email connector exists', async () => {
      getLogtoConnectors.mockResolvedValueOnce(mockLogtoConnectorList);
      const response = await connectorRequest.get('/connectors').send({});
      expect(response).toHaveProperty('statusCode', 400);
    });

    it('throws if more than one SMS connector exists', async () => {
      getLogtoConnectors.mockResolvedValueOnce(
        mockLogtoConnectorList.filter((connector) => connector.type !== ConnectorType.Email)
      );
      const response = await connectorRequest.get('/connectors').send({});
      expect(response).toHaveProperty('statusCode', 400);
    });

    it('shows all connectors', async () => {
      getLogtoConnectors.mockResolvedValueOnce(
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
      getLogtoConnectors.mockResolvedValueOnce(mockLogtoConnectorList.slice(2));
      const response = await connectorRequest.get('/connectors/findConnector').send({});
      expect(response).toHaveProperty('statusCode', 404);
    });

    it('throws when connector can not be found by given connectorId (remotely)', async () => {
      getLogtoConnectors.mockResolvedValueOnce([]);
      const response = await connectorRequest.get('/connectors/id0').send({});
      expect(response).toHaveProperty('statusCode', 404);
    });

    it('shows found connector information', async () => {
      getLogtoConnectors.mockResolvedValueOnce(mockLogtoConnectorList);
      const response = await connectorRequest.get('/connectors/id0').send({});
      expect(response).toHaveProperty('statusCode', 200);
    });
  });

  describe('GET /connector-factories', () => {
    it('show all connector factories', async () => {
      loadConnectorFactories.mockResolvedValueOnce([
        { ...mockConnectorFactory, metadata: mockMetadata0, type: ConnectorType.Sms },
        { ...mockConnectorFactory, metadata: mockMetadata1, type: ConnectorType.Social },
        { ...mockConnectorFactory, metadata: mockMetadata2, type: ConnectorType.Email },
        { ...mockConnectorFactory, metadata: mockMetadata3, type: ConnectorType.Social },
      ]);
      const response = await connectorRequest.get('/connector-factories').send({});
      expect(response.body).toMatchObject([
        { ...mockMetadata0, type: ConnectorType.Sms },
        { ...mockMetadata1, type: ConnectorType.Social },
        { ...mockMetadata2, type: ConnectorType.Email },
        { ...mockMetadata3, type: ConnectorType.Social },
      ]);
      expect(response).toHaveProperty('statusCode', 200);
    });
  });

  describe('GET /connector-factories/:id', () => {
    it('throws when connector factory can not be found by given id', async () => {
      loadConnectorFactories.mockResolvedValueOnce([
        { ...mockConnectorFactory, metadata: mockMetadata0, type: ConnectorType.Sms },
        { ...mockConnectorFactory, metadata: mockMetadata1, type: ConnectorType.Social },
        { ...mockConnectorFactory, metadata: mockMetadata2, type: ConnectorType.Email },
        { ...mockConnectorFactory, metadata: mockMetadata3, type: ConnectorType.Social },
      ]);
      const response = await connectorRequest.get('/connector-factories/findConnector').send({});
      expect(response).toHaveProperty('statusCode', 404);
    });

    it('show picked connector factory', async () => {
      loadConnectorFactories.mockResolvedValueOnce([
        { ...mockConnectorFactory, metadata: mockMetadata0, type: ConnectorType.Sms },
        { ...mockConnectorFactory, metadata: mockMetadata1, type: ConnectorType.Social },
        { ...mockConnectorFactory, metadata: mockMetadata2, type: ConnectorType.Email },
        { ...mockConnectorFactory, metadata: mockMetadata3, type: ConnectorType.Social },
      ]);
      const response = await connectorRequest.get('/connector-factories/id2').send({});
      expect(response.body).toMatchObject({ ...mockMetadata2, type: ConnectorType.Email });
      expect(response).toHaveProperty('statusCode', 200);
    });
  });
});
