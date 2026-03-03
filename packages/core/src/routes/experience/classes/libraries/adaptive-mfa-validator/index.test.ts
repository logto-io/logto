import { type IncomingHttpHeaders } from 'node:http';

import { InteractionEvent, type User } from '@logto/schemas';

import { mockUser } from '#src/__mocks__/user.js';
import { EnvSet } from '#src/env-set/index.js';
import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import { defaultInjectedHeaderMapping } from '#src/utils/injected-header-mapping.js';

import type { SignInExperienceValidator } from '../sign-in-experience-validator.js';

import { AdaptiveMfaValidator, adaptiveMfaNewCountryWindowDays } from './index.js';
import { type AdaptiveMfaContext } from './types.js';

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

const createInteractionContext = (user: User) => ({
  getIdentifiedUser: jest.fn().mockResolvedValue(user),
});

/**
 * Build request headers that `getInjectedHeaderValues()` can read and
 * `parseAdaptiveMfaContext()` can parse back into (approximately) the same context.
 *
 * Note: This intentionally generates *strings* because HTTP headers are strings.
 */
const buildInjectedHeadersFromAdaptiveMfaContext = (
  context: AdaptiveMfaContext
): IncomingHttpHeaders => {
  const headers = new Map<string, string>();

  const set = (logicalKey: string, value: unknown) => {
    const headerName = defaultInjectedHeaderMapping[logicalKey]?.trim().toLowerCase();
    if (!headerName || value === undefined || value === null) {
      return;
    }

    headers.set(headerName, String(value));
  };

  const { location, ipRiskSignals } = context;

  if (location) {
    // Keep semantics aligned with parseAdaptiveMfaContext normalization.
    // Country should be ISO 3166-1 alpha-2, upper-case (if present).
    set('country', location.country?.trim().toUpperCase());
    set('city', location.city?.trim());
    set('latitude', location.latitude);
    set('longitude', location.longitude);
  }

  if (ipRiskSignals) {
    set('botScore', ipRiskSignals.botScore);
    set('botVerified', ipRiskSignals.botVerified);
  }

  return Object.fromEntries(headers);
};

const buildMockContext = (context: AdaptiveMfaContext) =>
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- mock headers only
  ({
    request: {
      headers: buildInjectedHeadersFromAdaptiveMfaContext(context),
    },
  }) as WithLogContext;

