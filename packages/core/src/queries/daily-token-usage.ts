import { DailyTokenUsage, type LicenseMonthlyUsage } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';
import { z } from 'zod';

import { getUtcStartOfTheDay } from '#src/oidc/utils.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(DailyTokenUsage);
const { fields: fieldsWithPrefix } = convertToIdentifiers(DailyTokenUsage, true);

export enum TokenUsageType {
  User = 'User',
  M2m = 'M2m',
}

export const tokenUsageCountsGuard = z.object({
  totalUsage: z.number().nonnegative(),
  userTokenUsage: z.number().nonnegative(),
  m2mTokenUsage: z.number().nonnegative(),
});

export type TokenUsageCounts = z.infer<typeof tokenUsageCountsGuard>;

export const createDailyTokenUsageQueries = (pool: CommonQueryMethods) => {
  /**
   * Record the token usage of the current date.
   *
   * @param date The current date.
   * @param options Options for recording token usage, including the type of token.
   * @returns The updated token usage of the current date.
   */
  /**
   * We opted to manually write a query instead of using existing query building methods,
   * as the latter couldn't support the complexity of this specific query logic.
   *
   * If we were to use the pre-built query methods, completing this operation would
   * require two database requests:
   * 1. to request the record
   * 2. to update it if the record exists, or insert a new one if it doesn't
   *
   * The approach we used allows us to accomplish the task within a single database query.
   */
  const recordTokenUsage = async (date: Date, { type }: { type: TokenUsageType }) => {
    // For user tokens: increment both usage and user_token_usage
    // For M2M tokens: increment both usage and m2m_token_usage
    const userTokenIncrement =
      type === TokenUsageType.User
        ? sql`${fieldsWithPrefix.userTokenUsage} + 1`
        : sql`${fieldsWithPrefix.userTokenUsage}`;
    const m2mTokenIncrement =
      type === TokenUsageType.M2m
        ? sql`${fieldsWithPrefix.m2mTokenUsage} + 1`
        : sql`${fieldsWithPrefix.m2mTokenUsage}`;

    return pool.one<DailyTokenUsage>(sql`
      insert into ${table} (
        ${fields.id},
        ${fields.date},
        ${fields.usage},
        ${fields.userTokenUsage},
        ${fields.m2mTokenUsage}
      )
      values (
        ${generateStandardId()},
        to_timestamp(${getUtcStartOfTheDay(date).getTime()}::double precision / 1000),
        1,
        ${type === TokenUsageType.User ? 1 : 0},
        ${type === TokenUsageType.M2m ? 1 : 0}
      )
      on conflict (${fields.date}, ${fields.tenantId}) do update set
        ${fields.usage} = ${fieldsWithPrefix.usage} + 1,
        ${fields.userTokenUsage} = ${userTokenIncrement},
        ${fields.m2mTokenUsage} = ${m2mTokenIncrement}
      returning ${sql.join(Object.values(fields), sql`, `)}
    `);
  };

  const countTokenUsage = async ({ from, to }: { from: Date; to: Date }) => {
    return pool.one<TokenUsageCounts>(sql`
        select
          coalesce(sum(${fields.usage}), 0) as total_usage,
          coalesce(sum(${fields.userTokenUsage}), 0) as user_token_usage,
          coalesce(sum(${fields.m2mTokenUsage}), 0) as m2m_token_usage
        from ${table}
        where ${fields.date} >= to_timestamp(${getUtcStartOfTheDay(
          from
        ).getTime()}::double precision / 1000)
          and ${fields.date} < to_timestamp(${getUtcStartOfTheDay(
            to
          ).getTime()}::double precision / 1000)
      `);
  };

  /**
   * Sum the token usage of the month starting at `lastMonthStart` and of the month starting at
   * `monthStart` so far, across every tenant except `excludedTenantId`.
   *
   * Only a pool that is not restricted to one tenant, i.e. `EnvSet.sharedPool`, sees every tenant.
   */
  const countMonthlyTokenUsageExcludingTenant = async ({
    lastMonthStart,
    monthStart,
    excludedTenantId,
  }: {
    lastMonthStart: Date;
    monthStart: Date;
    excludedTenantId: string;
  }): Promise<LicenseMonthlyUsage> => {
    const monthStartTimestamp = sql`to_timestamp(${monthStart.getTime()}::double precision / 1000)`;
    const { lastMonth, monthToDate } = await pool.one<
      Record<keyof LicenseMonthlyUsage, string>
    >(sql`
      select
        coalesce(sum(${fields.usage}) filter (where ${fields.date} < ${monthStartTimestamp}), 0)
          as last_month,
        coalesce(sum(${fields.usage}) filter (where ${fields.date} >= ${monthStartTimestamp}), 0)
          as month_to_date
      from ${table}
      where ${fields.date} >= to_timestamp(${lastMonthStart.getTime()}::double precision / 1000)
        and ${fields.tenantId} <> ${excludedTenantId}
    `);

    // The sum of a `bigint` column is a `numeric`, which comes back as a string.
    return { lastMonth: Number(lastMonth), monthToDate: Number(monthToDate) };
  };

  /**
   * Sum the token usage of every UTC calendar month from `from` until `to`, across every tenant
   * except `excludedTenantId`. A month without token usage has no row.
   *
   * Only a pool that is not restricted to one tenant, i.e. `EnvSet.sharedPool`, sees every tenant.
   */
  const countTokenUsageByMonthExcludingTenant = async ({
    from,
    to,
    excludedTenantId,
  }: {
    from: Date;
    to: Date;
    excludedTenantId: string;
  }): Promise<Map<string, number>> => {
    const rows = await pool.any<{ month: string; usage: string }>(sql`
      select
        to_char(${fields.date} at time zone 'UTC', 'YYYY-MM') as month,
        sum(${fields.usage}) as usage
      from ${table}
      where ${fields.date} >= to_timestamp(${from.getTime()}::double precision / 1000)
        and ${fields.date} < to_timestamp(${to.getTime()}::double precision / 1000)
        and ${fields.tenantId} <> ${excludedTenantId}
      group by 1
    `);

    // The sum of a `bigint` column is a `numeric`, which comes back as a string.
    return new Map(rows.map(({ month, usage }) => [month, Number(usage)]));
  };

  return {
    recordTokenUsage,
    countTokenUsage,
    countMonthlyTokenUsageExcludingTenant,
    countTokenUsageByMonthExcludingTenant,
  };
};
