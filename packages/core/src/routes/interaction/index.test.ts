import { ConnectorType } from '@logto/connector-kit';
import { Event, demoAppApplicationId } from '@logto/schemas';
import { mockEsmWithActual, mockEsmDefault } from '@logto/shared/esm';

import RequestError from '#src/errors/RequestError/index.js';
import type koaAuditLog from '#src/middleware/koa-audit-log.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

// FIXME @Darcy: no more `enabled` for `connectors` table
const getLogtoConnectorByIdHelper = jest.fn(async (connectorId: string) => {
  const metadata = {
    id:
      connectorId === 'social_enabled'
        ? 'social_enabled'
        : connectorId === 'social_disabled'
        ? 'social_disabled'
        : 'others',
  };

  return {
    dbEntry: {},
    metadata,
    type: connectorId.startsWith('social') ? ConnectorType.Social : ConnectorType.Sms,
    getAuthorizationUri: jest.fn(async () => ''),
  };
});

await mockEsmWithActual('#src/connectors/index.js', () => ({
  getLogtoConnectorById: jest.fn(async (connectorId: string) => {
    const connector = await getLogtoConnectorByIdHelper(connectorId);

    if (connector.type !== ConnectorType.Social) {
      throw new RequestError({
        code: 'entity.not_found',
        status: 404,
      });
    }

    return connector;
  }),
}));

const { sendPasscodeToIdentifier } = await mockEsmWithActual(
  './utils/passcode-validation.js',
  () => ({
    sendPasscodeToIdentifier: jest.fn(),
  })
);

const { createLog, prependAllLogEntries } = createMockLogContext();

mockEsmDefault(
  '#src/middleware/koa-audit-log.js',
  // eslint-disable-next-line unicorn/consistent-function-scoping
  (): typeof koaAuditLog => () => async (ctx, next) => {
    ctx.createLog = createLog;
    ctx.prependAllLogEntries = prependAllLogEntries;

    return next();
  }
);

const {
  default: interactionRoutes,
  verificationPrefix,
  interactionPrefix,
} = await import('./index.js');

describe('session -> interactionRoutes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /interaction/verification/passcode', () => {
    const sessionRequest = createRequester({
      anonymousRoutes: interactionRoutes,
      provider: createMockProvider(
        jest.fn().mockResolvedValue({
          params: {},
          jti: 'jti',
          client_id: demoAppApplicationId,
          result: { event: Event.SignIn },
        })
      ),
    });
    const path = `${interactionPrefix}${verificationPrefix}/passcode`;
    it('should call send passcode properly', async () => {
      const body = {
        event: Event.SignIn,
        email: 'email@logto.io',
      };

      const response = await sessionRequest.post(path).send(body);
      expect(sendPasscodeToIdentifier).toBeCalledWith(body, 'jti', createLog);
      expect(response.status).toEqual(204);
    });
  });

  describe('POST /verification/social/authorization-uri', () => {
    const sessionRequest = createRequester({
      anonymousRoutes: interactionRoutes,
      provider: createMockProvider(
        jest.fn().mockResolvedValue({
          params: {},
          jti: 'jti',
          client_id: demoAppApplicationId,
          result: { event: Event.SignIn },
        })
      ),
    });
    const path = `${interactionPrefix}${verificationPrefix}/social-authorization-uri`;

    it('should throw when redirectURI is invalid', async () => {
      const response = await sessionRequest.post(path).send({
        connectorId: 'social_enabled',
        state: 'state',
        redirectUri: 'logto.dev',
      });
      expect(response.statusCode).toEqual(400);
    });

    it('should return the authorization-uri properly', async () => {
      const response = await sessionRequest.post(path).send({
        connectorId: 'social_enabled',
        state: 'state',
        redirectUri: 'https://logto.dev',
      });

      expect(response.statusCode).toEqual(200);
      expect(response.body).toHaveProperty('redirectTo', '');
    });

    it('throw error when sign-in with social but miss state', async () => {
      const response = await sessionRequest.post(path).send({
        connectorId: 'social_enabled',
        redirectUri: 'https://logto.dev',
      });
      expect(response.statusCode).toEqual(400);
    });

    it('throw error when sign-in with social but miss redirectUri', async () => {
      const response = await sessionRequest.post(path).send({
        connectorId: 'social_enabled',
        state: 'state',
      });
      expect(response.statusCode).toEqual(400);
    });

    it('throw error when no social connector is found', async () => {
      const response = await sessionRequest.post(path).send({
        connectorId: 'others',
        state: 'state',
        redirectUri: 'https://logto.dev',
      });
      expect(response.statusCode).toEqual(404);
    });
  });
});
