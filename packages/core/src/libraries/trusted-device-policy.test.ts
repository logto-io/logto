import type { SignInExperience } from '@logto/schemas';
import { createMockQueryResult } from '@silverhand/slonik';

import { mockSignInExperience } from '#src/__mocks__/index.js';
import { createSignInExperienceQueries } from '#src/queries/sign-in-experience.js';
import type Queries from '#src/tenants/Queries.js';
import { expectSqlString } from '#src/test-utils/query.js';
import { MockWellKnownCache } from '#src/test-utils/tenant.js';

import {
  createTrustedDevicePolicyLibrary,
  resolveEffectiveTrustedDevicePolicy,
} from './trusted-device-policy.js';

const { jest } = import.meta;

const allowedOrganization = { isTrustedDeviceAllowed: true };
const blockedOrganization = { isTrustedDeviceAllowed: false };

describe('resolveEffectiveTrustedDevicePolicy', () => {
  it.each([
    {
      name: 'uses disabled defaults for an empty global policy',
      policy: {},
      organizations: [],
      expected: { enabled: false, durationDays: 30 },
    },
    {
      name: 'allows a globally enabled user without organizations',
      policy: { enabled: true, durationDays: 7 },
      organizations: [],
      expected: { enabled: true, durationDays: 7 },
    },
    {
      name: 'keeps globally disabled trust disabled when every organization allows it',
      policy: { enabled: false, durationDays: 14 },
      organizations: [allowedOrganization, allowedOrganization],
      expected: { enabled: false, durationDays: 14 },
    },
    {
      name: 'allows trust when global policy and every organization allow it',
      policy: { enabled: true, durationDays: 21 },
      organizations: [allowedOrganization, allowedOrganization],
      expected: { enabled: true, durationDays: 21 },
    },
    {
      name: 'blocks trust when any organization disallows it',
      policy: { enabled: true, durationDays: 60 },
      organizations: [allowedOrganization, blockedOrganization],
      expected: { enabled: false, durationDays: 60 },
    },
  ])('$name', ({ policy, organizations, expected }) => {
    expect(resolveEffectiveTrustedDevicePolicy(policy, organizations)).toEqual(expected);
  });

  it('ignores organization MFA requirement when resolving trusted-device permission', () => {
    const organizations = [
      { isTrustedDeviceAllowed: true, isMfaRequired: false },
      { isTrustedDeviceAllowed: false, isMfaRequired: false },
    ];

    expect(
      resolveEffectiveTrustedDevicePolicy({ enabled: true, durationDays: 30 }, organizations)
    ).toEqual({ enabled: false, durationDays: 30 });
  });
});

const createQueries = (
  pool: Record<string, unknown>,
  signInExperience: SignInExperience | (() => SignInExperience) = mockSignInExperience
) =>
  ({
    pool,
    wellKnownCache: {
      mutate: (run: (...args: never[]) => Promise<unknown>) => run,
    },
    signInExperiences: {
      ...createSignInExperienceQueries(pool as never, new MockWellKnownCache()),
      findDefaultSignInExperience: jest.fn(async () =>
        typeof signInExperience === 'function' ? signInExperience() : signInExperience
      ),
    },
    organizations: {
      relations: {
        users: {
          getOrganizationsByUserId: jest.fn(async () => []),
        },
      },
    },
  }) as unknown as Queries;

