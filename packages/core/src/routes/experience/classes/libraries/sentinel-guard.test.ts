import {
  AdditionalIdentifier,
  Sentinel,
  SentinelActionResult,
  SentinelActivityAction,
  SentinelDecision,
  SignInIdentifier,
  type ActivityReport,
  type VerificationIdentifier,
} from '@logto/schemas';
import { sha256 } from 'hash-wasm';

import { type WithI18nContext } from '#src/middleware/koa-i18next.js';
import { type WithHookContext } from '#src/middleware/koa-management-api-hooks.js';
import type Queries from '#src/tenants/Queries.js';

import {
  canFoldLockoutTargetCase,
  getLockoutTargetCandidates,
  withSentinel,
} from './sentinel-guard.js';

const { jest } = import.meta;

class CapturingSentinel extends Sentinel {
  activities: readonly ActivityReport[] = [];

  constructor(private readonly decision: SentinelDecision = SentinelDecision.Allowed) {
    super();
  }

  get lastActivity() {
    return this.activities.at(-1);
  }

  override async reportActivity(activity: ActivityReport) {
    this.activities = [...this.activities, activity];

    return [this.decision, Date.now() + 60_000] as const;
  }
}

const buildContext = () =>
  ({
    appendExceptionHookContext: jest.fn(),
    i18n: { languages: ['en'] },
  }) as unknown as WithI18nContext & WithHookContext;

const buildQueries = (isUsernameCaseSensitive: boolean, getUsernameCaseSensitive?: () => never) =>
  ({
    signInExperiences: {
      getUsernameCaseSensitive: getUsernameCaseSensitive ?? (async () => isUsernameCaseSensitive),
    },
  }) as unknown as Queries;

/** Runs the guard on a successful verification and returns the lockout bucket key it reported. */
const getBucketKey = async (
  identifier: VerificationIdentifier,
  isUsernameCaseSensitive = true
): Promise<string> => {
  const sentinel = new CapturingSentinel();

  await withSentinel(
    {
      ctx: buildContext(),
      sentinel,
      queries: buildQueries(isUsernameCaseSensitive),
      action: SentinelActivityAction.Password,
      identifier,
      payload: {},
    },
    Promise.resolve('verified')
  );

  // `reportActivity` always runs, so the hash is always captured.
  return sentinel.lastActivity!.targetHash;
};

const emailKey = async (value: string) => getBucketKey({ type: SignInIdentifier.Email, value });
const phoneKey = async (value: string) => getBucketKey({ type: SignInIdentifier.Phone, value });
const usernameKey = async (value: string, isCaseSensitive: boolean) =>
  getBucketKey({ type: SignInIdentifier.Username, value }, isCaseSensitive);

describe('withSentinel lockout bucket keying', () => {
  describe('email', () => {
    it('shares one bucket across casing variants', async () => {
      const [mixed, lower, upper] = await Promise.all([
        emailKey('Victim@Example.com'),
        emailKey('victim@example.com'),
        emailKey('VICTIM@EXAMPLE.COM'),
      ]);

      expect(mixed).toBe(lower);
      expect(upper).toBe(lower);
    });

    it('keys on the lower-cased address, matching `findUserByEmail`', async () => {
      await expect(emailKey('Victim@Example.com')).resolves.toBe(
        await sha256('victim@example.com')
      );
    });

    it('keeps separate buckets for near-miss addresses the lookup treats as distinct', async () => {
      // Neither sub-address tags nor surrounding whitespace are folded by `findUserByEmail`, so
      // folding either here would merge accounts it keeps apart.
      await expect(emailKey('victim+tag@example.com')).resolves.not.toBe(
        await emailKey('victim@example.com')
      );
      await expect(emailKey(' victim@example.com')).resolves.not.toBe(
        await emailKey('victim@example.com')
      );
    });
  });

  describe('phone', () => {
    it('shares one bucket across equivalent formats', async () => {
      // All three resolve to the same user through `findUserByNormalizedPhone`.
      const [spaced, parenthesized, leadingZero] = await Promise.all([
        phoneKey('61 412 345 678'),
        phoneKey('+61 (0) 412 345 678'),
        phoneKey('610412345678'),
      ]);

      expect(parenthesized).toBe(spaced);
      expect(leadingZero).toBe(spaced);
    });

    it('keys on the canonical international number', async () => {
      await expect(phoneKey('+61 (0) 412 345 678')).resolves.toBe(await sha256('61412345678'));
    });

    it('falls back to an exact key when the number cannot be parsed', async () => {
      // Mirrors `findUserByNormalizedPhone` deferring to `findUserByPhone` on an invalid number.
      await expect(phoneKey('0123')).resolves.toBe(await sha256('0123'));
      await expect(phoneKey('0123')).resolves.not.toBe(await phoneKey('0124'));
    });
  });

  describe('username', () => {
    it('keeps separate buckets for case variants under the default case-sensitive policy', async () => {
      // `Alice` and `alice` are different accounts here; merging their buckets would let attempts
      // against one lock out the other.
      await expect(usernameKey('Alice', true)).resolves.not.toBe(await usernameKey('alice', true));
    });

    it('shares one bucket for case variants when the policy is case-insensitive', async () => {
      await expect(usernameKey('Alice', false)).resolves.toBe(await usernameKey('alice', false));
    });

    it('keys on the raw username under the case-sensitive policy', async () => {
      await expect(usernameKey('Alice', true)).resolves.toBe(await sha256('Alice'));
    });
  });

  describe('user id', () => {
    it('keys exactly, without folding case', async () => {
      const identifier = { type: AdditionalIdentifier.UserId, value: 'Abc123' } as const;

      await expect(getBucketKey(identifier)).resolves.toBe(await sha256('Abc123'));
      await expect(getBucketKey(identifier)).resolves.not.toBe(
        await getBucketKey({ type: AdditionalIdentifier.UserId, value: 'abc123' })
      );
    });
  });
});

