import { InteractionEvent } from '@logto/schemas';
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

const createLogMiddleware = (): Middleware<unknown, IRouterParamContext> => {
  const { createLog, prependAllLogEntries } = createMockLogContext();

  return async (ctx, next) => {
    // @ts-expect-error -- mock log context
    ctx.createLog = createLog;
    // @ts-expect-error -- mock log context
    ctx.prependAllLogEntries = prependAllLogEntries;
    return next();
  };
};

const createRequesterWithMocks = ({
  interactionEvent = InteractionEvent.SignIn,
  adaptiveMfaEnabled = true,
}: {
  interactionEvent?: InteractionEvent;
  adaptiveMfaEnabled?: boolean;
} = {}) => {
  const interactionDetails = jest.fn().mockResolvedValue({
    params: { client_id: 'client_id' },
    jti: 'jti',
    result: {
      interactionEvent,
      userId: mockUser.id,
    },
  });

  const userGeoLocations = {
    upsertUserGeoLocation: jest.fn().mockResolvedValue(null),
  };
  const userSignInCountries = {
    upsertUserSignInCountry: jest.fn().mockResolvedValue(null),
    pruneUserSignInCountriesByUserId: jest.fn().mockResolvedValue(null),
  };
  const users = {
    findUserById: jest.fn().mockResolvedValue(mockUser),
    updateUserById: jest.fn().mockResolvedValue(mockUser),
  };
  const signInExperiences = {
    findDefaultSignInExperience: jest.fn().mockResolvedValue({
      ...mockSignInExperience,
      adaptiveMfa: { enabled: adaptiveMfaEnabled },
    }),
  };

  const tenant = new MockTenant(createMockProvider(interactionDetails), {
    users,
    signInExperiences,
    userGeoLocations,
    userSignInCountries,
  });

  const requester = createRequester({
    anonymousRoutes: experienceRoutes,
    tenantContext: tenant,
    middlewares: [createLogMiddleware()],
  });

  return { requester, userGeoLocations, userSignInCountries };
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

  it('should skip invalid country codes but record coordinates', async () => {
    setDevFeaturesEnabled(true);
    const { requester, userGeoLocations, userSignInCountries } = createRequesterWithMocks();

    const response = await requester
      .post('/experience/submit')
      .set('x-logto-cf-country', 'JPN')
      .set('x-logto-cf-latitude', '35.6762')
      .set('x-logto-cf-longitude', '139.6503');

    expect(response.status).toBe(200);
    expect(userGeoLocations.upsertUserGeoLocation).toHaveBeenCalledWith(
      mockUser.id,
      35.6762,
      139.6503
    );
    expect(userSignInCountries.upsertUserSignInCountry).toHaveBeenCalled();
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

  it('should skip recording when adaptive MFA is disabled', async () => {
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
    expect(userGeoLocations.upsertUserGeoLocation).not.toHaveBeenCalled();
    expect(userSignInCountries.upsertUserSignInCountry).not.toHaveBeenCalled();
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
});
