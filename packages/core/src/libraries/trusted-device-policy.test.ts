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
    const library = createTrustedDevicePolicyLibrary(createQueries(pool));

    await expect(
      library.updateGlobalPolicy({ enabled: false, durationDays: 30 }, {})
    ).resolves.toEqual(updated);

    expect(connection.query).toHaveBeenCalledTimes(3);
    expect(connection.query.mock.calls[0]?.[0]).toEqual(
      expectSqlString('lock table "trusted_devices" in share row exclusive mode')
    );
    expect(connection.query.mock.calls[1]?.[0]).toEqual(
      expectSqlString('update "sign_in_experiences"')
    );
    expect(connection.query.mock.calls[2]?.[0]).toEqual(expectSqlString('delete from'));
  });

  it('does not delete records for a duration-only policy update', async () => {
    const updated = {
      ...mockSignInExperience,
      trustedDevice: { enabled: true, durationDays: 60 },
    };
    const connection = {
      query: jest.fn(async () => createMockQueryResult([updated as never])),
    };
    const pool = {
      transaction: jest.fn(
        async <Result>(run: (transaction: typeof connection) => Promise<Result>) => run(connection)
      ),
    };
    const library = createTrustedDevicePolicyLibrary(createQueries(pool));

    await expect(
      library.updateGlobalPolicy({ enabled: true, durationDays: 60 }, {})
    ).resolves.toEqual(updated);
    expect(connection.query).toHaveBeenCalledTimes(1);
  });

  it('serializes global disable before concurrent creation and prevents post-disable creation', async () => {
    /* eslint-disable @silverhand/fp/no-mutation, @silverhand/fp/no-let -- Simulate mutable database state and lock ownership for the concurrency test. */
    let signInExperience = {
      ...mockSignInExperience,
      trustedDevice: { enabled: true, durationDays: 30 },
    };
    let isCleanupLockHeld = false;
    let notifyCleanupLockAcquired: (() => void) | undefined;
    let continueDisable: (() => void) | undefined;
    let notifyCreateLockRequested: (() => void) | undefined;
    let notifyCleanupLockReleased: (() => void) | undefined;
    const cleanupLockAcquired = new Promise<void>((resolve) => {
      notifyCleanupLockAcquired = resolve;
    });
    const disableCanContinue = new Promise<void>((resolve) => {
      continueDisable = resolve;
    });
    const createLockRequested = new Promise<void>((resolve) => {
      notifyCreateLockRequested = resolve;
    });
    const cleanupLockReleased = new Promise<void>((resolve) => {
      notifyCleanupLockReleased = resolve;
    });
    const createConnection = () => {
      let holdsCleanupLock = false;

      return {
        any: jest.fn(async () => []),
        query: jest.fn(async (query: { sql: string }) => {
          if (/share row exclusive mode/i.test(query.sql)) {
            isCleanupLockHeld = true;
            holdsCleanupLock = true;
            notifyCleanupLockAcquired?.();
            await disableCanContinue;

            return createMockQueryResult([]);
          }

          if (/row exclusive mode/i.test(query.sql)) {
            notifyCreateLockRequested?.();

            if (isCleanupLockHeld) {
              await cleanupLockReleased;
            }

            return createMockQueryResult([]);
          }

          if (/update "sign_in_experiences"/i.test(query.sql)) {
            signInExperience = {
              ...signInExperience,
              trustedDevice: { enabled: false, durationDays: 30 },
            };
            return createMockQueryResult([signInExperience as never]);
          }

          return createMockQueryResult([]);
        }),
        release: () => {
          if (holdsCleanupLock) {
            isCleanupLockHeld = false;
            notifyCleanupLockReleased?.();
          }
        },
      };
    };
    const pool = {
      transaction: jest.fn(
        async <Result>(
          run: (transaction: ReturnType<typeof createConnection>) => Promise<Result>
        ) => {
          const connection = createConnection();

          try {
            return await run(connection);
          } finally {
            connection.release();
          }
        }
      ),
    };
    const library = createTrustedDevicePolicyLibrary(createQueries(pool, () => signInExperience));
    const createRecord = jest.fn(async () => 'created');
    const disable = library.updateGlobalPolicy({ enabled: false, durationDays: 30 }, {});

    await cleanupLockAcquired;
    const create = library.runIfEnabled('user-id', createRecord);
    await createLockRequested;
    continueDisable?.();

    await expect(Promise.all([disable, create])).resolves.toEqual([
      expect.objectContaining({ trustedDevice: { enabled: false, durationDays: 30 } }),
      undefined,
    ]);
    expect(createRecord).not.toHaveBeenCalled();
    /* eslint-enable @silverhand/fp/no-mutation, @silverhand/fp/no-let */
  });
});