describe('withSentinel reporting and blocking', () => {
  const identifier = { type: SignInIdentifier.Email, value: 'victim@example.com' } as const;

  const run = async (
    sentinel: CapturingSentinel,
    verification: Promise<string>,
    ctx = buildContext()
  ) =>
    withSentinel(
      {
        ctx,
        sentinel,
        queries: buildQueries(true),
        action: SentinelActivityAction.Password,
        identifier,
        payload: {},
      },
      verification
    );

  it('reports a failed result when the verification rejects', async () => {
    const sentinel = new CapturingSentinel();

    await expect(run(sentinel, Promise.reject(new Error('wrong password')))).rejects.toThrow(
      'wrong password'
    );
    expect(sentinel.lastActivity?.actionResult).toBe(SentinelActionResult.Failed);
  });

  it('reports a successful result when the verification resolves', async () => {
    const sentinel = new CapturingSentinel();

    await expect(run(sentinel, Promise.resolve('verified'))).resolves.toBe('verified');
    expect(sentinel.lastActivity?.actionResult).toBe(SentinelActionResult.Success);
  });

  it('throws the lockout error and reports the identifier as typed when blocked', async () => {
    const sentinel = new CapturingSentinel(SentinelDecision.Blocked);
    const ctx = buildContext();
    const mixedCase = { type: SignInIdentifier.Email, value: 'Victim@Example.com' } as const;

    await expect(
      withSentinel(
        {
          ctx,
          sentinel,
          queries: buildQueries(true),
          action: SentinelActivityAction.Password,
          identifier: mixedCase,
          payload: {},
        },
        Promise.resolve('verified')
      )
    ).rejects.toMatchObject({ code: 'session.verification_blocked_too_many_attempts' });

    // Keyed on the normalized value, but surfaced to admins as the caller spelled it.
    expect(ctx.appendExceptionHookContext).toHaveBeenCalledWith('Identifier.Lockout', mixedCase);
    expect(sentinel.lastActivity?.targetHash).toBe(await sha256('victim@example.com'));
  });

  it('still reports the attempt when the lockout target cannot be resolved', async () => {
    // A database fault on the sign-in-experience read must not cost us the record — an unreported
    // attempt is an uncounted one.
    const sentinel = new CapturingSentinel();
    const rejectingQueries = buildQueries(true, () => {
      throw new Error('database unavailable');
    });

    await expect(
      withSentinel(
        {
          ctx: buildContext(),
          sentinel,
          queries: rejectingQueries,
          action: SentinelActivityAction.Password,
          identifier: { type: SignInIdentifier.Username, value: 'Alice' },
          payload: {},
        },
        Promise.reject(new Error('wrong password'))
      )
    ).rejects.toThrow('wrong password');

    expect(sentinel.activities).toHaveLength(1);
    expect(sentinel.lastActivity?.actionResult).toBe(SentinelActionResult.Failed);
    expect(sentinel.lastActivity?.targetHash).toBe(await sha256('Alice'));
  });
});

