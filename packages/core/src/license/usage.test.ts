import { LicenseUsageMetric, adminTenantId, type LicenseUsage } from '@logto/schemas';
import { noop } from '@silverhand/essentials';
import { createMockPool, createMockQueryResult } from '@silverhand/slonik';

import { licenseConsoleLog } from './console.js';
import {
  clearLicenseUsageCache,
  collectLicenseUsage,
  evaluateUsage,
  getLicenseUsageStatement,
  getUsageMonths,
  mergeUsageWarnings,
} from './usage.js';

const { jest } = import.meta;

const query = jest.fn<
  Promise<ReturnType<typeof createMockQueryResult>>,
  [string, readonly unknown[]]
>();
const pool = createMockPool({ query: async (sql, values) => query(sql, values) });

/** Answer the usage queries the way Postgres does, after the camel case interceptor, with `bigint` aggregates as strings. */
const answerUsageQueries = () => {
  query.mockImplementation(async (sql) => {
    if (sql.includes('daily_active_users')) {
      return createMockQueryResult([{ lastMonth: '120', monthToDate: '40' }]);
    }

    if (sql.includes('daily_token_usage')) {
      return createMockQueryResult([{ lastMonth: '9000', monthToDate: '3000' }]);
    }

    if (sql.includes('tenants')) {
      return createMockQueryResult([{ count: '2' }]);
    }

    return createMockQueryResult([]);
  });
};

const warn = jest.spyOn(licenseConsoleLog, 'warn').mockImplementation(noop);

const toEpochSeconds = (iso: string) => Date.parse(iso) / 1000;

describe('getUsageMonths', () => {
  it.each([
    ['2026-10-14T06:30:00.000Z', '2026-10', '2026-09-01T00:00:00.000Z', '2026-10-01T00:00:00.000Z'],
    ['2026-10-31T23:59:59.999Z', '2026-10', '2026-09-01T00:00:00.000Z', '2026-10-01T00:00:00.000Z'],
    ['2026-11-01T00:00:00.000Z', '2026-11', '2026-10-01T00:00:00.000Z', '2026-11-01T00:00:00.000Z'],
    ['2027-01-05T00:00:00.000Z', '2027-01', '2026-12-01T00:00:00.000Z', '2027-01-01T00:00:00.000Z'],
    ['2028-03-01T00:00:00.000Z', '2028-03', '2028-02-01T00:00:00.000Z', '2028-03-01T00:00:00.000Z'],
  ])('counts %s in %s after the month from %s', (now, month, lastMonthStart, monthStart) => {
    expect(getUsageMonths(new Date(now))).toEqual({
      month,
      lastMonthStart: new Date(lastMonthStart),
      monthStart: new Date(monthStart),
    });
  });

  it('uses UTC months regardless of the local offset', () => {
    // 2026-11-01 01:00 in UTC+2, still October in UTC.
    expect(getUsageMonths(new Date('2026-11-01T01:00:00.000+02:00')).month).toBe('2026-10');
  });
});

describe('collectLicenseUsage', () => {
  beforeEach(() => {
    clearLicenseUsageCache();
    query.mockReset();
    jest.useFakeTimers({ now: new Date('2027-01-05T08:00:00.000Z'), doNotFake: ['nextTick'] });
  });

  afterEach(() => {
    jest.useRealTimers();
    warn.mockClear();
  });

  it('collects the last full month and the month to date', async () => {
    answerUsageQueries();

    await expect(collectLicenseUsage(pool)).resolves.toStrictEqual({
      month: '2027-01',
      mau: { lastMonth: 120, monthToDate: 40 },
      monthlyAccessTokens: { lastMonth: 9000, monthToDate: 3000 },
      tenants: 2,
    } satisfies LicenseUsage);
  });

  it('counts from the start of the last month and splits at the start of this month', async () => {
    answerUsageQueries();
    await collectLicenseUsage(pool);

    for (const table of ['daily_active_users', 'daily_token_usage']) {
      const call = query.mock.calls.find(([sql]) => sql.includes(table));

      expect(call?.[1]).toEqual(
        expect.arrayContaining([
          toEpochSeconds('2026-12-01T00:00:00.000Z') * 1000,
          toEpochSeconds('2027-01-01T00:00:00.000Z') * 1000,
        ])
      );
    }
  });

  it('excludes the admin tenant from every count', async () => {
    answerUsageQueries();
    await collectLicenseUsage(pool);

    for (const table of ['daily_active_users', 'daily_token_usage', 'tenants']) {
      const call = query.mock.calls.find(([sql]) => sql.includes(table));

      expect(call?.[0]).toMatch(/<> \$\d+/);
      expect(call?.[1]).toContain(adminTenantId);
    }
  });

  it('bounds the queries with a statement timeout', async () => {
    answerUsageQueries();
    await collectLicenseUsage(pool);

    expect(query.mock.calls.some(([sql]) => sql.includes('set local statement_timeout'))).toBe(
      true
    );
  });

  it('reuses the collected usage for an hour', async () => {
    answerUsageQueries();
    await collectLicenseUsage(pool);
    const calls = query.mock.calls.length;

    jest.advanceTimersByTime(59 * 60 * 1000);
    await collectLicenseUsage(pool);
    expect(query).toHaveBeenCalledTimes(calls);

    jest.advanceTimersByTime(2 * 60 * 1000);
    await collectLicenseUsage(pool);
    expect(query.mock.calls.length).toBeGreaterThan(calls);
  });

  it('answers `undefined` instead of throwing when the database fails', async () => {
    query.mockRejectedValue(new Error('canceling statement due to statement timeout'));

    await expect(collectLicenseUsage(pool)).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalled();

    // The failure is retried after a minute rather than kept for the whole hour.
    answerUsageQueries();
    jest.advanceTimersByTime(61 * 1000);
    await expect(collectLicenseUsage(pool)).resolves.toMatchObject({ tenants: 2 });
  });
});

