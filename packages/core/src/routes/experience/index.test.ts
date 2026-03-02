/* eslint-disable max-lines */
import { TemplateType } from '@logto/connector-kit';
import {
  InteractionEvent,
  MfaFactor,
  SignInIdentifier,
  VerificationType,
  type Mfa,
} from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';
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
  adaptiveMfaEnabled = false,
  user = mockUser,
  mfa = mockSignInExperience.mfa,
  singleSignOnEnabled = mockSignInExperience.singleSignOnEnabled,
  interactionResult = {},
  persistInteractionResult = false,
}: {
  interactionEvent?: InteractionEvent;
  adaptiveMfaEnabled?: boolean;
  user?: typeof mockUser;
  mfa?: Mfa;
  singleSignOnEnabled?: boolean;
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
      adaptiveMfa: { enabled: adaptiveMfaEnabled },
      mfa,
      singleSignOnEnabled,
    }),
  };

  const tenant = new MockTenant(provider, {
    users,
    signInExperiences,
    userGeoLocations,
    userSignInCountries,
  });

  const { middleware: logMiddleware, mockAppend } = createLogMiddleware();
  const requester = createRequester({
    anonymousRoutes: experienceRoutes,
    tenantContext: tenant,
    middlewares: [logMiddleware],
  });

  return { requester, userGeoLocations, userSignInCountries, mockAppend, users };
};

