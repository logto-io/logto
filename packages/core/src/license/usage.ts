import {
  LicenseUsageMetric,
  adminTenantId,
  type LicenseUsage,
  type LicenseUsageLimits,
  type LicenseUsageStatement,
  type LicenseUsageWarning,
} from '@logto/schemas';
import { TtlCache } from '@logto/shared';
import { type Optional } from '@silverhand/essentials';
import { sql, type CommonQueryMethods } from '@silverhand/slonik';

import { createDailyActiveUsersQueries } from '#src/queries/daily-active-user.js';
import { createDailyTokenUsageQueries } from '#src/queries/daily-token-usage.js';
import createTenantQueries from '#src/queries/tenant.js';

import { licenseConsoleLog } from './console.js';

/**
 * How long collected usage is reused. Monthly counts barely move within an hour, and collecting
 * them scans every tenant's usage of the last two months.
 */
const licenseUsageCacheTtl = 60 * 60 * 1000;
/** A failed collection is retried sooner, but not on every request that asks for it. */
const failedCollectionCacheTtl = 60 * 1000;
/**
 * The statement timeout of the usage queries. Usage is advisory, so a slow database gives up on it
 * rather than holding a connection of the shared pool.
 */
const licenseUsageTimeout = 5000;
/**
 * The statement timeout of the usage statement queries. A statement is exported on demand and
 * scans a year of usage, so it may take longer than the collection the refresh and Console use.
 */
const licenseUsageStatementTimeout = 30_000;
/** How many full calendar months a usage statement covers. */
const usageStatementMonths = 12;

const cacheKey = 'usage';
const cache = new TtlCache<string, Promise<Optional<LicenseUsage>>>(licenseUsageCacheTtl);
/**
 * The usage statement of the current UTC month, keyed by that month. A statement only covers full
 * months, which no longer change, so it is read once a month.
 */
const statementCache = new Map<string, Promise<LicenseUsageStatement>>();

/** Drop the cached usage and usage statement so the next call reads them again. */
export const clearLicenseUsageCache = () => {
  cache.clear();
  statementCache.clear();
};

/** The UTC calendar month of `date` as `YYYY-MM`. */
const formatUsageMonth = (date: Date) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;

/**
 * The UTC calendar months usage is counted in: the current month so far, and the last full month
 * before it.
 */
export const getUsageMonths = (now: Date) => {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();

  return {
    /** The current month as `YYYY-MM`. */
    month: formatUsageMonth(now),
    /** The first instant of the last full month. */
    lastMonthStart: new Date(Date.UTC(year, month - 1, 1)),
    /** The first instant of the current month, which ends the last full month. */
    monthStart: new Date(Date.UTC(year, month, 1)),
  };
};

const collect = async (pool: CommonQueryMethods, now: Date): Promise<LicenseUsage> => {
  const { month, lastMonthStart, monthStart } = getUsageMonths(now);
  const monthlyUsageOptions = { lastMonthStart, monthStart, excludedTenantId: adminTenantId };

  return pool.transaction(async (connection) => {
    await connection.query(
      sql`set local statement_timeout = ${sql.literalValue(String(licenseUsageTimeout))}`
    );

    return {
      month,
      mau: await createDailyActiveUsersQueries(connection).countMonthlyActiveUsersExcludingTenant(
        monthlyUsageOptions
      ),
      monthlyAccessTokens:
        await createDailyTokenUsageQueries(connection).countMonthlyTokenUsageExcludingTenant(
          monthlyUsageOptions
        ),
      tenants: await createTenantQueries(connection).countTenantsExcluding(adminTenantId),
    };
  });
};

const tryCollect = async (pool: CommonQueryMethods): Promise<Optional<LicenseUsage>> => {
  try {
    return await collect(pool, new Date());
  } catch (error: unknown) {
    licenseConsoleLog.warn('Unable to collect the usage of this deployment.', error);
  }
};

/**
 * Collect the usage of this deployment from its database, across all tenants except the admin
 * tenant, in UTC calendar months.
 *
 * Usage is advisory and never on the critical path of a request, so this never throws: a failed or
 * timed-out collection is logged and answered with `undefined`. The result is cached per process
 * for {@link licenseUsageCacheTtl}, and concurrent callers share one collection.
 *
 * @param pool A pool that can read every tenant's usage, i.e. `EnvSet.sharedPool`. Tenant pools
 * are restricted to their own tenant by row-level security.
 */
