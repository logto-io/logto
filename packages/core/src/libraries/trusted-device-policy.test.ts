import type { SignInExperience } from '@logto/schemas';

import { mockSignInExperience } from '#src/__mocks__/index.js';
import type Queries from '#src/tenants/Queries.js';
import { expectSqlString } from '#src/test-utils/query.js';

import {
  createTrustedDevicePolicyLibrary,
  resolveEffectiveTrustedDevicePolicy,
} from './trusted-device-policy.js';

const { jest } = import.meta;

describe('resolveEffectiveTrustedDevicePolicy', () => {
  it.each([
    {
      name: 'uses disabled defaults for an empty global policy',
      policy: {},
      hasDisallowedOrganization: false,
      expected: { enabled: false, durationDays: 30 },
    },
    {
      name: 'allows a globally enabled user without organizations',
      policy: { enabled: true, durationDays: 7 },
      hasDisallowedOrganization: false,
      expected: { enabled: true, durationDays: 7 },
    },
    {
      name: 'keeps globally disabled trust disabled when every organization allows it',
      policy: { enabled: false, durationDays: 14 },
      hasDisallowedOrganization: false,
      expected: { enabled: false, durationDays: 14 },
    },
    {
      name: 'allows trust when global policy and every organization allow it',
      policy: { enabled: true, durationDays: 21 },
      hasDisallowedOrganization: false,
      expected: { enabled: true, durationDays: 21 },
    },
    {
      name: 'blocks trust when any organization disallows it',
      policy: { enabled: true, durationDays: 60 },
      hasDisallowedOrganization: true,
      expected: { enabled: false, durationDays: 60 },
    },
  ])('$name', ({ policy, hasDisallowedOrganization, expected }) => {
    expect(resolveEffectiveTrustedDevicePolicy(policy, hasDisallowedOrganization)).toEqual(
      expected
    );
  });
});

const createQueries = (
  pool: Record<string, unknown>,
  signInExperience: SignInExperience | (() => SignInExperience) = mockSignInExperience
) =>
  ({
    pool,
    signInExperiences: {
      findDefaultSignInExperience: jest.fn(async () =>
        typeof signInExperience === 'function' ? signInExperience() : signInExperience
      ),
    },
  }) as unknown as Queries;

describe('trusted device policy library', () => {
  it('resolves the effective policy with a targeted organization restriction query', async () => {
    const pool = {
      exists: jest.fn(async () => true),
    };
    const signInExperience = {
      ...mockSignInExperience,
      trustedDevice: { enabled: true, durationDays: 30 },
    };
    const library = createTrustedDevicePolicyLibrary(createQueries(pool, signInExperience));

    await expect(library.getEffectivePolicy('user-id')).resolves.toEqual({
      enabled: false,
      durationDays: 30,
    });
    expect(pool.exists).toHaveBeenCalledWith(
      expectSqlString('"organizations"."is_trusted_device_allowed" = false')
    );
  });
});
