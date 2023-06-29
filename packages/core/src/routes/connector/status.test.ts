import { type EmailConnector } from '@logto/connector-kit';
import { ConnectorType } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import {
  mockConnector0,
  mockMetadata0,
  mockLogtoConnectorList,
  mockLogtoConnector,
} from '#src/__mocks__/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import assertThat from '#src/utils/assert-that.js';
import type { LogtoConnector } from '#src/utils/connectors/types.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

// eslint-disable-next-line @typescript-eslint/ban-types
const getLogtoConnectors = jest.fn<Promise<LogtoConnector[]>, []>();

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

const connectorStatusRoutes = await pickDefault(import('./status.js'));

describe('connector data route', () => {
  const connectorRequest = createRequester({ authedRoutes: connectorStatusRoutes, tenantContext });

  describe('GET /connectors/:id/usage', () => {
    it('throws when no passwordless connector can be found by given connector id', async () => {
      getLogtoConnectors.mockResolvedValueOnce(mockLogtoConnectorList.slice(2));
      const response = await connectorRequest.get('/connectors/id/usage').send({});
      expect(response).toHaveProperty('statusCode', 404);
    });

    it('throws when `getUsage()` method is not implemented for given connector id', async () => {
      getLogtoConnectors.mockResolvedValueOnce(mockLogtoConnectorList);
      const response = await connectorRequest.get('/connectors/id6/usage').send({});
      expect(response).toHaveProperty('statusCode', 501);
    });

    it('shows usage information for given connector id', async () => {
      const logtoConnector: LogtoConnector<EmailConnector> = {
        dbEntry: mockConnector0,
        metadata: { ...mockMetadata0 },
        type: ConnectorType.Email,
        ...mockLogtoConnector,
        getUsage: jest.fn().mockResolvedValueOnce(100),
      };
      getLogtoConnectors.mockResolvedValueOnce([logtoConnector]);
      const response = await connectorRequest
        .get(`/connectors/${logtoConnector.dbEntry.id}/usage`)
        .send({});
      expect(response.body.usage).toEqual(100);
      expect(response).toHaveProperty('statusCode', 200);
    });
  });
});
