import { type User } from '@logto/schemas';

import { mockUser } from '#src/__mocks__/user.js';
import { EnvSet } from '#src/env-set/index.js';

import type { SignInExperienceValidator } from '../sign-in-experience-validator.js';

import { AdaptiveMfaValidator, adaptiveMfaNewCountryWindowDays } from './index.js';
import { AdaptiveMfaRule } from './types.js';

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

const createSignInExperienceValidator = (enabled = true) =>
  ({
    getSignInExperienceData: jest.fn().mockResolvedValue({
      adaptiveMfa: { enabled },
    }),
  }) as unknown as SignInExperienceValidator;

describe('AdaptiveMfaValidator', () => {
  beforeEach(() => {
    setDevFeaturesEnabled(true);
  });

  afterAll(() => {
    setDevFeaturesEnabled(originalIsDevFeaturesEnabled);
  });

  it('triggers new region or country rule when current region or country is not in recent list', async () => {
    const now = new Date('2024-01-02T00:00:00Z');
    const user: User = {
      ...mockUser,
      lastSignInAt: now.getTime() - 60 * 60 * 1000,
    };
    const lastSignInAt = now.getTime() - 2 * 60 * 60 * 1000;
    const queries = createQueries({
      recentCountries: [
        {
          country: 'US',
          lastSignInAt,
        },
      ],
    });

    const validator = new AdaptiveMfaValidator({
      queries,
      signInExperienceValidator: createSignInExperienceValidator(),
    });

    const result = await validator.getResult(user, {
      now,
      currentContext: { location: { regionOrCountry: 'FR' } },
    });

    expect(result?.requiresMfa).toBe(true);
    const triggeredRule = result?.triggeredRules.find(
      ({ rule }) => rule === AdaptiveMfaRule.NewRegionOrCountry
    );
    expect(triggeredRule).toEqual(
      expect.objectContaining({
        rule: AdaptiveMfaRule.NewRegionOrCountry,
        details: {
          currentRegionOrCountry: 'FR',
          windowDays: adaptiveMfaNewCountryWindowDays,
          recentRegionsOrCountries: [
            {
              regionOrCountry: 'US',
              lastSignInAt,
            },
          ],
        },
      })
    );
  });

  it('triggers geo velocity rule when travel speed exceeds threshold', async () => {
    const now = new Date('2024-01-02T00:00:00Z');
    const user: User = {
      ...mockUser,
      lastSignInAt: now.getTime() - 2 * 60 * 60 * 1000,
    };
    const previousLastSignInAt = now.getTime() - 3 * 60 * 60 * 1000;
    const queries = createQueries({
      recentCountries: [
        {
          country: 'US',
          lastSignInAt: previousLastSignInAt,
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
          regionOrCountry: 'DE',
          city: 'Frankfurt',
        },
      },
    });

    expect(result?.requiresMfa).toBe(true);
    const triggeredRule = result?.triggeredRules.find(({ rule }) => rule === 'geo_velocity');
    expect(triggeredRule).toEqual(
      expect.objectContaining({
        rule: 'geo_velocity',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        details: expect.objectContaining({
          previous: {
            regionOrCountry: {
              regionOrCountry: 'US',
              lastSignInAt: previousLastSignInAt,
            },
            at: new Date(user.lastSignInAt ?? 0).toISOString(),
          },
          current: {
            regionOrCountry: 'DE',
            city: 'Frankfurt',
            at: now.toISOString(),
          },
        }),
      })
    );
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

  it('persists geo location and region or country when context has data', async () => {
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
          regionOrCountry: 'US',
        },
      },
    });

    expect(queries.userGeoLocations.upsertUserGeoLocation).toHaveBeenCalledWith(
      user.id,
      12.3,
      45.6
    );
    expect(queries.userSignInCountries.upsertUserSignInCountry).toHaveBeenCalledWith(user.id, 'US');
    expect(queries.userSignInCountries.pruneUserSignInCountriesByUserId).toHaveBeenCalledWith(
      user.id,
      adaptiveMfaNewCountryWindowDays
    );
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
          regionOrCountry: 'US',
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
          regionOrCountry: 'US',
        },
      },
    });

    expect(queries.userGeoLocations.upsertUserGeoLocation).not.toHaveBeenCalled();
    expect(queries.userSignInCountries.upsertUserSignInCountry).not.toHaveBeenCalled();
    expect(queries.userSignInCountries.pruneUserSignInCountriesByUserId).not.toHaveBeenCalled();
  });
});
