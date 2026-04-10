import { InteractionEvent, type Mfa } from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';
import type { Middleware } from 'koa';
import type { IRouterParamContext } from 'koa-router';

import { mockSignInExperience } from '#src/__mocks__/sign-in-experience.js';
import { mockUser } from '#src/__mocks__/user.js';
import { EnvSet } from '#src/env-set/index.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);
const mockValidatePassword = jest.fn();

await mockEsmWithActual('./classes/libraries/password-validator.js', () => ({
  PasswordValidator: class {
    public async validatePassword(...args: unknown[]) {
      return mockValidatePassword(...args);
    }
  },
}));

const experienceRoutes = await pickDefault(import('./index.js'));

const createLogMiddleware = (): {
  middleware: Middleware<unknown, IRouterParamContext>;
  mockAppend: jest.Mock;
} => {
  const { createLog, prependAllLogEntries, mockAppend } = createMockLogContext();

  const middleware: Middleware<unknown, IRouterParamContext> = async (ctx, next) => {
    // @ts-expect-error -- mock log context
    ctx.createLog = createLog;
    // @ts-expect-error -- mock log context
    ctx.prependAllLogEntries = prependAllLogEntries;
    return next();
  };

  return { middleware, mockAppend };
};

const createRequesterWithMocks = ({
  interactionEvent = InteractionEvent.SignIn,
  user = mockUser,
  mfa = mockSignInExperience.mfa,
  singleSignOnEnabled = mockSignInExperience.singleSignOnEnabled,
  passwordExpiration = { enabled: false },
  interactionResult = {},
  persistInteractionResult = false,
}: {
  interactionEvent?: InteractionEvent;
  user?: typeof mockUser;
  mfa?: Mfa;
  singleSignOnEnabled?: boolean;
  passwordExpiration?: { enabled: boolean; validPeriodDays?: number; reminderPeriodDays?: number };
  interactionResult?: Record<string, unknown>;
  persistInteractionResult?: boolean;
} = {}) => {
  const mockedInteractionDetails: {
    params: { client_id: string };
    jti: string;
    result: Record<string, unknown>;
  } = {
    params: { client_id: 'client_id' },
    jti: 'jti',
    result: {
      interactionEvent,
      userId: user.id,
      ...interactionResult,
    },
  };
  const interactionDetails = jest.fn().mockImplementation(async () => mockedInteractionDetails);
  const provider = createMockProvider(interactionDetails);

  if (persistInteractionResult) {
    (provider.interactionResult as jest.Mock).mockImplementation(
      async (
        _request: unknown,
        _response: unknown,
        result: Record<string, unknown>,
        options?: { mergeWithLastSubmission?: boolean }
      ) => {
        // eslint-disable-next-line @silverhand/fp/no-mutation
        mockedInteractionDetails.result = options?.mergeWithLastSubmission
          ? { ...mockedInteractionDetails.result, ...result }
          : result;
        return 'redirectTo';
      }
    );
  }

  const userGeoLocations = {
    upsertUserGeoLocation: jest.fn().mockResolvedValue(null),
  };
  const userSignInCountries = {
    upsertUserSignInCountry: jest.fn().mockResolvedValue(null),
    pruneUserSignInCountriesByUserId: jest.fn().mockResolvedValue(null),
  };
  const users = {
    findUserById: jest.fn().mockResolvedValue(user),
    updateUserById: jest.fn().mockResolvedValue(user),
    hasUser: jest.fn().mockResolvedValue(false),
    hasUserWithEmail: jest.fn().mockResolvedValue(false),
    hasUserWithNormalizedPhone: jest.fn().mockResolvedValue(false),
    hasUserWithIdentity: jest.fn().mockResolvedValue(false),
  };
  const signInExperiences = {
    findDefaultSignInExperience: jest.fn().mockResolvedValue({
      ...mockSignInExperience,
      mfa,
      singleSignOnEnabled,
      passwordExpiration,
    }),
  };

  const tenant = new MockTenant(provider, {
    users,
    signInExperiences,
    userGeoLocations,
    userSignInCountries,
  });

  const { middleware: logMiddleware } = createLogMiddleware();
  const requester = createRequester({
    anonymousRoutes: experienceRoutes,
    tenantContext: tenant,
    middlewares: [logMiddleware],
  });

  return { requester, users };
};

