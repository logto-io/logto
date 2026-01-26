import { type User } from '@logto/schemas';

import { mockUser } from '#src/__mocks__/user.js';

import { AdaptiveMfaValidator } from './adaptive-mfa-validator.js';

const { jest } = import.meta;

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

describe('AdaptiveMfaValidator', () => {
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
      user,
      queries,
      now,
      currentContext: { location: { country: 'FR' } },
    });

    const result = await validator.evaluateRules();

    expect(result.requiresMfa).toBe(true);
    expect(result.triggeredRules).toEqual(
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
      user,
      queries,
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

    const result = await validator.evaluateRules();

    expect(result.requiresMfa).toBe(true);
    expect(result.triggeredRules).toEqual(
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
      user,
      queries,
      now,
      currentContext: {},
    });

    const result = await validator.evaluateRules();

    expect(result.requiresMfa).toBe(true);
    expect(result.triggeredRules).toEqual(
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
      user,
      queries,
      now,
      currentContext: {
        ipRiskSignals: {
          botScore: 10,
        },
      },
    });

    const result = await validator.evaluateRules();

    expect(result.requiresMfa).toBe(true);
    expect(result.triggeredRules).toEqual(
      expect.arrayContaining([expect.objectContaining({ rule: 'untrusted_ip' })])
    );
  });
});
