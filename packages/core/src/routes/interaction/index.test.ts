import { ConnectorType } from '@logto/connector-kit';
import { InteractionEvent, demoAppApplicationId } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';

import { mockSignInExperience } from '#src/__mocks__/sign-in-experience.js';
import RequestError from '#src/errors/RequestError/index.js';
import type koaAuditLog from '#src/middleware/koa-audit-log.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;
const { mockEsm, mockEsmDefault, mockEsmWithActual } = createMockUtils(jest);

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

await mockEsmWithActual('#src/libraries/sign-in-experience/index.js', () => ({
  getSignInExperienceForApplication: jest.fn().mockResolvedValue(mockSignInExperience),
}));

const { assignInteractionResults } = await mockEsmWithActual('#src/libraries/session.js', () => ({
  assignInteractionResults: jest.fn(),
}));

const { verifySignInModeSettings, verifyIdentifierSettings, verifyProfileSettings } = mockEsm(
  './utils/sign-in-experience-validation.js',
  () => ({
    verifySignInModeSettings: jest.fn(),
    verifyIdentifierSettings: jest.fn(),
    verifyProfileSettings: jest.fn(),
  })
);

const submitInteraction = mockEsmDefault('./actions/submit-interaction.js', () => jest.fn());

const { verifyIdentifierPayload, verifyIdentifier, verifyProfile, validateMandatoryUserProfile } =
  await mockEsmWithActual('./verifications/index.js', () => ({
    verifyIdentifierPayload: jest.fn(),
    verifyIdentifier: jest.fn().mockResolvedValue({}),
    verifyProfile: jest.fn(),
    validateMandatoryUserProfile: jest.fn(),
  }));

const { storeInteractionResult, mergeIdentifiers, getInteractionStorage } = await mockEsmWithActual(
  './utils/interaction.js',
  () => ({
    mergeIdentifiers: jest.fn(),
    storeInteractionResult: jest.fn(),
    getInteractionStorage: jest.fn().mockReturnValue({
      event: InteractionEvent.SignIn,
    }),
  })
);

