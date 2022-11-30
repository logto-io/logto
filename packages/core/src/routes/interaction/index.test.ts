import { ConnectorType } from '@logto/connector-kit';
import { Event } from '@logto/schemas';
import { Provider } from 'oidc-provider';

import RequestError from '#src/errors/RequestError/index.js';
import { createRequester } from '#src/utils/test-utils.js';

import interactionRoutes, { verificationPrefix } from './index.js';
import { sendPasscodeToIdentifier } from './utils/passcode-validation.js';

// FIXME @Darcy: no more `enabled` for `connectors` table
const getLogtoConnectorByIdHelper = jest.fn(async (connectorId: string) => {
  const database = {
    enabled: connectorId === 'social_enabled',
  };
  const metadata = {
    id:
      connectorId === 'social_enabled'
        ? 'social_enabled'
        : connectorId === 'social_disabled'
        ? 'social_disabled'
        : 'others',
  };

  return {
    dbEntry: database,
    metadata,
    type: connectorId.startsWith('social') ? ConnectorType.Social : ConnectorType.Sms,
    getAuthorizationUri: jest.fn(async () => ''),
  };
});

jest.mock('#src/connectors.js', () => ({
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

jest.mock('./utils/passcode-validation.js', () => ({
  sendPasscodeToIdentifier: jest.fn(),
}));

jest.mock('oidc-provider', () => ({
  Provider: jest.fn(() => ({
    interactionDetails: jest.fn().mockResolvedValue({
      jti: 'jti',
    }),
  })),
}));

const log = jest.fn();

describe('session -> interactionRoutes', () => {
  const sessionRequest = createRequester({
    anonymousRoutes: interactionRoutes,
    provider: new Provider(''),
    middlewares: [
      async (ctx, next) => {
        ctx.addLogContext = jest.fn();
        ctx.log = log;

        return next();
      },
    ],
  });

  describe('POST /verification/passcode', () => {
    const path = `${verificationPrefix}/passcode`;
    it('should call send passcode properly', async () => {
      const body = {
        event: Event.SignIn,
        email: 'email@logto.io',
      };

      const response = await sessionRequest.post(path).send(body);
      expect(sendPasscodeToIdentifier).toBeCalledWith(body, 'jti', log);
      expect(response.status).toEqual(204);
    });
  });

  describe('POST /verification/social/authorization-uri', () => {
    const path = `${verificationPrefix}/social/authorization-uri`;

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
