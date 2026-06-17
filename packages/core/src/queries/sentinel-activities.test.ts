import {
  SentinelActivities,
  SentinelActivityAction,
  SentinelActivityTargetType,
  SentinelActionResult,
  SentinelDecision,
} from '@logto/schemas';
import { createMockPool, createMockQueryResult, sql } from '@silverhand/slonik';

import { convertToIdentifiers } from '#src/utils/sql.js';
import type { QueryType } from '#src/utils/test-utils.js';
import { expectSqlAssert } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const mockQuery: jest.MockedFunction<QueryType> = jest.fn();

const pool = createMockPool({
  query: async (sql, values) => {
    return mockQuery(sql, values);
  },
});

const { createSentinelActivitiesQueries } = await import('./sentinel-activities.js');
const { insertActivity, countActivities } = createSentinelActivitiesQueries(pool);

describe('sentinel activities queries', () => {
  const { table, fields } = convertToIdentifiers(SentinelActivities, true);

  it('countActivities counts matching rows within the window', async () => {
    const expectSql = sql`
      select count(*)
      from ${table}
      where ${fields.targetType} = $1
        and ${fields.targetHash} = $2
        and ${fields.action} = $3
        and ${fields.createdAt} > now() - make_interval(secs => $4)
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([
        SentinelActivityTargetType.User,
        'target-hash',
        SentinelActivityAction.VerificationCodeSend,
        3600,
      ]);

      // Slonik surfaces count(*) (a bigint) as a string in production; countActivities coerces it.
      return createMockQueryResult([{ count: '2' }]);
    });

    await expect(
      countActivities({
        targetType: SentinelActivityTargetType.User,
        targetHash: 'target-hash',
        action: SentinelActivityAction.VerificationCodeSend,
        windowSeconds: 3600,
      })
    ).resolves.toBe(2);
  });

  it('insertActivity inserts into the sentinel_activities table', async () => {
    const activity = {
      id: 'activity-id',
      targetType: SentinelActivityTargetType.User,
      targetHash: 'target-hash',
      action: SentinelActivityAction.VerificationCodeSend,
      actionResult: SentinelActionResult.Success,
      payload: {},
      decision: SentinelDecision.Allowed,
      decisionExpiresAt: 123,
    };

    mockQuery.mockImplementationOnce(async (sql) => {
      expect(sql).toMatch(/insert into "sentinel_activities"/i);

      return createMockQueryResult([]);
    });

    await expect(insertActivity(activity)).resolves.toBeUndefined();
  });
});
