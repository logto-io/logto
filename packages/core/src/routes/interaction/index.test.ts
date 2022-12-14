import { ConnectorType } from '@logto/connector-kit';
import { Event } from '@logto/schemas';
import { demoAppApplicationId } from '@logto/schemas/lib/seeds/application.js';
import { mockEsm, mockEsmDefault, mockEsmWithActual, pickDefault } from '@logto/shared/esm';

import { mockSignInExperience } from '#src/__mocks__/sign-in-experience.js';
import RequestError from '#src/errors/RequestError/index.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';
import { createRequester } from '#src/utils/test-utils.js';

import type { InteractionContext } from './types/index.js';

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

mockEsm('#src/libraries/sign-in-experience/index.js', () => ({
  getSignInExperienceForApplication: jest.fn().mockResolvedValue(mockSignInExperience),
}));

const { verifyIdentifier, verifyProfile, validateMandatoryUserProfile } = mockEsm(
  './verifications/index.js',
  () => ({
    verifyIdentifier: jest.fn(),
    verifyProfile: jest.fn(),
    validateMandatoryUserProfile: jest.fn(),
  })
);

const { default: submitInteraction } = mockEsm('./actions/submit-interaction.js', () => ({
  default: jest.fn((_interaction, ctx: InteractionContext) => {
    ctx.body = { redirectUri: 'logto.io' };
  }),
}));

const { getInteractionStorage } = mockEsm('./utils/interaction.js', () => ({
  getInteractionStorage: jest.fn(),
}));

const log = jest.fn();

const koaInteractionBodyGuard = await pickDefault(
  import('./middleware/koa-interaction-body-guard.js')
);
const koaSessionSignInExperienceGuard = await pickDefault(
  import('./middleware/koa-session-sign-in-experience-guard.js')
);

const koaInteractionBodyGuardSpy = mockEsmDefault(
  './middleware/koa-interaction-body-guard.js',
  () => jest.fn(koaInteractionBodyGuard)
);

const koaSessionSignInExperienceGuardSpy = mockEsmDefault(
  './middleware/koa-session-sign-in-experience-guard.js',
  () => jest.fn(koaSessionSignInExperienceGuard)
);

const {
  default: interactionRoutes,
  verificationPrefix,
  interactionPrefix,
} = await import('./index.js');

describe('session -> interactionRoutes', () => {
  const sessionRequest = createRequester({
    anonymousRoutes: interactionRoutes,
    provider: createMockProvider(
      jest.fn().mockResolvedValue({ params: {}, jti: 'jti', client_id: demoAppApplicationId })
    ),
    middlewares: [
      async (ctx, next) => {
        ctx.addLogContext = jest.fn();
        ctx.log = log;

        return next();
      },
    ],
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('PUT /interaction', () => {
    const path = interactionPrefix;

    it('sign-in event should call methods properly', async () => {
      const body = {
        event: Event.SignIn,
        identifier: {
          username: 'username',
          password: 'password',
        },
      };
      const response = await sessionRequest.put(path).send(body);
      expect(koaInteractionBodyGuardSpy).toBeCalled();
      expect(koaSessionSignInExperienceGuardSpy).toBeCalled();
      expect(verifyIdentifier).toBeCalled();
      expect(verifyProfile).toBeCalled();
      expect(validateMandatoryUserProfile).toBeCalled();
      expect(submitInteraction).toBeCalled();
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ redirectUri: 'logto.io' });
    });

    it('forgot password event should not call UserProfile validation', async () => {
      const body = {
        event: Event.ForgotPassword,
        identifier: {
          email: 'email@logto.io',
          passcode: 'passcode',
        },
        profile: {
          password: 'password',
        },
      };

      const response = await sessionRequest.put(path).send(body);

      expect(verifyIdentifier).toBeCalled();
      expect(verifyProfile).toBeCalled();
      expect(validateMandatoryUserProfile).not.toBeCalled();
      expect(submitInteraction).toBeCalled();
      expect(response.status).toEqual(200);
    });
  });

  describe('PATCH /interaction', () => {
    const path = interactionPrefix;

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('sign-in event with register event interaction session in record should call methods properly', async () => {
      getInteractionStorage.mockResolvedValueOnce({ event: Event.Register });

      const body = {
        event: Event.SignIn,
      };

      const response = await sessionRequest.patch(path).send(body);
      expect(verifyIdentifier).toBeCalled();
      expect(verifyProfile).toBeCalled();
      expect(validateMandatoryUserProfile).toBeCalled();
      expect(submitInteraction).toBeCalled();
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ redirectUri: 'logto.io' });
    });

    it('sign-in event with forgot password event interaction session in record should reject', async () => {
      getInteractionStorage.mockResolvedValueOnce({ event: Event.ForgotPassword });

      const body = {
        event: Event.SignIn,
      };

      const response = await sessionRequest.patch(path).send(body);
      expect(verifyIdentifier).not.toBeCalled();
      expect(verifyProfile).not.toBeCalled();
      expect(validateMandatoryUserProfile).not.toBeCalled();
      expect(submitInteraction).not.toBeCalled();
      expect(response.status).toEqual(404);
    });

    it('Forgot event with forgot password event interaction session in record should call methods properly', async () => {
      getInteractionStorage.mockResolvedValueOnce({ event: Event.ForgotPassword });

      const body = {
        event: Event.ForgotPassword,
      };

      const response = await sessionRequest.patch(path).send(body);
      expect(verifyIdentifier).toBeCalled();
      expect(verifyProfile).toBeCalled();
      expect(validateMandatoryUserProfile).not.toBeCalled();
      expect(submitInteraction).toBeCalled();
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ redirectUri: 'logto.io' });
    });

    it('Forgot event with sign-in event interaction session in record should call methods properly', async () => {
      getInteractionStorage.mockResolvedValueOnce({ event: Event.SignIn });

      const body = {
        event: Event.ForgotPassword,
      };

      const response = await sessionRequest.patch(path).send(body);
      expect(verifyIdentifier).not.toBeCalled();
      expect(verifyProfile).not.toBeCalled();
      expect(validateMandatoryUserProfile).not.toBeCalled();
      expect(submitInteraction).not.toBeCalled();
      expect(response.status).toEqual(404);
    });
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
