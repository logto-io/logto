import { type User } from '@logto/schemas';

import { mockUser } from '#src/__mocks__/user.js';
import { EnvSet } from '#src/env-set/index.js';

import type { SignInExperienceValidator } from '../sign-in-experience-validator.js';

import { AdaptiveMfaValidator } from './index.js';

const { jest } = import.meta;
const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;
const setDevFeaturesEnabled = (value: boolean) => {
  // eslint-disable-next-line @silverhand/fp/no-mutation
  (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled = value;
};

const createQueries = (overrides?: {
  recentCountries?: Array<{ country: string; lastSignInAt: number }>;
  geoLocation?: { latitude: number; longitude: number } | undefined;
}) => {
  return {
    userSignInCountries: {
      upsertUserSignInCountry: jest.fn(),
      findRecentSignInCountriesByUserId: jest
        .fn()
        .mockResolvedValue(overrides?.recentCountries ?? []),
      pruneUserSignInCountriesByUserId: jest.fn(),
    },
    userGeoLocations: {
      findUserGeoLocationByUserId: jest.fn().mockResolvedValue(overrides?.geoLocation ?? null),
      upsertUserGeoLocation: jest.fn(),
    },
  };
};

const createSignInExperienceValidator = (
  enabled = true,
  thresholds?: {
    geoVelocityKmh?: number;
    longInactivityDays?: number;
    newCountryWindowDays?: number;
    minBotScore?: number;
  }
) =>
  ({
    getSignInExperienceData: jest.fn().mockResolvedValue({
      adaptiveMfa: { enabled, ...(thresholds && { thresholds }) },
    }),
  }) as unknown as SignInExperienceValidator;

describe('AdaptiveMfaValidator', () => {
  beforeEach(() => {
    setDevFeaturesEnabled(true);
  });

  afterAll(() => {
    setDevFeaturesEnabled(originalIsDevFeaturesEnabled);
  });

  it('triggers new country rule when current country is not in recent list', async () => {
    const now = new Date('2024-01-02T00:00:00Z');
    const user: User = {
      ...mockUser,
      lastSignInAt: now.getTime() - 60 * 60 * 1000,
    };
    const queries = createQueries({
      recentCountries: [
        {
          country: 'US',
          lastSignInAt: now.getTime() - 2 * 60 * 60 * 1000,
        },
      ],
    });

    const validator = new AdaptiveMfaValidator({
      queries,
      signInExperienceValidator: createSignInExperienceValidator(),
    });

    const result = await validator.getResult(user, {
      now,
      currentContext: { location: { country: 'FR' } },
    });

    expect(result?.requiresMfa).toBe(true);
    expect(result?.triggeredRules).toEqual(
      expect.arrayContaining([expect.objectContaining({ rule: 'new_country' })])
    );
  });

  it('triggers geo velocity rule when travel speed exceeds threshold', async () => {
    const now = new Date('2024-01-02T00:00:00Z');
    const user: User = {
      ...mockUser,
      lastSignInAt: now.getTime() - 2 * 60 * 60 * 1000,
    };
    const queries = createQueries({
      recentCountries: [
        {
          country: 'DE',
          lastSignInAt: now.getTime() - 3 * 60 * 60 * 1000,
        },
      ],
      geoLocation: { latitude: 0, longitude: 0 },
    });

    const validator = new AdaptiveMfaValidator({
      queries,
      signInExperienceValidator: createSignInExperienceValidator(),
    });

    const result = await validator.getResult(user, {
      now,
      currentContext: {
        location: {
          latitude: 50,
          longitude: 0,
          country: 'DE',
          city: 'Frankfurt',
        },
      },
    });

    expect(result?.requiresMfa).toBe(true);
    expect(result?.triggeredRules).toEqual(
      expect.arrayContaining([expect.objectContaining({ rule: 'geo_velocity' })])
    );
  });

  it('honors geoVelocityKmh override', async () => {
    const now = new Date('2024-01-02T00:00:00Z');
    const user: User = {
      ...mockUser,
      lastSignInAt: now.getTime() - 2 * 60 * 60 * 1000,
    };
    const queries = createQueries({
      recentCountries: [
        {
          country: 'DE',
          lastSignInAt: now.getTime() - 3 * 60 * 60 * 1000,
        },
      ],
      geoLocation: { latitude: 0, longitude: 0 },
    });

    const validator = new AdaptiveMfaValidator({
      queries,
      signInExperienceValidator: createSignInExperienceValidator(true, { geoVelocityKmh: 20_000 }),
    });

    const result = await validator.getResult(user, {
      now,
      currentContext: {
        location: {
          latitude: 50,
          longitude: 0,
          country: 'DE',
          city: 'Frankfurt',
        },
      },
    });

    expect(result?.requiresMfa).toBe(false);
  });

  it('triggers long inactivity rule after threshold', async () => {
    const now = new Date('2024-01-02T00:00:00Z');
    const user: User = {
      ...mockUser,
      lastSignInAt: now.getTime() - 40 * 24 * 60 * 60 * 1000,
    };
    const queries = createQueries();

    const validator = new AdaptiveMfaValidator({
      queries,
      signInExperienceValidator: createSignInExperienceValidator(),
    });

    const result = await validator.getResult(user, {
      now,
      currentContext: {},
    });

    expect(result?.requiresMfa).toBe(true);
    expect(result?.triggeredRules).toEqual(
      expect.arrayContaining([expect.objectContaining({ rule: 'long_inactivity' })])
    );
  });

  it('honors longInactivityDays override', async () => {
    const now = new Date('2024-01-02T00:00:00Z');
    const user: User = {
      ...mockUser,
      lastSignInAt: now.getTime() - 40 * 24 * 60 * 60 * 1000,
    };
    const queries = createQueries();

    const validator = new AdaptiveMfaValidator({
      queries,
      signInExperienceValidator: createSignInExperienceValidator(true, {
        longInactivityDays: 100,
      }),
    });

    const result = await validator.getResult(user, {
      now,
      currentContext: {},
    });

    expect(result?.requiresMfa).toBe(false);
  });

  it('triggers untrusted ip rule when bot score is low', async () => {
    const now = new Date('2024-01-02T00:00:00Z');
    const user: User = {
      ...mockUser,
      lastSignInAt: null,
    };
    const queries = createQueries();

    const validator = new AdaptiveMfaValidator({
      queries,
      signInExperienceValidator: createSignInExperienceValidator(),
    });

    const result = await validator.getResult(user, {
      now,
      currentContext: {
        ipRiskSignals: {
          botScore: 10,
        },
      },
    });

    expect(result?.requiresMfa).toBe(true);
    expect(result?.triggeredRules).toEqual(
      expect.arrayContaining([expect.objectContaining({ rule: 'untrusted_ip' })])
    );
  });

  it('honors minBotScore override', async () => {
    const now = new Date('2024-01-02T00:00:00Z');
    const user: User = {
      ...mockUser,
      lastSignInAt: null,
    };
    const queries = createQueries();

    const validator = new AdaptiveMfaValidator({
      queries,
      signInExperienceValidator: createSignInExperienceValidator(true, { minBotScore: 5 }),
    });

    const result = await validator.getResult(user, {
      now,
      currentContext: {
        ipRiskSignals: {
          botScore: 10,
        },
      },
    });

    expect(result?.requiresMfa).toBe(false);
  });

  it('passes newCountryWindowDays to recent countries query', async () => {
    const now = new Date('2024-01-02T00:00:00Z');
    const user: User = {
      ...mockUser,
      lastSignInAt: now.getTime() - 60 * 60 * 1000,
    };
    const queries = createQueries({ recentCountries: [] });

    const validator = new AdaptiveMfaValidator({
      queries,
      signInExperienceValidator: createSignInExperienceValidator(true, { newCountryWindowDays: 7 }),
    });

    await validator.getResult(user, {
      now,
      currentContext: { location: { country: 'FR' } },
    });

    expect(queries.userSignInCountries.findRecentSignInCountriesByUserId).toHaveBeenCalledWith(
      user.id,
      7
    );
  });

  it('persists geo location and country when context has data', async () => {
    const user: User = {
      ...mockUser,
      lastSignInAt: Date.now(),
    };
    const queries = createQueries();

    const validator = new AdaptiveMfaValidator({
      queries,
      signInExperienceValidator: createSignInExperienceValidator(),
    });

    await validator.persistContext(user, {
      currentContext: {
        location: {
          latitude: 12.3,
          longitude: 45.6,
          country: 'US',
        },
      },
    });

    expect(queries.userGeoLocations.upsertUserGeoLocation).toHaveBeenCalledWith(
      user.id,
      12.3,
      45.6
    );
    expect(queries.userSignInCountries.upsertUserSignInCountry).toHaveBeenCalledWith(user.id, 'US');
    expect(queries.userSignInCountries.pruneUserSignInCountriesByUserId).not.toHaveBeenCalled();
  });

  it('parses zero coordinates from injected headers', async () => {
    const user: User = {
      ...mockUser,
      lastSignInAt: Date.now(),
    };
    const queries = createQueries();
    const ctx = {
      request: {
        headers: {
          'x-logto-cf-latitude': '0',
          'x-logto-cf-longitude': '0',
        },
      },
    };

    const validator = new AdaptiveMfaValidator({
      queries,
      ctx,
      signInExperienceValidator: createSignInExperienceValidator(),
    });

    await validator.persistContext(user);

    expect(queries.userGeoLocations.upsertUserGeoLocation).toHaveBeenCalledWith(user.id, 0, 0);
  });

  it('skips persisting context when adaptive MFA is disabled', async () => {
    const user: User = {
      ...mockUser,
      lastSignInAt: Date.now(),
    };
    const queries = createQueries();

    const validator = new AdaptiveMfaValidator({
      queries,
      signInExperienceValidator: createSignInExperienceValidator(false),
    });

    await validator.persistContext(user, {
      currentContext: {
        location: {
          latitude: 12.3,
          longitude: 45.6,
          country: 'US',
        },
      },
    });

    expect(queries.userGeoLocations.upsertUserGeoLocation).not.toHaveBeenCalled();
    expect(queries.userSignInCountries.upsertUserSignInCountry).not.toHaveBeenCalled();
    expect(queries.userSignInCountries.pruneUserSignInCountriesByUserId).not.toHaveBeenCalled();
  });

  it('skips persisting context when dev features are disabled', async () => {
    setDevFeaturesEnabled(false);

    const user: User = {
      ...mockUser,
      lastSignInAt: Date.now(),
    };
    const queries = createQueries();

    const validator = new AdaptiveMfaValidator({
      queries,
      signInExperienceValidator: createSignInExperienceValidator(),
    });

    await validator.persistContext(user, {
      currentContext: {
        location: {
          latitude: 12.3,
          longitude: 45.6,
          country: 'US',
        },
      },
    });

    expect(queries.userGeoLocations.upsertUserGeoLocation).not.toHaveBeenCalled();
    expect(queries.userSignInCountries.upsertUserSignInCountry).not.toHaveBeenCalled();
    expect(queries.userSignInCountries.pruneUserSignInCountriesByUserId).not.toHaveBeenCalled();
  });
});