describe('password expiration routes', () => {
  const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;
  const setDevFeaturesEnabled = (enabled: boolean) => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled = enabled;
  };

  afterEach(() => {
    setDevFeaturesEnabled(originalIsDevFeaturesEnabled);
    jest.useRealTimers();
    mockValidatePassword.mockClear();
  });

  it('should return 422 on submit when password is expired', async () => {
    setDevFeaturesEnabled(true);
    const now = new Date('2026-01-10T00:00:00.000Z');
    jest.useFakeTimers().setSystemTime(now);
    const { requester } = createRequesterWithMocks({
      user: {
        ...mockUser,
        passwordUpdatedAt: now.getTime() - 30 * 24 * 60 * 60 * 1000,
      },
      passwordExpiration: {
        enabled: true,
        validPeriodDays: 30,
        reminderPeriodDays: 5,
      },
    });

    const response = await requester.post('/experience/submit');
    expect(response.status).toBe(422);
  });

  it('should return 422 on submit when password expiration reminder is required', async () => {
    setDevFeaturesEnabled(true);
    const now = new Date('2026-01-10T00:00:00.000Z');
    jest.useFakeTimers().setSystemTime(now);
    const { requester } = createRequesterWithMocks({
      user: {
        ...mockUser,
        passwordUpdatedAt: now.getTime() - 28 * 24 * 60 * 60 * 1000,
      },
      passwordExpiration: {
        enabled: true,
        validPeriodDays: 30,
        reminderPeriodDays: 5,
      },
    });

    const response = await requester.post('/experience/submit');
    expect(response.status).toBe(422);
  });

  it('should allow submit after skipping password reminder', async () => {
    setDevFeaturesEnabled(true);
    const now = new Date('2026-01-10T00:00:00.000Z');
    jest.useFakeTimers().setSystemTime(now);
    const { requester } = createRequesterWithMocks({
      user: {
        ...mockUser,
        passwordUpdatedAt: now.getTime() - 28 * 24 * 60 * 60 * 1000,
      },
      passwordExpiration: {
        enabled: true,
        validPeriodDays: 30,
        reminderPeriodDays: 5,
      },
      persistInteractionResult: true,
    });

    const submitResponse = await requester.post('/experience/submit');
    expect(submitResponse.status).toBe(422);

    const skipResponse = await requester.post('/experience/password-expiration/skip');
    expect(skipResponse.status).toBe(204);

    const retryResponse = await requester.post('/experience/submit');
    expect(retryResponse.status).toBe(200);
  });

  it('should allow submit after resetting expired password', async () => {
    setDevFeaturesEnabled(true);
    const now = new Date('2026-01-10T00:00:00.000Z');
    const newPassword = 'V@lidPassword123!';
    jest.useFakeTimers().setSystemTime(now);
    const expiredUser = {
      ...mockUser,
      passwordUpdatedAt: now.getTime() - 30 * 24 * 60 * 60 * 1000,
    };
    const updatedUser = { ...expiredUser, passwordUpdatedAt: now.getTime() };
    const { requester, users } = createRequesterWithMocks({
      user: expiredUser,
      passwordExpiration: {
        enabled: true,
        validPeriodDays: 30,
        reminderPeriodDays: 5,
      },
      persistInteractionResult: true,
    });
    users.findUserById
      .mockResolvedValueOnce(expiredUser)
      .mockResolvedValueOnce(expiredUser)
      .mockResolvedValueOnce(updatedUser);
    users.updateUserById.mockResolvedValueOnce(updatedUser);

    const submitResponse = await requester.post('/experience/submit');
    expect(submitResponse.status).toBe(422);

    const resetResponse = await requester
      .put('/experience/password-expiration/reset')
      .send({ password: newPassword });
    expect(resetResponse.status).toBe(204);
    expect(mockValidatePassword).toHaveBeenCalled();
    expect(users.updateUserById).toHaveBeenCalledWith(
      mockUser.id,
      expect.objectContaining({ passwordUpdatedAt: now.getTime() })
    );

    const retryResponse = await requester.post('/experience/submit');
    expect(retryResponse.status).toBe(200);
  });

  it('should return 400 when resetting password expiration outside sign-in interaction', async () => {
    const { requester } = createRequesterWithMocks({ interactionEvent: InteractionEvent.Register });
    const response = await requester
      .put('/experience/password-expiration/reset')
      .send({ password: 'Password123' });

    expect(response.status).toBe(400);
  });

  it('should return 404 when resetting password expiration without identified user', async () => {
    const { requester } = createRequesterWithMocks({
      interactionResult: {
        userId: undefined,
      },
    });
    const response = await requester
      .put('/experience/password-expiration/reset')
      .send({ password: 'Password123' });

    expect(response.status).toBe(404);
  });

  it('should return 403 when resetting password expiration without expired interaction state', async () => {
    const { requester, users } = createRequesterWithMocks();
    const response = await requester
      .put('/experience/password-expiration/reset')
      .send({ password: 'Password123' });

    expect(response.status).toBe(403);
    expect(users.updateUserById).not.toHaveBeenCalled();
  });
});
