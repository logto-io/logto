import { ConnectorType } from '@logto/schemas';
import { pickDefault, createMockUtils } from '@logto/shared/esm';

import { mockConnector, mockConnectorFactory } from '#src/__mocks__/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import assertThat from '#src/utils/assert-that.js';
import type { LogtoConnector } from '#src/utils/connectors/types.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

const removeUnavailableSocialConnectorTargets = jest.fn();

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

const connectorQueries = {
  findConnectorById: jest.fn(),
  deleteConnectorById: jest.fn(),
} satisfies Partial<Queries['connectors']>;
const { findConnectorById, deleteConnectorById } = connectorQueries;

const { loadConnectorFactories } = await mockEsmWithActual(
  '#src/utils/connectors/index.js',
  () => ({
    loadConnectorFactories: jest.fn(),
  })
);

const tenantContext = new MockTenant(
  undefined,
  { connectors: connectorQueries },
  {
    getLogtoConnectors,
    getLogtoConnectorById,
  },
  {
    signInExperiences: { removeUnavailableSocialConnectorTargets },
  }
);

const connectorDataRoutes = await pickDefault(import('./index.js'));

describe('connector data routes', () => {
  const connectorRequest = createRequester({ authedRoutes: connectorDataRoutes, tenantContext });

  describe('DELETE /connectors/:id', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('delete connector instance and remove unavailable social connector targets', async () => {
      findConnectorById.mockResolvedValueOnce(mockConnector);
      loadConnectorFactories.mockResolvedValueOnce([mockConnectorFactory]);
      await connectorRequest.delete('/connectors/id').send({});
      expect(deleteConnectorById).toHaveBeenCalledTimes(1);
      expect(removeUnavailableSocialConnectorTargets).toHaveBeenCalledTimes(1);
    });

    it('delete connector instance (connector factory is not social type)', async () => {
      findConnectorById.mockResolvedValueOnce(mockConnector);
      loadConnectorFactories.mockResolvedValueOnce([
        { ...mockConnectorFactory, type: ConnectorType.Sms },
      ]);
      await connectorRequest.delete('/connectors/id').send({});
      expect(deleteConnectorById).toHaveBeenCalledTimes(1);
      expect(removeUnavailableSocialConnectorTargets).toHaveBeenCalledTimes(0);
    });

    it('delete connector instance (connector factory is not found)', async () => {
      findConnectorById.mockResolvedValueOnce(mockConnector);
      loadConnectorFactories.mockResolvedValueOnce([]);
      await connectorRequest.delete('/connectors/id').send({});
      expect(deleteConnectorById).toHaveBeenCalledTimes(1);
      expect(removeUnavailableSocialConnectorTargets).toHaveBeenCalledTimes(0);
    });

    it('throws when connector not exists with `id`', async () => {
      // eslint-disable-next-line unicorn/no-useless-undefined
      findConnectorById.mockResolvedValueOnce(undefined);
      const response = await connectorRequest.delete('/connectors/id').send({});
      expect(response).toHaveProperty('statusCode', 500);
    });
  });
});