describe('trusted device policy library', () => {
  it('disables and deletes all tenant records in one transaction', async () => {
    const current = {
      ...mockSignInExperience,
      trustedDevice: { enabled: true, durationDays: 30 },
    };
    const updated = {
      ...mockSignInExperience,
      trustedDevice: { enabled: false, durationDays: 30 },
    };
    const connection = {
      query: jest
        .fn()
        .mockResolvedValueOnce(createMockQueryResult([]))
        .mockResolvedValueOnce(createMockQueryResult([updated as never]))
        .mockResolvedValueOnce(createMockQueryResult([{ id: 'trusted-device-id' }])),
    };
    const pool = {
      transaction: jest.fn(
        async <Result>(run: (transaction: typeof connection) => Promise<Result>) => run(connection)
      ),
    };
    const library = createTrustedDevicePolicyLibrary('tenant-id', createQueries(pool, current));

    await expect(
      library.updateGlobalPolicy({ enabled: false, durationDays: 30 }, {})
    ).resolves.toEqual(updated);

    expect(connection.query).toHaveBeenCalledTimes(3);
    expect(connection.query.mock.calls[0]?.[0]).toEqual(
      expectSqlString('select pg_advisory_xact_lock(hashtextextended($1, 0))')
    );
    expect(connection.query.mock.calls[1]?.[0]).toEqual(
      expectSqlString('update "sign_in_experiences"')
    );
    expect(connection.query.mock.calls[2]?.[0]).toEqual(expectSqlString('delete from'));
  });

  it('does not delete records for a duration-only policy update', async () => {
    const current = {
      ...mockSignInExperience,
      trustedDevice: { enabled: true, durationDays: 30 },
    };
    const updated = {
      ...mockSignInExperience,
      trustedDevice: { enabled: true, durationDays: 60 },
    };
    const connection = {
      query: jest.fn(async (_query: unknown) => createMockQueryResult([updated as never])),
    };
    const pool = {
      transaction: jest.fn(
        async <Result>(run: (transaction: typeof connection) => Promise<Result>) => run(connection)
      ),
    };
    const library = createTrustedDevicePolicyLibrary('tenant-id', createQueries(pool, current));

    await expect(
      library.updateGlobalPolicy({ enabled: true, durationDays: 60 }, {})
    ).resolves.toEqual(updated);
    expect(connection.query).toHaveBeenCalledTimes(2);
    expect(connection.query.mock.calls[0]?.[0]).toEqual(
      expectSqlString('select pg_advisory_xact_lock(hashtextextended($1, 0))')
    );
    expect(connection.query.mock.calls[1]?.[0]).toEqual(
      expectSqlString('update "sign_in_experiences"')
    );
  });

  it('does not delete records when the policy remains disabled', async () => {
    const current = {
      ...mockSignInExperience,
      trustedDevice: { enabled: false, durationDays: 30 },
    };
    const updated = {
      ...mockSignInExperience,
      trustedDevice: { enabled: false, durationDays: 60 },
    };
    const connection = {
      query: jest
        .fn()
        .mockResolvedValueOnce(createMockQueryResult([]))
        .mockResolvedValueOnce(createMockQueryResult([updated as never])),
    };
    const pool = {
      transaction: jest.fn(
        async <Result>(run: (transaction: typeof connection) => Promise<Result>) => run(connection)
      ),
    };
    const library = createTrustedDevicePolicyLibrary('tenant-id', createQueries(pool, current));

    await expect(
      library.updateGlobalPolicy({ enabled: false, durationDays: 60 }, {})
    ).resolves.toEqual(updated);
    expect(connection.query).toHaveBeenCalledTimes(2);
  });

  it('does not run the create callback when the tenant policy is disabled', async () => {
    const connection = {
      query: jest.fn(async () => createMockQueryResult([])),
      any: jest.fn(async () => []),
    };
    const pool = {
      transaction: jest.fn(
        async <Result>(run: (transaction: typeof connection) => Promise<Result>) => run(connection)
      ),
    };
    const run = jest.fn(async () => 'created');
    const library = createTrustedDevicePolicyLibrary('tenant-id', createQueries(pool));

    await expect(library.runIfEnabled('user-id', run)).resolves.toBeUndefined();
    expect(run).not.toHaveBeenCalled();
    expect(connection.query).toHaveBeenCalledWith(
      expectSqlString('select pg_advisory_xact_lock(hashtextextended($1, 0))')
    );
  });
});
