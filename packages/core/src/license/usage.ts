import {
  DailyActiveUsers,
  DailyTokenUsage,
  LicenseUsageMetric,
  adminTenantId,
  type LicenseMonthlyUsage,
  type LicenseUsage,
  type LicenseUsageLimits,
  type LicenseUsageWarning,
} from '@logto/schemas';
import { Tenants } from '@logto/schemas/models';
import { TtlCache } from '@logto/shared';
import { type Optional } from '@silverhand/essentials';
import { sql, type CommonQueryMethods } from '@silverhand/slonik';

import { convertToIdentifiers } from '#src/utils/sql.js';

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

const cacheKey = 'usage';
const cache = new TtlCache<string, Promise<Optional<LicenseUsage>>>(licenseUsageCacheTtl);

/** Drop the cached usage so the next call collects it again. */
export const clearLicenseUsageCache = () => {
  cache.clear();
};

const toUtcTimestamp = (date: Date) =>
  sql`to_timestamp(${date.getTime()}::double precision / 1000)`;

/**
 * The UTC calendar months usage is counted in: the current month so far, and the last full month
 * before it.
 */
export const getUsageMonths = (now: Date) => {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();

  return {
    /** The current month as `YYYY-MM`. */
    month: `${year}-${String(month + 1).padStart(2, '0')}`,
    /** The first instant of the last full month. */
    lastMonthStart: new Date(Date.UTC(year, month - 1, 1)),
    /** The first instant of the current month, which ends the last full month. */
    monthStart: new Date(Date.UTC(year, month, 1)),
  };
};

const collect = async (pool: CommonQueryMethods, now: Date): Promise<LicenseUsage> => {
  const { month, lastMonthStart, monthStart } = getUsageMonths(now);
  const activeUsers = convertToIdentifiers(DailyActiveUsers);
  const tokenUsage = convertToIdentifiers(DailyTokenUsage);
  const tenants = convertToIdentifiers({ table: Tenants.tableName, fields: Tenants.rawKeys });

  return pool.transaction(async (connection) => {
    await connection.query(
      sql`set local statement_timeout = ${sql.literalValue(String(licenseUsageTimeout))}`
    );

    // A user ID is only unique within its tenant, so a user is counted per tenant.
    const { fields: activeUserFields } = activeUsers;
    const activeUser = sql`(${activeUserFields.tenantId}, ${activeUserFields.userId})`;
    const mau = await connection.one<Record<keyof LicenseMonthlyUsage, string | number>>(sql`
      select
        count(distinct ${activeUser}) filter (
          where ${activeUserFields.date} < ${toUtcTimestamp(monthStart)}
        ) as last_month,
        count(distinct ${activeUser}) filter (
          where ${activeUserFields.date} >= ${toUtcTimestamp(monthStart)}
        ) as month_to_date
      from ${activeUsers.table}
      where ${activeUserFields.date} >= ${toUtcTimestamp(lastMonthStart)}
        and ${activeUserFields.tenantId} <> ${adminTenantId}
    `);

    const { fields: tokenFields } = tokenUsage;
    const tokens = await connection.one<Record<keyof LicenseMonthlyUsage, string | number>>(sql`
      select
        coalesce(sum(${tokenFields.usage}) filter (
          where ${tokenFields.date} < ${toUtcTimestamp(monthStart)}
        ), 0) as last_month,
        coalesce(sum(${tokenFields.usage}) filter (
          where ${tokenFields.date} >= ${toUtcTimestamp(monthStart)}
        ), 0) as month_to_date
      from ${tokenUsage.table}
      where ${tokenFields.date} >= ${toUtcTimestamp(lastMonthStart)}
        and ${tokenFields.tenantId} <> ${adminTenantId}
    `);

    const tenantCount = await connection.oneFirst<string | number>(sql`
      select count(*) from ${tenants.table}
      where ${tenants.fields.id} <> ${adminTenantId}
    `);

    // Counts and sums of `bigint` columns may come back as strings.
    return {
      month,
      mau: { lastMonth: Number(mau.lastMonth), monthToDate: Number(mau.monthToDate) },
      monthlyAccessTokens: {
        lastMonth: Number(tokens.lastMonth),
        monthToDate: Number(tokens.monthToDate),
      },
      tenants: Number(tenantCount),
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
