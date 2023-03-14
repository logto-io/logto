/* eslint-disable max-lines */
import { defaultConnectorMethods } from '@logto/cli/lib/connector/index.js';
import {
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorPlatform,
  VerificationCodeType,
} from '@logto/connector-kit';
import type { EmailConnector, SmsConnector } from '@logto/connector-kit';
import type { Connector } from '@logto/schemas';
import { ConnectorType } from '@logto/schemas';
import { pickDefault, createMockUtils } from '@logto/shared/esm';
import { any } from 'zod';

import {
  mockMetadata,
  mockMetadata0,
  mockMetadata1,
  mockMetadata2,
  mockMetadata3,
  mockConnector,
  mockConnectorFactory,
  mockLogtoConnectorList,
  mockLogtoConnector,
} from '#src/__mocks__/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import Queries from '#src/tenants/Queries.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import assertThat from '#src/utils/assert-that.js';
import type { LogtoConnector } from '#src/utils/connectors/types.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;
const { mockEsm, mockEsmWithActual } = createMockUtils(jest);

mockEsm('#src/utils/connectors/platform.js', () => ({
  checkSocialConnectorTargetAndPlatformUniqueness: jest.fn(),
}));

const removeUnavailableSocialConnectorTargets = jest.fn();

const connectorQueries = {
  findConnectorById: jest.fn(),
  countConnectorByConnectorId: jest.fn(),
  deleteConnectorById: jest.fn(),
  deleteConnectorByIds: jest.fn(),
  insertConnector: jest.fn(async (body) => body as Connector),
} satisfies Partial<Queries['connectors']>;
const {
  findConnectorById,
  countConnectorByConnectorId,
  deleteConnectorById,
  deleteConnectorByIds,
  insertConnector,
} = connectorQueries;

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

const { validateConfig } = await mockEsmWithActual('@logto/connector-kit', () => ({
  validateConfig: jest.fn(),
}));

