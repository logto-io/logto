import { DailyTokenUsage } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';
import { z } from 'zod';

import { getUtcStartOfTheDay } from '#src/oidc/utils.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(DailyTokenUsage);
const { fields: fieldsWithPrefix } = convertToIdentifiers(DailyTokenUsage, true);

type TokenUsageType = 'user' | 'm2m';

type RecordTokenUsageOptions = {
  type?: TokenUsageType;
};

type CountTokenUsageOptions = {
  from: Date;
  to: Date;
  type?: TokenUsageType | 'detailed';
};

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
  const recordTokenUsage = async (date: Date, options?: RecordTokenUsageOptions) => {
    const { type } = options ?? {};

    // For user tokens: increment both usage and user_token_usage
    // For M2M tokens: increment both usage and m2m_token_usage
    const userTokenIncrement =
      type === 'user'
        ? sql`${fieldsWithPrefix.userTokenUsage} + 1`
        : sql`${fieldsWithPrefix.userTokenUsage}`;
    const m2mTokenIncrement =
      type === 'm2m'
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
        ${type === 'user' ? 1 : 0},
        ${type === 'm2m' ? 1 : 0}
      )
      on conflict (${fields.date}, ${fields.tenantId}) do update set
        ${fields.usage} = ${fieldsWithPrefix.usage} + 1,
        ${fields.userTokenUsage} = ${userTokenIncrement},
        ${fields.m2mTokenUsage} = ${m2mTokenIncrement}
      returning ${sql.join(Object.values(fields), sql`, `)}
    `);
  };

  const countTokenUsage = async ({ from, to }: CountTokenUsageOptions) => {
    return pool.one<TokenUsageCounts>(sql`
        select
          sum(${fields.usage}) as total_usage,
          sum(${fields.userTokenUsage}) as user_token_usage,
          sum(${fields.m2mTokenUsage}) as m2m_token_usage
        from ${table}
        where ${fields.date} >= to_timestamp(${getUtcStartOfTheDay(
          from
        ).getTime()}::double precision / 1000)
          and ${fields.date} < to_timestamp(${getUtcStartOfTheDay(
            to
          ).getTime()}::double precision / 1000)
      `);
  };

  return {
    recordTokenUsage,
    countTokenUsage,
  };
};