describe('evaluateUsage', () => {
  const usage: LicenseUsage = {
    month: '2026-10',
    mau: { lastMonth: 50_001, monthToDate: 12_000 },
    monthlyAccessTokens: { lastMonth: 30_000, monthToDate: 50_500 },
    tenants: 3,
  };

  it('warns about every metric whose last month or month to date is above its limit', () => {
    expect(evaluateUsage({ mau: 50_000, monthlyAccessTokens: 50_000 }, usage)).toEqual([
      { metric: LicenseUsageMetric.Mau, limit: 50_000, value: 50_001 },
      { metric: LicenseUsageMetric.MonthlyAccessTokens, limit: 50_000, value: 50_500 },
    ]);
  });

  it('does not warn at exactly the limit', () => {
    expect(evaluateUsage({ mau: 50_001, monthlyAccessTokens: 50_500 }, usage)).toEqual([]);
  });

  it('does not warn without usage limits', () => {
    expect(evaluateUsage(undefined, usage)).toEqual([]);
    expect(evaluateUsage({}, usage)).toEqual([]);
  });

  it('treats a `null` limit as report only', () => {
    expect(evaluateUsage({ mau: null, monthlyAccessTokens: 50_000 }, usage)).toEqual([
      { metric: LicenseUsageMetric.MonthlyAccessTokens, limit: 50_000, value: 50_500 },
    ]);
  });

  it('applies a limit of 0', () => {
    expect(evaluateUsage({ mau: 0 }, { ...usage, mau: { lastMonth: 0, monthToDate: 1 } })).toEqual([
      { metric: LicenseUsageMetric.Mau, limit: 0, value: 1 },
    ]);
  });

  it('leaves production deployments to Logto Cloud', () => {
    expect(evaluateUsage({ productionDeployments: 0 }, usage)).toEqual([]);
  });
});

describe('mergeUsageWarnings', () => {
  const localMau = { metric: LicenseUsageMetric.Mau, limit: 50_000, value: 50_001 };

  it('keeps the notices about metrics only Logto Cloud evaluates', () => {
    const deployments = { metric: LicenseUsageMetric.ProductionDeployments, limit: 1, value: 2 };

    expect(mergeUsageWarnings([localMau], [deployments])).toEqual([localMau, deployments]);
  });

  it('prefers the local warning over a notice about the same metric', () => {
    expect(
      mergeUsageWarnings([localMau], [{ metric: LicenseUsageMetric.Mau, limit: 50_000, value: 1 }])
    ).toEqual([localMau]);
  });

  it('keeps a notice about a metric this deployment does not warn about', () => {
    const tokens = { metric: LicenseUsageMetric.MonthlyAccessTokens, limit: 50_000, value: 60_000 };

    expect(mergeUsageWarnings([], [tokens])).toEqual([tokens]);
    expect(mergeUsageWarnings([localMau])).toEqual([localMau]);
  });
});

describe('getLicenseUsageStatement', () => {
  beforeEach(() => {
    clearLicenseUsageCache();
    query.mockReset();
  });

  it('reports the last 12 full months, oldest first, with zero for a month without usage', async () => {
    query.mockImplementation(async (sql) => {
      if (sql.includes('daily_active_users')) {
        return createMockQueryResult([
          { month: '2025-01', count: '7' },
          { month: '2025-12', count: '120' },
        ]);
      }

      if (sql.includes('daily_token_usage')) {
        return createMockQueryResult([{ month: '2025-12', usage: '9000' }]);
      }

      return createMockQueryResult([]);
    });

    const { months } = await getLicenseUsageStatement(pool, new Date('2026-01-05T08:00:00.000Z'));

    expect(months).toHaveLength(12);
    expect(months[0]).toEqual({ month: '2025-01', mau: 7, monthlyAccessTokens: 0 });
    expect(months[1]).toEqual({ month: '2025-02', mau: 0, monthlyAccessTokens: 0 });
    expect(months[11]).toEqual({ month: '2025-12', mau: 120, monthlyAccessTokens: 9000 });

    for (const table of ['daily_active_users', 'daily_token_usage']) {
      const call = query.mock.calls.find(([sql]) => sql.includes(table));

      // From the first full month up to, not including, the current month.
      expect(call?.[1]).toEqual(
        expect.arrayContaining([
          toEpochSeconds('2025-01-01T00:00:00.000Z') * 1000,
          toEpochSeconds('2026-01-01T00:00:00.000Z') * 1000,
          adminTenantId,
        ])
      );
    }
  });

  it('reads the statement once a month', async () => {
    query.mockResolvedValue(createMockQueryResult([]));
    const countReads = () =>
      query.mock.calls.filter(([sql]) => sql.includes('daily_active_users')).length;

    await getLicenseUsageStatement(pool, new Date('2026-01-05T08:00:00.000Z'));
    await getLicenseUsageStatement(pool, new Date('2026-01-31T23:59:59.999Z'));
    expect(countReads()).toBe(1);

    const { months } = await getLicenseUsageStatement(pool, new Date('2026-02-01T00:00:00.000Z'));
    expect(countReads()).toBe(2);
    expect(months.at(-1)?.month).toBe('2026-01');
  });

  it('throws when the database fails, and reads again on the next call', async () => {
    query.mockRejectedValueOnce(new Error('canceling statement due to statement timeout'));

    await expect(getLicenseUsageStatement(pool)).rejects.toThrow('statement timeout');

    query.mockResolvedValue(createMockQueryResult([]));
    await expect(getLicenseUsageStatement(pool)).resolves.toHaveProperty('months');
  });
});
