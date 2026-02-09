import { type User } from '@logto/schemas';

import { mockUser } from '#src/__mocks__/user.js';
import { EnvSet } from '#src/env-set/index.js';

import type { SignInExperienceValidator } from '../sign-in-experience-validator.js';

import { AdaptiveMfaValidator, adaptiveMfaNewCountryWindowDays } from './index.js';

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
      recentCountries: [],
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

  it.each([
    ['false', false],
    ['0', false],
    ['no', false],
    ['maybe', false],
    ['yes', true],
  ])(
    'parses bot verification signal from injected header %s as %s',
    (botVerifiedHeader, expectedBotVerified) => {
      const queries = createQueries();
      const ctx = {
        request: {
          headers: {
            'x-logto-cf-bot-verified': botVerifiedHeader,
          },
        },
      };

      const validator = new AdaptiveMfaValidator({
        queries,
        ctx,
        signInExperienceValidator: createSignInExperienceValidator(),
      });

      expect(validator.getCurrentContext()).toEqual({
        ipRiskSignals: {
          botVerified: expectedBotVerified,
        },
      });
    }
  );

  it('persists context when adaptive MFA is disabled', async () => {
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

  it('skips persisting context when dev features are disabled even with context override', async () => {
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