describe('AdaptiveMfaValidator', () => {
  beforeEach(() => {
    setDevFeaturesEnabled(true);
  });

  afterAll(() => {
    setDevFeaturesEnabled(originalIsDevFeaturesEnabled);
  });

  it('triggers new country rule when current country is not in recent list', async () => {
    const now = new Date('2024-01-02T00:00:00Z');

    jest.useFakeTimers().setSystemTime(now);

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
      interactionContext: createInteractionContext(user),
      signInExperienceValidator: createSignInExperienceValidator(),
      ctx: buildMockContext({ location: { country: 'FR' } }),
    });

    const result = await validator.getResult();

    expect(result?.requiresMfa).toBe(true);
    expect(result?.triggeredRules).toEqual(
      expect.arrayContaining([expect.objectContaining({ rule: 'new_country' })])
    );

    jest.useRealTimers();
  });

  it('does not trigger new country rule when recent countries are empty', async () => {
    const now = new Date('2024-01-02T00:00:00Z');

    jest.useFakeTimers().setSystemTime(now);

    const user: User = {
      ...mockUser,
      lastSignInAt: now.getTime() - 60 * 60 * 1000,
    };
    const queries = createQueries({
      recentCountries: [],
    });

    const validator = new AdaptiveMfaValidator({
      queries,
      interactionContext: createInteractionContext(user),
      signInExperienceValidator: createSignInExperienceValidator(),
      ctx: buildMockContext({ location: { country: 'FR' } }),
    });

    const result = await validator.getResult();

    expect(result).toEqual({
      requiresMfa: false,
      triggeredRules: [],
    });

    jest.useRealTimers();
  });

  it('triggers geo velocity rule when travel speed exceeds threshold', async () => {
    const now = new Date('2024-01-02T00:00:00Z');

    jest.useFakeTimers().setSystemTime(now);

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
      interactionContext: createInteractionContext(user),
      signInExperienceValidator: createSignInExperienceValidator(),
      ctx: buildMockContext({
        location: {
          latitude: 50,
          longitude: 0,
          country: 'DE',
          city: 'Frankfurt',
        },
      }),
    });

    const result = await validator.getResult();

    expect(result?.requiresMfa).toBe(true);
    expect(result?.triggeredRules).toEqual(
      expect.arrayContaining([expect.objectContaining({ rule: 'geo_velocity' })])
    );

    jest.useRealTimers();
  });

  it('triggers long inactivity rule after threshold', async () => {
    const now = new Date('2024-01-02T00:00:00Z');

    jest.useFakeTimers().setSystemTime(now);

    const user: User = {
      ...mockUser,
      lastSignInAt: now.getTime() - 40 * 24 * 60 * 60 * 1000,
    };
    const queries = createQueries();

    const validator = new AdaptiveMfaValidator({
      queries,
      interactionContext: createInteractionContext(user),
      signInExperienceValidator: createSignInExperienceValidator(),
    });

    const result = await validator.getResult();

    expect(result?.requiresMfa).toBe(true);
    expect(result?.triggeredRules).toEqual(
      expect.arrayContaining([expect.objectContaining({ rule: 'long_inactivity' })])
    );

    jest.useRealTimers();
  });

  it('triggers untrusted ip rule when bot score is low', async () => {
    const now = new Date('2024-01-02T00:00:00Z');

    jest.useFakeTimers().setSystemTime(now);

    const user: User = {
      ...mockUser,
      lastSignInAt: null,
    };
    const queries = createQueries();

    const validator = new AdaptiveMfaValidator({
      queries,
      interactionContext: createInteractionContext(user),
      signInExperienceValidator: createSignInExperienceValidator(),
      ctx: buildMockContext({
        ipRiskSignals: {
          botScore: 10,
        },
      }),
    });

    const result = await validator.getResult();

    expect(result?.requiresMfa).toBe(true);
    expect(result?.triggeredRules).toEqual(
      expect.arrayContaining([expect.objectContaining({ rule: 'untrusted_ip' })])
    );

    jest.useRealTimers();
  });

  it('records geo location and country on sign-in when context has data', async () => {
    const user: User = {
      ...mockUser,
      lastSignInAt: Date.now(),
    };
    const queries = createQueries();

    const ctx = buildMockContext({
      location: {
        country: 'US',
        latitude: 12.3,
        longitude: 45.6,
      },
    });

    const validator = new AdaptiveMfaValidator({
      queries,
      ctx,
      interactionContext: createInteractionContext(user),
      signInExperienceValidator: createSignInExperienceValidator(),
    });

    await validator.recordSignInGeoContext(user, InteractionEvent.SignIn);

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
    const ctx = buildMockContext({
      location: {
        latitude: 0,
        longitude: 0,
      },
    });

    const validator = new AdaptiveMfaValidator({
      queries,
      ctx,
      interactionContext: createInteractionContext(user),
      signInExperienceValidator: createSignInExperienceValidator(),
    });

    await validator.recordSignInGeoContext(user, InteractionEvent.SignIn);

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
        /* @ts-expect-error -- partial context for testing parsing logic only */
        ctx,
        interactionContext: createInteractionContext(mockUser),
        signInExperienceValidator: createSignInExperienceValidator(),
      });

      expect(validator.getCurrentContext()).toEqual({
        ipRiskSignals: {
          botVerified: expectedBotVerified,
        },
      });
    }
  );

  it('records context when adaptive MFA is disabled', async () => {
    const user: User = {
      ...mockUser,
      lastSignInAt: Date.now(),
    };
    const queries = createQueries();
    const ctx = buildMockContext({
      location: {
        country: 'US',
        latitude: 12.3,
        longitude: 45.6,
      },
    });

    const validator = new AdaptiveMfaValidator({
      queries,
      ctx,
      interactionContext: createInteractionContext(user),
      signInExperienceValidator: createSignInExperienceValidator(false),
    });

    await validator.recordSignInGeoContext(user, InteractionEvent.SignIn);

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

  it('skips recording sign-in geo context when dev features are disabled', async () => {
    setDevFeaturesEnabled(false);

    const user: User = {
      ...mockUser,
      lastSignInAt: Date.now(),
    };
    const queries = createQueries();
    const ctx = buildMockContext({
      location: {
        country: 'US',
        latitude: 12.3,
        longitude: 45.6,
      },
    });

    const validator = new AdaptiveMfaValidator({
      queries,
      ctx,
      interactionContext: createInteractionContext(user),
      signInExperienceValidator: createSignInExperienceValidator(),
    });

    await validator.recordSignInGeoContext(user, InteractionEvent.SignIn);

    expect(queries.userGeoLocations.upsertUserGeoLocation).not.toHaveBeenCalled();
    expect(queries.userSignInCountries.upsertUserSignInCountry).not.toHaveBeenCalled();
    expect(queries.userSignInCountries.pruneUserSignInCountriesByUserId).not.toHaveBeenCalled();
  });

  it('records context for register interactions', async () => {
    const user: User = {
      ...mockUser,
      lastSignInAt: Date.now(),
    };
    const queries = createQueries();
    const ctx = buildMockContext({
      location: {
        country: 'US',
        latitude: 12.3,
        longitude: 45.6,
      },
    });

    const validator = new AdaptiveMfaValidator({
      queries,
      ctx,
      interactionContext: createInteractionContext(user),
      signInExperienceValidator: createSignInExperienceValidator(),
    });

    await validator.recordSignInGeoContext(user, InteractionEvent.Register);

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

  it('skips recording context for unsupported interactions', async () => {
    const user: User = {
      ...mockUser,
      lastSignInAt: Date.now(),
    };
    const queries = createQueries();
    const ctx = buildMockContext({
      location: {
        country: 'US',
        latitude: 12.3,
        longitude: 45.6,
      },
    });

    const validator = new AdaptiveMfaValidator({
      queries,
      ctx,
      interactionContext: createInteractionContext(user),
      signInExperienceValidator: createSignInExperienceValidator(),
    });

    await validator.recordSignInGeoContext(user, InteractionEvent.ForgotPassword);

    expect(queries.userGeoLocations.upsertUserGeoLocation).not.toHaveBeenCalled();
    expect(queries.userSignInCountries.upsertUserSignInCountry).not.toHaveBeenCalled();
    expect(queries.userSignInCountries.pruneUserSignInCountriesByUserId).not.toHaveBeenCalled();
  });
});
