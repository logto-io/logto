import type { ConnectorFactory } from '@logto/cli/lib/connector/index.js';
import type router from '@logto/cloud/routes';
import { TemplateType } from '@logto/connector-kit';
import type { EmailConnector, SmsConnector } from '@logto/connector-kit';
import { ConnectorType } from '@logto/schemas';
import { pickDefault, createMockUtils } from '@logto/shared/esm';

import { mockMetadata, mockConnectorFactory } from '#src/__mocks__/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import assertThat from '#src/utils/assert-that.js';
import type { LogtoConnector } from '#src/utils/connectors/types.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

// eslint-disable-next-line @typescript-eslint/ban-types
const getLogtoConnectors = jest.fn<Promise<LogtoConnector[]>, []>();

const { loadConnectorFactories } = await mockEsmWithActual(
  '#src/utils/connectors/index.js',
  () => ({
    loadConnectorFactories: jest.fn(),
  })
);

const { buildRawConnector } = await mockEsmWithActual('@logto/cli/lib/connector/index.js', () => ({
  buildRawConnector: jest.fn(),
}));

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

const connectorConfigTestingRoutes = await pickDefault(import('./config-testing.js'));

describe('connector services route', () => {
  const connectorRequest = createRequester({
    authedRoutes: connectorConfigTestingRoutes,
    tenantContext,
  });

  describe('POST /connectors/:factoryId/test', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should get SMS connector and send test message', async () => {
      const sendMessage = jest.fn();
      const mockedSmsConnectorFactory: ConnectorFactory<typeof router, SmsConnector> = {
        ...mockConnectorFactory,
        metadata: mockMetadata,
        type: ConnectorType.Sms,
        createConnector: jest.fn(),
      };
      loadConnectorFactories.mockResolvedValueOnce([mockedSmsConnectorFactory]);
      buildRawConnector.mockResolvedValueOnce({ rawConnector: { sendMessage } });
      const response = await connectorRequest
        .post('/connectors/id/test')
        .send({ phone: '12345678901', config: { test: 123 } });
      expect(sendMessage).toHaveBeenCalledTimes(1);
      expect(sendMessage).toHaveBeenCalledWith(
        {
          to: '12345678901',
          type: TemplateType.Generic,
          payload: {
            code: '000000',
          },
          ip: '::ffff:127.0.0.1',
        },
        { test: 123 }
      );
      expect(response).toHaveProperty('statusCode', 204);
    });

    it('should get email connector and send test message', async () => {
      const sendMessage = jest.fn();
      const mockedEmailConnectorFactory: ConnectorFactory<typeof router, EmailConnector> = {
        ...mockConnectorFactory,
        metadata: mockMetadata,
        type: ConnectorType.Email,
        createConnector: jest.fn(),
      };
      loadConnectorFactories.mockResolvedValueOnce([mockedEmailConnectorFactory]);
      buildRawConnector.mockResolvedValueOnce({ rawConnector: { sendMessage } });
      const response = await connectorRequest
        .post('/connectors/id/test')
        .send({ email: 'test@email.com', config: { test: 123 } });
      expect(sendMessage).toHaveBeenCalledTimes(1);
      expect(sendMessage).toHaveBeenCalledWith(
        {
          to: 'test@email.com',
          type: TemplateType.Generic,
          payload: {
            code: '000000',
          },
          ip: '::ffff:127.0.0.1',
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
      getLogtoConnectors.mockResolvedValueOnce([]);
      const response = await connectorRequest
        .post('/connectors/id/test')
        .send({ phone: '12345678901' });
      expect(response).toHaveProperty('statusCode', 400);
    });

    it('should throw when email connector is not found', async () => {
      getLogtoConnectors.mockResolvedValueOnce([]);
      const response = await connectorRequest
        .post('/connectors/id/test')
        .send({ email: 'test@email.com' });
      expect(response).toHaveProperty('statusCode', 400);
    });
  });
});
