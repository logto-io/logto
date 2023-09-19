import { ConnectorType } from '@logto/connector-kit';
import { demoAppApplicationId, InteractionEvent } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';

import { mockSignInExperience } from '#src/__mocks__/sign-in-experience.js';
import RequestError from '#src/errors/RequestError/index.js';
import type koaAuditLog from '#src/middleware/koa-audit-log.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import type { LogtoConnector } from '#src/utils/connectors/types.js';
import { createRequester } from '#src/utils/test-utils.js';

import { verificationPath, interactionPrefix } from './const.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

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

const { getInteractionStorage, storeInteractionResult } = await mockEsmWithActual(
  './utils/interaction.js',
  () => ({
    getInteractionStorage: jest.fn().mockReturnValue({
      event: InteractionEvent.SignIn,
    }),
    storeInteractionResult: jest.fn(),
  })
);

const { sendVerificationCodeToIdentifier } = await mockEsmWithActual(
  './utils/verification-code-validation.js',
  () => ({
    sendVerificationCodeToIdentifier: jest.fn(),
  })
);

const { createLog, prependAllLogEntries } = createMockLogContext();

await mockEsmWithActual(
  '#src/middleware/koa-audit-log.js',
  (): { default: typeof koaAuditLog } => ({
    // eslint-disable-next-line unicorn/consistent-function-scoping
    default: () => async (ctx, next) => {
      ctx.createLog = createLog;
      ctx.prependAllLogEntries = prependAllLogEntries;

      return next();
    },
  })
);

const baseProviderMock = {
  params: {},
  jti: 'jti',
  client_id: demoAppApplicationId,
};

const tenantContext = new MockTenant(
  createMockProvider(jest.fn().mockResolvedValue(baseProviderMock)),
  {
    signInExperiences: {
      findDefaultSignInExperience: jest.fn().mockResolvedValue(mockSignInExperience),
    },
  },
  {
    getLogtoConnectorById: async (connectorId: string) => {
      const connector = await getLogtoConnectorByIdHelper(connectorId);

      if (connector.type !== ConnectorType.Social) {
        throw new RequestError({
          code: 'entity.not_found',
          status: 404,
        });
      }

      // @ts-expect-error
      return connector as LogtoConnector;
    },
  }
);

const { default: interactionRoutes } = await import('./index.js');

describe('interaction routes', () => {
  const sessionRequest = createRequester({
    anonymousRoutes: interactionRoutes,
    tenantContext,
  });

  afterEach(() => {
    jest.clearAllMocks();

    getInteractionStorage.mockReturnValue({
      event: InteractionEvent.SignIn,
    });
  });

  describe('POST /interaction/verification/verification-code', () => {
    const path = `${interactionPrefix}/${verificationPath}/verification-code`;

    it('should call send verificationCode properly', async () => {
      const body = {
        email: 'email@logto.io',
      };

      const response = await sessionRequest.post(path).send(body);
      expect(getInteractionStorage).toBeCalled();
      expect(sendVerificationCodeToIdentifier).toBeCalledWith(
        {
          event: InteractionEvent.SignIn,
          ...body,
        },
        'jti',
        createLog,
        tenantContext.libraries.passcodes
      );
      expect(response.status).toEqual(204);
    });
  });

  describe('POST /verification/social/authorization-uri', () => {
    const path = `${interactionPrefix}/${verificationPath}/social-authorization-uri`;

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

  describe('POST /verification/totp', () => {
    const path = `${interactionPrefix}/${verificationPath}/totp`;

    it('should return the generated secret', async () => {
      const response = await sessionRequest.post(path).send();
      expect(getInteractionStorage).toBeCalled();
      expect(storeInteractionResult).toBeCalled();
      expect(response.statusCode).toEqual(200);
      expect(response.body).toHaveProperty('secret');
    });
  });
});