export const collectLicenseUsage = async (
  pool: CommonQueryMethods
): Promise<Optional<LicenseUsage>> => {
  const cached = cache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const collecting = tryCollect(pool);
  cache.set(cacheKey, collecting);

  const usage = await collecting;

  if (!usage && cache.get(cacheKey) === collecting) {
    cache.set(cacheKey, collecting, failedCollectionCacheTtl);
  }

  return usage;
};

/** The metrics evaluated locally; the others, like production deployments, only Cloud can count. */
const locallyEvaluatedMetrics = Object.freeze([
  LicenseUsageMetric.Mau,
  LicenseUsageMetric.MonthlyAccessTokens,
] as const satisfies ReadonlyArray<keyof LicenseUsage & keyof LicenseUsageLimits>);

/**
 * Compare the usage of this deployment with the usage limits of its license.
 *
 * A metric exceeds its limit when the larger of its last full month and month-to-date counts is
 * above it. A month-to-date count only grows, so an early warning is never a false positive. An
 * absent or `null` limit means the metric is only reported, and never warns.
 */
export const evaluateUsage = (
  limits: Optional<LicenseUsageLimits>,
  usage: LicenseUsage
): LicenseUsageWarning[] =>
  locallyEvaluatedMetrics.flatMap((metric) => {
    const limit = limits?.[metric];
    const value = Math.max(usage[metric].lastMonth, usage[metric].monthToDate);

    return typeof limit === 'number' && value > limit ? [{ metric, limit, value }] : [];
  });

/**
 * Merge the usage warnings evaluated locally with the notices the license service returned with
 * the last refresh.
 *
 * A local warning wins for its metric, since it comes from the current usage of this deployment
 * while a notice is as old as the last refresh. A notice about any other metric, such as too many
 * production deployments, which only Logto Cloud can count, is kept.
 */
export const mergeUsageWarnings = (
  localWarnings: LicenseUsageWarning[],
  notices: LicenseUsageWarning[] = []
): LicenseUsageWarning[] => [
  ...localWarnings,
  ...notices.filter(({ metric }) => !localWarnings.some((warning) => warning.metric === metric)),
];

const readUsageStatement = async (
  pool: CommonQueryMethods,
  now: Date
): Promise<LicenseUsageStatement> => {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const monthStarts = Array.from(
    { length: usageStatementMonths },
    (_, index) => new Date(Date.UTC(year, month - usageStatementMonths + index, 1))
  );
  const options = {
    from: new Date(Date.UTC(year, month - usageStatementMonths, 1)),
    to: new Date(Date.UTC(year, month, 1)),
    excludedTenantId: adminTenantId,
  };

  const [activeUsers, tokenUsage] = await pool.transaction(async (connection) => {
    await connection.query(
      sql`set local statement_timeout = ${sql.literalValue(String(licenseUsageStatementTimeout))}`
    );

    return [
      await createDailyActiveUsersQueries(connection).countActiveUsersByMonthExcludingTenant(
        options
      ),
      await createDailyTokenUsageQueries(connection).countTokenUsageByMonthExcludingTenant(options),
    ] as const;
  });

  return {
    months: monthStarts.map((monthStart) => {
      const key = formatUsageMonth(monthStart);

      return {
        month: key,
        mau: activeUsers.get(key) ?? 0,
        monthlyAccessTokens: tokenUsage.get(key) ?? 0,
      };
    }),
  };
};

/**
 * Read the monthly usage of this deployment over the last {@link usageStatementMonths} full UTC
 * calendar months, across all tenants except the admin tenant, for the usage statement the
 * self-hosted terms ask a customer to provide.
 *
 * Unlike {@link collectLicenseUsage}, a statement is requested explicitly, so a failure is thrown to
 * the caller. Full months no longer change, so the statement is cached per process until the
 * current month ends, and concurrent callers share one read. A failed read is not cached.
 *
 * @param pool A pool that can read every tenant's usage, i.e. `EnvSet.sharedPool`.
 */
export const getLicenseUsageStatement = async (
  pool: CommonQueryMethods,
  now = new Date()
): Promise<LicenseUsageStatement> => {
  const month = formatUsageMonth(now);
  const cached = statementCache.get(month);

  if (cached) {
    return cached;
  }

  const reading = readUsageStatement(pool, now);
  // Only the statement of the current month is kept.
  statementCache.clear();
  statementCache.set(month, reading);

  try {
    return await reading;
  } catch (error: unknown) {
    if (statementCache.get(month) === reading) {
      statementCache.delete(month);
    }

    throw error;
  }
};