describe('POST /experience/submit', () => {
  const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;
  const setDevFeaturesEnabled = (enabled: boolean) => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled = enabled;
  };

  afterEach(() => {
    setDevFeaturesEnabled(originalIsDevFeaturesEnabled);
  });

  it('should skip geo context recording when dev features are disabled', async () => {
    setDevFeaturesEnabled(false);
    const { requester, userGeoLocations, userSignInCountries } = createRequesterWithMocks();

    const response = await requester
      .post('/experience/submit')
      .set('x-logto-cf-country', 'JP')
      .set('x-logto-cf-latitude', '35.6762')
      .set('x-logto-cf-longitude', '139.6503');

    expect(response.status).toBe(200);
    expect(userGeoLocations.upsertUserGeoLocation).not.toHaveBeenCalled();
    expect(userSignInCountries.upsertUserSignInCountry).not.toHaveBeenCalled();
  });

  it('should record geo location and sign-in country after successful sign-in', async () => {
    setDevFeaturesEnabled(true);
    const { requester, userGeoLocations, userSignInCountries } = createRequesterWithMocks();

    const response = await requester
      .post('/experience/submit')
      .set('x-logto-cf-country', 'JP')
      .set('x-logto-cf-latitude', '35.6762')
      .set('x-logto-cf-longitude', '139.6503');

    expect(response.status).toBe(200);
    expect(userGeoLocations.upsertUserGeoLocation).toHaveBeenCalledWith(
      mockUser.id,
      35.6762,
      139.6503
    );
    expect(userSignInCountries.upsertUserSignInCountry).toHaveBeenCalledWith(mockUser.id, 'JP');
  });

  it('should append adaptive MFA context to submit audit log', async () => {
    setDevFeaturesEnabled(true);
    const { requester, mockAppend } = createRequesterWithMocks({ adaptiveMfaEnabled: true });

    const response = await requester
      .post('/experience/submit')
      .set('x-logto-cf-country', 'JP')
      .set('x-logto-cf-latitude', '35.6762')
      .set('x-logto-cf-longitude', '139.6503')
      .set('x-logto-cf-bot-score', '42')
      .set('x-logto-cf-bot-verified', 'true');

    expect(response.status).toBe(200);
    expect(mockAppend).toHaveBeenCalledWith(
      expect.objectContaining({
        adaptiveMfaContext: {
          location: {
            country: 'JP',
            latitude: 35.6762,
            longitude: 139.6503,
          },
          ipRiskSignals: {
            botScore: 42,
            botVerified: true,
          },
        },
      })
    );
  });

  it('should append adaptive MFA result to submit audit log', async () => {
    setDevFeaturesEnabled(true);
    const { requester, mockAppend } = createRequesterWithMocks({ adaptiveMfaEnabled: true });

    const response = await requester.post('/experience/submit').set('x-logto-cf-bot-score', '10');

    expect(response.status).toBe(200);
    const adaptiveMfaResult = mockAppend.mock.calls
      .map(
        ([payload]) =>
          (payload as { adaptiveMfaResult?: { requiresMfa: boolean; triggeredRules: unknown[] } })
            .adaptiveMfaResult
      )
      .find(Boolean);

    expect(adaptiveMfaResult?.requiresMfa).toBe(true);
    expect(adaptiveMfaResult?.triggeredRules).toEqual(
      expect.arrayContaining([expect.objectContaining({ rule: 'untrusted_ip' })])
    );
  });

  it('should allow zero coordinates and record them', async () => {
    setDevFeaturesEnabled(true);
    const { requester, userGeoLocations } = createRequesterWithMocks();

    const response = await requester
      .post('/experience/submit')
      .set('x-logto-cf-country', 'JP')
      .set('x-logto-cf-latitude', '0')
      .set('x-logto-cf-longitude', '0');

    expect(response.status).toBe(200);
    expect(userGeoLocations.upsertUserGeoLocation).toHaveBeenCalledWith(mockUser.id, 0, 0);
  });

  it('should skip invalid coordinates but still record valid country', async () => {
    setDevFeaturesEnabled(true);
    const { requester, userGeoLocations, userSignInCountries } = createRequesterWithMocks();

    const response = await requester
      .post('/experience/submit')
      .set('x-logto-cf-country', 'JP')
      .set('x-logto-cf-latitude', 'abc')
      .set('x-logto-cf-longitude', '181');

    expect(response.status).toBe(200);
    expect(userGeoLocations.upsertUserGeoLocation).not.toHaveBeenCalled();
    expect(userSignInCountries.upsertUserSignInCountry).toHaveBeenCalledWith(mockUser.id, 'JP');
  });

  it('should skip out-of-range latitude but still record valid country', async () => {
    setDevFeaturesEnabled(true);
    const { requester, userGeoLocations, userSignInCountries } = createRequesterWithMocks();

    const response = await requester
      .post('/experience/submit')
      .set('x-logto-cf-country', 'JP')
      .set('x-logto-cf-latitude', '91')
      .set('x-logto-cf-longitude', '10');

    expect(response.status).toBe(200);
    expect(userGeoLocations.upsertUserGeoLocation).not.toHaveBeenCalled();
    expect(userSignInCountries.upsertUserSignInCountry).toHaveBeenCalledWith(mockUser.id, 'JP');
  });

  it('should skip invalid country codes but record coordinates', async () => {
    setDevFeaturesEnabled(true);
    const invalidCountries = ['JPN', 'jpn'];

    for (const country of invalidCountries) {
      const { requester, userGeoLocations, userSignInCountries } = createRequesterWithMocks();

      // eslint-disable-next-line no-await-in-loop
      const response = await requester
        .post('/experience/submit')
        .set('x-logto-cf-country', country)
        .set('x-logto-cf-latitude', '35.6762')
        .set('x-logto-cf-longitude', '139.6503');

      expect(response.status).toBe(200);
      expect(userGeoLocations.upsertUserGeoLocation).toHaveBeenCalledWith(
        mockUser.id,
        35.6762,
        139.6503
      );
      expect(userSignInCountries.upsertUserSignInCountry).toHaveBeenCalledWith(
        mockUser.id,
        undefined
      );
    }
  });

  it('should normalize lowercase country codes', async () => {
    setDevFeaturesEnabled(true);
    const { requester, userSignInCountries } = createRequesterWithMocks();

    const response = await requester
      .post('/experience/submit')
      .set('x-logto-cf-country', 'jp')
      .set('x-logto-cf-latitude', '35.6762')
      .set('x-logto-cf-longitude', '139.6503');

    expect(response.status).toBe(200);
    expect(userSignInCountries.upsertUserSignInCountry).toHaveBeenCalledWith(mockUser.id, 'JP');
  });

  it('should record country when coordinates are missing', async () => {
    setDevFeaturesEnabled(true);
    const { requester, userGeoLocations, userSignInCountries } = createRequesterWithMocks();

    const response = await requester.post('/experience/submit').set('x-logto-cf-country', 'JP');

    expect(response.status).toBe(200);
    expect(userGeoLocations.upsertUserGeoLocation).not.toHaveBeenCalled();
    expect(userSignInCountries.upsertUserSignInCountry).toHaveBeenCalledWith(mockUser.id, 'JP');
  });

  it('should skip recording coordinates when only latitude is provided', async () => {
    setDevFeaturesEnabled(true);
    const { requester, userGeoLocations, userSignInCountries } = createRequesterWithMocks();

    const response = await requester
      .post('/experience/submit')
      .set('x-logto-cf-latitude', '51.5074');

    expect(response.status).toBe(200);
    expect(userGeoLocations.upsertUserGeoLocation).not.toHaveBeenCalled();
    expect(userSignInCountries.upsertUserSignInCountry).toHaveBeenCalledWith(
      mockUser.id,
      undefined
    );
  });

  it('should record coordinates when country is missing', async () => {
    setDevFeaturesEnabled(true);
    const { requester, userGeoLocations, userSignInCountries } = createRequesterWithMocks();

    const response = await requester
      .post('/experience/submit')
      .set('x-logto-cf-latitude', '51.5074')
      .set('x-logto-cf-longitude', '-0.1278');

    expect(response.status).toBe(200);
    expect(userGeoLocations.upsertUserGeoLocation).toHaveBeenCalledWith(
      mockUser.id,
      51.5074,
      -0.1278
    );
    expect(userSignInCountries.upsertUserSignInCountry).toHaveBeenCalledWith(
      mockUser.id,
      undefined
    );
  });

  it('should skip recording when no geo headers are provided', async () => {
    setDevFeaturesEnabled(true);
    const { requester, userGeoLocations, userSignInCountries } = createRequesterWithMocks();

    const response = await requester.post('/experience/submit');

    expect(response.status).toBe(200);
    expect(userGeoLocations.upsertUserGeoLocation).not.toHaveBeenCalled();
    expect(userSignInCountries.upsertUserSignInCountry).not.toHaveBeenCalled();
  });

  it('should record geo context when adaptive MFA is disabled', async () => {
    setDevFeaturesEnabled(true);
    const { requester, userGeoLocations, userSignInCountries } = createRequesterWithMocks({
      adaptiveMfaEnabled: false,
    });

    const response = await requester
      .post('/experience/submit')
      .set('x-logto-cf-country', 'JP')
      .set('x-logto-cf-latitude', '35.6762')
      .set('x-logto-cf-longitude', '139.6503');

    expect(response.status).toBe(200);
    expect(userGeoLocations.upsertUserGeoLocation).toHaveBeenCalledWith(
      mockUser.id,
      35.6762,
      139.6503
    );
    expect(userSignInCountries.upsertUserSignInCountry).toHaveBeenCalledWith(mockUser.id, 'JP');
  });

  it('should skip recording for non-sign-in interactions', async () => {
    setDevFeaturesEnabled(true);
    const { requester, userGeoLocations, userSignInCountries } = createRequesterWithMocks({
      interactionEvent: InteractionEvent.Register,
    });

    const response = await requester
      .post('/experience/submit')
      .set('x-logto-cf-country', 'JP')
      .set('x-logto-cf-latitude', '35.6762')
      .set('x-logto-cf-longitude', '139.6503');

    expect(response.status).toBe(200);
    expect(userGeoLocations.upsertUserGeoLocation).not.toHaveBeenCalled();
    expect(userSignInCountries.upsertUserSignInCountry).not.toHaveBeenCalled();
  });

  it.each([
    {
      name: 'email',
      factor: MfaFactor.EmailVerificationCode,
      verificationType: VerificationType.EmailVerificationCode,
      identifierType: SignInIdentifier.Email,
      identifierValue: 'bind-mfa@logto.dev',
      updatePatch: { primaryEmail: 'bind-mfa@logto.dev' },
    },
    {
      name: 'phone',
      factor: MfaFactor.PhoneVerificationCode,
      verificationType: VerificationType.PhoneVerificationCode,
      identifierType: SignInIdentifier.Phone,
      identifierValue: '13100000000',
      updatePatch: { primaryPhone: '13100000000' },
    },
  ])(
    'should allow adaptive MFA submit after binding $name via /experience/profile/mfa',
    async ({ factor, verificationType, identifierType, identifierValue, updatePatch }) => {
      setDevFeaturesEnabled(true);
      const verificationId = `mock-${identifierType}-verification-id`;
      const user = {
        ...mockUser,
        primaryEmail: null,
        primaryPhone: null,
        mfaVerifications: [],
      };

      const { requester, users, mockAppend } = createRequesterWithMocks({
        adaptiveMfaEnabled: true,
        user,
        mfa: {
          policy: mockSignInExperience.mfa.policy,
          factors: [factor],
        },
        singleSignOnEnabled: false,
        interactionResult: {
          verificationRecords: [
            {
              id: verificationId,
              type: verificationType,
              identifier: {
                type: identifierType,
                value: identifierValue,
              },
              templateType: TemplateType.BindMfa,
              verified: true,
            },
          ],
        },
        persistInteractionResult: true,
      });

      const bindResponse = await requester.post('/experience/profile/mfa').send({
        type: factor,
        verificationId,
      });
      expect(bindResponse.status).toBe(204);

      const submitResponse = await requester
        .post('/experience/submit')
        .set('x-logto-cf-bot-score', '10');
      expect(submitResponse.status).toBe(200);

      expect(users.updateUserById).toHaveBeenCalledWith(
        user.id,
        expect.objectContaining(updatePatch)
      );
      const adaptiveMfaResult = mockAppend.mock.calls
        .map(
          ([payload]) =>
            (payload as { adaptiveMfaResult?: { requiresMfa: boolean } }).adaptiveMfaResult
        )
        .find(Boolean);
      expect(adaptiveMfaResult?.requiresMfa).toBe(true);
    }
  );
});
/* eslint-enable max-lines */