describe('getLockoutTargetCandidates', () => {
  /**
   * Manual unlock has to cover the key the guard records for the same value, or it silently stops
   * clearing that bucket. This catches a normalization added to one side and not the other; it does
   * not cover an admin submitting a different spelling than the one that tripped the lockout.
   */
  it.each([
    ['a mixed-case email', { type: SignInIdentifier.Email, value: 'Victim@Example.com' }, true],
    ['a formatted phone', { type: SignInIdentifier.Phone, value: '+61 (0) 412 345 678' }, true],
    ['an unparseable phone', { type: SignInIdentifier.Phone, value: '0123' }, true],
    ['a case-sensitive username', { type: SignInIdentifier.Username, value: 'Alice' }, true],
    ['a case-insensitive username', { type: SignInIdentifier.Username, value: 'Alice' }, false],
    ['a user id', { type: AdditionalIdentifier.UserId, value: 'Abc123' }, true],
  ] as const)('covers the bucket key recorded for %s', async (_, identifier, isCaseSensitive) => {
    const bucketKey = await getBucketKey(identifier, isCaseSensitive);
    const foldCase = await canFoldLockoutTargetCase(
      buildQueries(isCaseSensitive),
      identifier.value
    );
    const candidateKeys = await Promise.all(
      getLockoutTargetCandidates(identifier.value, foldCase).map(async (candidate) =>
        sha256(candidate)
      )
    );

    expect(candidateKeys).toContain(bucketKey);
  });

  it('does not repeat a candidate when the spellings coincide', () => {
    expect(getLockoutTargetCandidates('alice', true)).toStrictEqual(['alice']);
  });

  it('drops the lower-cased candidate when folding could reach another account', () => {
    // `Alice` and `alice` are separate accounts under a case-sensitive policy, so unblocking one
    // must not clear the other.
    expect(getLockoutTargetCandidates('Alice', false)).toStrictEqual(['Alice']);
    expect(getLockoutTargetCandidates('Alice', true)).toStrictEqual(['Alice', 'alice']);
  });

  it('still folds a formatted phone when case folding is withheld', () => {
    expect(getLockoutTargetCandidates('+61 (0) 412 345 678', false)).toStrictEqual([
      '+61 (0) 412 345 678',
      '61412345678',
    ]);
  });

  /**
   * The per-type table above only pins the normalizations that exist today. This drives the same
   * invariant from values a *future* normalization would plausibly touch, across every type and
   * both username policies, so adding one to `resolveLockoutTarget` without adding it here fails.
   */
  const adversarialValues = [
    'Victim@Example.com',
    '  Victim@Example.com  ',
    'victim+tag@Example.com',
    'VICTIM@EXAMPLE.COM',
    'Alice',
    'ALICE',
    '+61 (0) 412 345 678',
    '610412345678',
    '61 412 345 678',
    '2250707123456',
    '225707123456',
    '0123',
    'İstanbul',
    'Abc123',
  ];
  const identifierTypes = [
    SignInIdentifier.Email,
    SignInIdentifier.Phone,
    SignInIdentifier.Username,
    AdditionalIdentifier.UserId,
  ] as const;

  it.each(adversarialValues)('covers every type-and-policy bucket key for %p', async (value) => {
    const bucketKeys = await Promise.all(
      identifierTypes.flatMap((type) =>
        [true, false].map(async (isCaseSensitive) => getBucketKey({ type, value }, isCaseSensitive))
      )
    );
    // Asserted against the permissive form: it is the superset every restricted form is drawn from,
    // so a normalization added to `resolveLockoutTarget` and not here still fails.
    const candidateKeys = await Promise.all(
      getLockoutTargetCandidates(value, true).map(async (candidate) => sha256(candidate))
    );

    expect(candidateKeys).toEqual(expect.arrayContaining(bucketKeys));
  });

  it.each(adversarialValues)(
    'always keeps the value as typed among the candidates for %p',
    (value) => {
      // Dropping it would break manual unlock for every verbatim-keyed identifier at once.
      expect(getLockoutTargetCandidates(value, true)).toContain(value);
      expect(getLockoutTargetCandidates(value, false)).toContain(value);
    }
  );
});

describe('canFoldLockoutTargetCase', () => {
  it.each([true, false])(
    'folds an email whether or not usernames are case-sensitive (%p)',
    async (isCaseSensitive) => {
      // `usernameRegEx` admits no `@`, so a value containing one cannot collide with a username.
      await expect(
        canFoldLockoutTargetCase(buildQueries(isCaseSensitive), 'Victim@Example.com')
      ).resolves.toBe(true);
    }
  );

  it('does not fold a non-email under the default case-sensitive policy', async () => {
    await expect(canFoldLockoutTargetCase(buildQueries(true), 'Alice')).resolves.toBe(false);
  });

  it('folds a non-email when the policy is case-insensitive', async () => {
    // `Alice` and `alice` are the same account there, so folding cannot reach a second one.
    await expect(canFoldLockoutTargetCase(buildQueries(false), 'Alice')).resolves.toBe(true);
  });
});