const tenantContext = new MockTenant(
  undefined,
  { connectors: connectorQueries },
  {
    signInExperiences: { removeUnavailableSocialConnectorTargets },
    connectors: {
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
  }
);

const connectorRoutes = await pickDefault(import('./connector.js'));

describe('connector route', () => {
  const connectorRequest = createRequester({ authedRoutes: connectorRoutes, tenantContext });

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

  describe('POST /connectors', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should post a new connector record', async () => {
      loadConnectorFactories.mockResolvedValueOnce([
        {
          ...mockConnectorFactory,
          metadata: { ...mockConnectorFactory.metadata, id: 'connectorId' },
        },
      ]);
      countConnectorByConnectorId.mockResolvedValueOnce({ count: 0 });
      getLogtoConnectors.mockResolvedValueOnce([
        {
          dbEntry: { ...mockConnector, connectorId: 'id0' },
          metadata: { ...mockMetadata, id: 'id0' },
          type: ConnectorType.Sms,
          ...mockLogtoConnector,
        },
      ]);
      validateConfig.mockReturnValueOnce(null);
      buildRawConnector.mockResolvedValueOnce({ rawConnector: { configGuard: any() } });
      await connectorRequest.post('/connectors').send({
        connectorId: 'connectorId',
        config: { cliend_id: 'client_id', client_secret: 'client_secret' },
      });
      expect(insertConnector).toHaveBeenCalledWith(
        expect.objectContaining({
          connectorId: 'connectorId',
          config: { cliend_id: 'client_id', client_secret: 'client_secret' },
        })
      );
    });

    it('throw when create a new connector record with wrong config', async () => {
      loadConnectorFactories.mockResolvedValueOnce([
        {
          ...mockConnectorFactory,
          metadata: { ...mockConnectorFactory.metadata, id: 'connectorId' },
        },
      ]);
      countConnectorByConnectorId.mockResolvedValueOnce({ count: 0 });
      getLogtoConnectors.mockResolvedValueOnce([
        {
          dbEntry: { ...mockConnector, connectorId: 'id0' },
          metadata: { ...mockMetadata, id: 'id0' },
          type: ConnectorType.Sms,
          ...mockLogtoConnector,
        },
      ]);
      validateConfig.mockImplementationOnce((config: unknown) => {
        throw new ConnectorError(ConnectorErrorCodes.General);
      });
      buildRawConnector.mockResolvedValueOnce({ rawConnector: { configGuard: any() } });
      const response = await connectorRequest.post('/connectors').send({
        connectorId: 'connectorId',
        config: { cliend_id: 'client_id', client_secret: 'client_secret' },
      });
      expect(response).toHaveProperty('statusCode', 500);
    });

    it('throws when connector factory not found', async () => {
      loadConnectorFactories.mockResolvedValueOnce([
        {
          ...mockConnectorFactory,
          metadata: { ...mockConnectorFactory.metadata, id: 'connectorId' },
        },
      ]);
      const response = await connectorRequest.post('/connectors').send({
        connectorId: 'id0',
        config: { cliend_id: 'client_id', client_secret: 'client_secret' },
      });
      expect(response).toHaveProperty('statusCode', 422);
    });

    it('should post a new record when add more than 1 instance with standard connector factory', async () => {
      loadConnectorFactories.mockResolvedValueOnce([
        {
          ...mockConnectorFactory,
          metadata: {
            ...mockMetadata,
            id: 'id0',
            isStandard: true,
            platform: ConnectorPlatform.Universal,
          },
        },
      ]);
      countConnectorByConnectorId.mockResolvedValueOnce({ count: 1 });
      getLogtoConnectors.mockResolvedValueOnce([
        {
          dbEntry: { ...mockConnector, connectorId: 'id0' },
          metadata: { ...mockMetadata, id: 'id0', platform: ConnectorPlatform.Universal },
          type: ConnectorType.Social,
          ...mockLogtoConnector,
        },
      ]);
      validateConfig.mockReturnValueOnce(null);
      buildRawConnector.mockResolvedValueOnce({ rawConnector: { configGuard: any() } });
      await connectorRequest.post('/connectors').send({
        connectorId: 'id0',
        config: { cliend_id: 'client_id', client_secret: 'client_secret' },
        metadata: { target: 'new_target' },
      });
      expect(insertConnector).toHaveBeenCalledWith(
        expect.objectContaining({
          connectorId: 'id0',
          config: {
            cliend_id: 'client_id',
            client_secret: 'client_secret',
          },
          metadata: { target: 'new_target' },
        })
      );
    });

    it('throws when add more than 1 instance with target is an empty string with standard connector factory', async () => {
      loadConnectorFactories.mockResolvedValueOnce([
        {
          ...mockConnectorFactory,
          metadata: {
            ...mockMetadata,
            id: 'id0',
            isStandard: true,
            platform: ConnectorPlatform.Universal,
          },
        },
      ]);
      const response = await connectorRequest.post('/connectors').send({
        connectorId: 'id0',
        metadata: { target: '' },
      });
      expect(response).toHaveProperty('statusCode', 400);
    });

    it('throws when add more than 1 instance with non-standard connector factory', async () => {
      loadConnectorFactories.mockResolvedValueOnce([
        {
          ...mockConnectorFactory,
          metadata: { ...mockConnectorFactory.metadata, id: 'id0' },
        },
      ]);
      countConnectorByConnectorId.mockResolvedValueOnce({ count: 1 });
      const response = await connectorRequest.post('/connectors').send({
        connectorId: 'id0',
        config: { cliend_id: 'client_id', client_secret: 'client_secret' },
      });
      expect(response).toHaveProperty('statusCode', 422);
    });

    it('should add a new record and delete old records with same connector type when add passwordless connectors', async () => {
      loadConnectorFactories.mockResolvedValueOnce([
        {
          ...mockConnectorFactory,
          type: ConnectorType.Sms,
          metadata: { ...mockConnectorFactory.metadata, id: 'id1' },
        },
      ]);
      getLogtoConnectors.mockResolvedValueOnce([
        {
          dbEntry: { ...mockConnector, connectorId: 'id0' },
          metadata: { ...mockMetadata, id: 'id0' },
          type: ConnectorType.Sms,
          ...mockLogtoConnector,
        },
      ]);
      countConnectorByConnectorId.mockResolvedValueOnce({ count: 0 });
      validateConfig.mockReturnValueOnce(null);
      buildRawConnector.mockResolvedValueOnce({ rawConnector: { configGuard: any() } });
      await connectorRequest.post('/connectors').send({
        connectorId: 'id1',
        config: { cliend_id: 'client_id', client_secret: 'client_secret' },
      });
      expect(insertConnector).toHaveBeenCalledWith(
        expect.objectContaining({
          connectorId: 'id1',
          config: {
            cliend_id: 'client_id',
            client_secret: 'client_secret',
          },
        })
      );
      expect(deleteConnectorByIds).toHaveBeenCalledWith(['id']);
    });

    it('throws when add more than 1 social connector instance with same target and platform (add from standard connector)', async () => {
      loadConnectorFactories.mockResolvedValueOnce([
        {
          ...mockConnectorFactory,
          metadata: {
            ...mockConnectorFactory.metadata,
            id: 'id0',
            platform: ConnectorPlatform.Universal,
            isStandard: true,
          },
        },
      ]);
      countConnectorByConnectorId.mockResolvedValueOnce({ count: 0 });
      getLogtoConnectors.mockResolvedValueOnce([
        {
          dbEntry: { ...mockConnector, connectorId: 'id0', metadata: { target: 'target' } },
          metadata: {
            ...mockMetadata,
            id: 'id0',
            target: 'target',
            platform: ConnectorPlatform.Universal,
          },
          type: ConnectorType.Social,
          ...mockLogtoConnector,
        },
      ]);
      validateConfig.mockReturnValueOnce(null);
      buildRawConnector.mockResolvedValueOnce({ rawConnector: { configGuard: any() } });
      const response = await connectorRequest.post('/connectors').send({
        connectorId: 'id0',
        metadata: { target: 'target' },
      });
      expect(response).toHaveProperty('statusCode', 422);
    });

    it('throws when add more than 1 social connector instance with same target and platform (add social connector)', async () => {
      loadConnectorFactories.mockResolvedValueOnce([
        {
          ...mockConnectorFactory,
          metadata: {
            ...mockConnectorFactory.metadata,
            id: 'id0',
            platform: ConnectorPlatform.Universal,
            target: 'target',
          },
        },
      ]);
      countConnectorByConnectorId.mockResolvedValueOnce({ count: 0 });
      getLogtoConnectors.mockResolvedValueOnce([
        {
          dbEntry: { ...mockConnector, connectorId: 'id0', metadata: { target: 'target' } },
          metadata: {
            ...mockMetadata,
            id: 'id0',
            target: 'target',
            platform: ConnectorPlatform.Universal,
          },
          type: ConnectorType.Social,
          ...mockLogtoConnector,
        },
      ]);
      const response = await connectorRequest.post('/connectors').send({
        connectorId: 'id0',
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
      getLogtoConnectors.mockResolvedValueOnce([mockedSmsConnector]);
      const response = await connectorRequest
        .post('/connectors/id/test')
        .send({ phone: '12345678901', config: { test: 123 } });
      expect(sendMessage).toHaveBeenCalledTimes(1);
      expect(sendMessage).toHaveBeenCalledWith(
        {
          to: '12345678901',
          type: VerificationCodeType.Test,
          payload: {
            code: '000000',
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
      getLogtoConnectors.mockResolvedValueOnce([mockedEmailConnector]);
      const response = await connectorRequest
        .post('/connectors/id/test')
        .send({ email: 'test@email.com', config: { test: 123 } });
      expect(sendMessage).toHaveBeenCalledTimes(1);
      expect(sendMessage).toHaveBeenCalledWith(
        {
          to: 'test@email.com',
          type: VerificationCodeType.Test,
          payload: {
            code: '000000',
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
/* eslint-enable max-lines */