const { sendPasscodeToIdentifier } = await mockEsmWithActual(
  './utils/passcode-validation.js',
  () => ({
    sendPasscodeToIdentifier: jest.fn(),
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

const {
  default: interactionRoutes,
  verificationPath,
  interactionPrefix,
} = await import('./index.js');

describe('session -> interactionRoutes', () => {
  const baseProviderMock = {
    params: {},
    jti: 'jti',
    client_id: demoAppApplicationId,
  };
  const sessionRequest = createRequester({
    anonymousRoutes: interactionRoutes,
    provider: createMockProvider(jest.fn().mockResolvedValue(baseProviderMock)),
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('PUT /interaction', () => {
    const path = interactionPrefix;

    it('should call validations properly', async () => {
      const body = {
        event: InteractionEvent.SignIn,
        identifier: { email: 'email@logto.io', password: 'password' },
        profile: { phone: '1234567890' },
      };
      const response = await sessionRequest.put(path).send(body);
      expect(verifySignInModeSettings).toBeCalled();
      expect(verifyIdentifierSettings).toBeCalled();
      expect(verifyProfileSettings).toBeCalled();
      expect(verifyIdentifierPayload).toBeCalled();
      expect(storeInteractionResult).toBeCalled();
      expect(response.status).toEqual(204);
    });
  });

  describe('DELETE /interaction', () => {
    it('should call assignInteractionResult properly', async () => {
      await sessionRequest.delete(`${interactionPrefix}`);
      expect(assignInteractionResults).toBeCalled();
    });
  });

  describe('PUT /interaction/event', () => {
    const path = `${interactionPrefix}/event`;

    it('should call verifySignInModeSettings properly', async () => {
      getInteractionStorage.mockReturnValueOnce({
        event: InteractionEvent.SignIn,
      });
      const body = {
        event: InteractionEvent.Register,
      };

      const response = await sessionRequest.put(path).send(body);
      expect(getInteractionStorage).toBeCalled();
      expect(verifySignInModeSettings).toBeCalled();
      expect(storeInteractionResult).toBeCalled();
      expect(response.status).toEqual(204);
    });

    it('should reject if switch sign-in event to forgot-password directly', async () => {
      getInteractionStorage.mockReturnValueOnce({
        event: InteractionEvent.SignIn,
      });

      const body = {
        event: InteractionEvent.ForgotPassword,
      };

      const response = await sessionRequest.put(`${interactionPrefix}/event`).send(body);
      expect(verifySignInModeSettings).toBeCalled();
      expect(storeInteractionResult).not.toBeCalled();
      expect(response.status).toEqual(404);
    });

    it('should reject if switch forgot-password to sign-in directly', async () => {
      getInteractionStorage.mockReturnValueOnce({
        event: InteractionEvent.ForgotPassword,
      });

      const body = {
        event: InteractionEvent.SignIn,
      };

      const response = await sessionRequest.put(`${interactionPrefix}/event`).send(body);
      expect(verifySignInModeSettings).toBeCalled();
      expect(storeInteractionResult).not.toBeCalled();
      expect(response.status).toEqual(404);
    });
  });

  describe('PATCH /interaction/identifiers', () => {
    const path = `${interactionPrefix}/identifiers`;

    it('should update identifiers properly', async () => {
      const body = {
        email: 'email@logto.io',
        passcode: 'passcode',
      };
      const response = await sessionRequest.patch(path).send(body);
      expect(getInteractionStorage).toBeCalled();
      expect(verifyIdentifierPayload).toBeCalled();
      expect(mergeIdentifiers).toBeCalled();
      expect(storeInteractionResult).toBeCalled();
      // Supertest does not return the error body
      expect(response.status).toEqual(204);
    });
  });

  describe('/interaction/profile', () => {
    const path = `${interactionPrefix}/profile`;
    const sessionRequest = createRequester({
      anonymousRoutes: interactionRoutes,
      provider: createMockProvider(jest.fn().mockResolvedValue(baseProviderMock)),
    });

    it('PUT /interaction/profile', async () => {
      const body = {
        email: 'email@logto.io',
      };
      const response = await sessionRequest.put(path).send(body);
      expect(verifyProfileSettings).toBeCalled();
      expect(getInteractionStorage).toBeCalled();
      expect(storeInteractionResult).toBeCalled();
      expect(response.status).toEqual(204);
    });

    it('PATCH /interaction/profile', async () => {
      const body = {
        email: 'email@logto.io',
      };
      const response = await sessionRequest.patch(path).send(body);
      expect(verifyProfileSettings).toBeCalled();
      expect(getInteractionStorage).toBeCalled();
      expect(storeInteractionResult).toBeCalled();
      expect(response.status).toEqual(204);
    });

    it('DELETE /interaction/profile', async () => {
      const response = await sessionRequest.delete(path);
      expect(getInteractionStorage).toBeCalled();
      expect(storeInteractionResult).toBeCalled();
      expect(response.status).toEqual(204);
    });
  });

  describe('POST /interaction/verification/passcode', () => {
    const path = `${interactionPrefix}/${verificationPath}/passcode`;

    it('should call send passcode properly', async () => {
      const body = {
        email: 'email@logto.io',
      };

      const response = await sessionRequest.post(path).send(body);
      expect(getInteractionStorage).toBeCalled();
      expect(sendPasscodeToIdentifier).toBeCalledWith(
        {
          event: InteractionEvent.SignIn,
          ...body,
        },
        'jti',
        createLog
      );
      expect(response.status).toEqual(204);
    });
  });

  describe('submit interaction', () => {
    const path = `${interactionPrefix}/submit`;

    it('should call identifier and profile verification properly', async () => {
      await sessionRequest.post(path).send();
      expect(getInteractionStorage).toBeCalled();
      expect(verifyIdentifier).toBeCalled();
      expect(verifyProfile).toBeCalled();
      expect(validateMandatoryUserProfile).toBeCalled();
      expect(submitInteraction).toBeCalled();
    });

    it('should not call validateMandatoryUserProfile for forgot password request', async () => {
      getInteractionStorage.mockReturnValue({
        event: InteractionEvent.ForgotPassword,
      });

      await sessionRequest.post(path).send();
      expect(getInteractionStorage).toBeCalled();
      expect(verifyIdentifier).toBeCalled();
      expect(verifyProfile).toBeCalled();
      expect(validateMandatoryUserProfile).not.toBeCalled();
      expect(submitInteraction).toBeCalled();
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
});
