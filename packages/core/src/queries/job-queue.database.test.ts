/**
 * Query tests for the `jobs` adapters against a seeded Postgres database (`logto db seed --test`).
 * They run only when `JOB_QUEUE_TEST_DB_URL` points to such a database, and they delete every
 * row in its `jobs` table.
 */
import { type ClaimDueInput, type ClaimedJobRow } from '@logto/job-queue';
import { adminTenantId, defaultTenantId } from '@logto/schemas';
import { assert, type Nullable } from '@silverhand/essentials';
import {
  createInterceptorsPreset,
  createPool,
  sql,
  type CommonQueryMethods,
  type DatabasePool,
} from '@silverhand/slonik';

import { createJobQueueQueries } from './job-queue.js';
import { createJobQueries } from './jobs.js';

const databaseUrl = process.env.JOB_QUEUE_TEST_DB_URL;
const describeWithDatabase = databaseUrl ? describe : describe.skip;

const jobType = 'test';

type SeedJob = {
  id: string;
  tenantId?: string;
  groupKey?: string;
  /** Seconds relative to now; negative is in the past. */
  dueIn?: number;
  claimedBy?: string;
  attempts?: number;
};

const claimInput = (input: Partial<ClaimDueInput> & Pick<ClaimDueInput, 'workerId'>) => ({
  limit: 100,
  types: [{ type: jobType, leaseMs: 60_000 }],
  tenantRemainingSlots: [],
  groupRemainingSlots: [],
  ...input,
});

const ids = (rows: readonly ClaimedJobRow[]) =>
  rows
    .map(({ id }) => id)
    .slice()
    .sort();

/** 25 due rows in one group, all older than a row due one second ago. */
const backlog = (prefix: string, tenantId: string, groupKey: string): SeedJob[] =>
  Array.from({ length: 25 }, (_, index) => ({
    id: `${prefix}-${index}`,
    tenantId,
    groupKey,
    dueIn: -100 + index,
  }));

const runAsTenant = async <T>(
  pool: DatabasePool,
  tenantId: string,
  step: (connection: CommonQueryMethods) => Promise<T>
) =>
  pool.transaction(async (transaction) => {
    const { dbUser } = await transaction.one<{ dbUser: Nullable<string> }>(
      sql`select db_user from tenants where id = ${tenantId}`
    );
    assert(dbUser, new Error(`Tenant ${tenantId} has no database role`));
    await transaction.query(sql`set local role ${sql.identifier([dbUser])}`);

    return step(transaction);
  });

describeWithDatabase('job queue queries on Postgres', () => {
  /* eslint-disable @silverhand/fp/no-let -- pool handle assigned in beforeAll */
  let pool: DatabasePool;
  /* eslint-enable @silverhand/fp/no-let */

  const queries = () => createJobQueueQueries(pool);

  const seed = async (jobs: SeedJob[]) => {
    for (const {
      id,
      tenantId = defaultTenantId,
      groupKey = 'group',
      dueIn = -1,
      claimedBy,
      attempts = 0,
    } of jobs) {
      // eslint-disable-next-line no-await-in-loop -- insertion order is part of the fixture
      await pool.query(sql`
        insert into jobs (tenant_id, id, type, group_key, attempts, claimed_by, next_attempt_at)
        values (
          ${tenantId}, ${id}, ${jobType}, ${groupKey}, ${attempts}, ${claimedBy ?? null},
          now() + ${dueIn} * interval '1 second'
        )
      `);
    }
  };

  const findJob = async (id: string) =>
    pool.maybeOne<{ claimedBy: Nullable<string>; attempts: number; nextAttemptAt: number }>(
      sql`select claimed_by, attempts, next_attempt_at from jobs where id = ${id}`
    );

  const enqueue = async (tenantId: string, id: string, dedupeKey: string) =>
    runAsTenant(pool, tenantId, async (connection) =>
      createJobQueries(connection).enqueueJob({
        id,
        type: jobType,
        groupKey: 'hook',
        dedupeKey,
        payload: '{"b":1,"a":2}',
      })
    );

  const expireLease = async (id: string) =>
    pool.query(sql`update jobs set next_attempt_at = now() - interval '1 second' where id = ${id}`);

  beforeAll(async () => {
    assert(databaseUrl, new Error('JOB_QUEUE_TEST_DB_URL is required'));
    // eslint-disable-next-line @silverhand/fp/no-mutation -- pool handle assigned in beforeAll
    pool = await createPool(databaseUrl, { interceptors: createInterceptorsPreset() });
  });

  beforeEach(async () => {
    await pool.query(sql`delete from jobs`);
  });

  afterAll(async () => {
    await pool.query(sql`delete from jobs`);
    await pool.end();
  });

  describe('claimDue()', () => {
    it('claims due rows oldest first, leases them, and skips rows not yet due', async () => {
      await seed([
        { id: 'newer', dueIn: -10 },
        { id: 'oldest', dueIn: -30 },
        { id: 'older', dueIn: -20 },
        { id: 'future', dueIn: 60 },
      ]);

      const rows = await queries().claimDue(claimInput({ workerId: 'worker-1', limit: 2 }));

      expect(rows.map(({ id }) => id)).toEqual(['oldest', 'older']);
      expect(rows.map(({ claimedBy, attempts }) => ({ claimedBy, attempts }))).toEqual([
        { claimedBy: 'worker-1', attempts: 1 },
        { claimedBy: 'worker-1', attempts: 1 },
      ]);
      const leaseEndsIn = rows[0]!.nextAttemptAt - Date.now();
      expect(leaseEndsIn).toBeGreaterThan(50_000);
      expect(leaseEndsIn).toBeLessThanOrEqual(61_000);
      await expect(findJob('future')).resolves.toMatchObject({ claimedBy: null, attempts: 0 });
    });

    it('returns disjoint rows to concurrent workers', async () => {
      await seed(
        Array.from({ length: 40 }, (_, index) => ({
          id: `job-${index}`,
          groupKey: `group-${index % 7}`,
        }))
      );

      const workers = Array.from({ length: 6 }, (_, index) => `worker-${index}`);
      const batches = await Promise.all(
        workers.map(async (workerId) => queries().claimDue(claimInput({ workerId, limit: 10 })))
      );

      const claimed = batches.flatMap((rows) => ids(rows));
      expect(new Set(claimed).size).toBe(claimed.length);

      for (const [index, rows] of batches.entries()) {
        for (const { id } of rows) {
          // eslint-disable-next-line no-await-in-loop -- reads back each claimed row
          await expect(findJob(id)).resolves.toMatchObject({ claimedBy: workers[index] });
        }
      }

      // Rows skipped under lock contention are still due, and a later claim takes all of them.
      const rest = await queries().claimDue(claimInput({ workerId: 'worker-late' }));
      expect(claimed.length + rest.length).toBe(40);
    });

    it('caps each group and each tenant within one batch', async () => {
      await seed([
        { id: 'a-1', groupKey: 'a', dueIn: -50 },
        { id: 'a-2', groupKey: 'a', dueIn: -49 },
        { id: 'a-3', groupKey: 'a', dueIn: -48 },
        { id: 'a-4', groupKey: 'a', dueIn: -47 },
        { id: 'b-1', groupKey: 'b', dueIn: -10 },
        { id: 'c-1', groupKey: 'c', dueIn: -9 },
        { id: 'd-1', groupKey: 'd', dueIn: -8 },
        { id: 'admin-1', tenantId: adminTenantId, groupKey: 'a', dueIn: -5 },
        { id: 'admin-2', tenantId: adminTenantId, groupKey: 'b', dueIn: -4 },
      ]);

      const rows = await queries().claimDue(
        claimInput({
          workerId: 'worker-1',
          types: [
            { type: jobType, leaseMs: 60_000, perGroupConcurrency: 2, perTenantConcurrency: 3 },
          ],
        })
      );

      // Default tenant: group `a` stops at 2 and the tenant at 3, oldest first.
      expect(ids(rows)).toEqual(['a-1', 'a-2', 'admin-1', 'admin-2', 'b-1']);
    });

    it('applies slots already in flight across batches', async () => {
      await seed([
        { id: 'a-1', groupKey: 'a', dueIn: -50 },
        { id: 'a-2', groupKey: 'a', dueIn: -49 },
        { id: 'b-1', groupKey: 'b', dueIn: -40 },
        { id: 'c-1', groupKey: 'c', dueIn: -30 },
        { id: 'c-2', groupKey: 'c', dueIn: -29 },
        { id: 'admin-1', tenantId: adminTenantId, groupKey: 'a', dueIn: -20 },
        { id: 'admin-2', tenantId: adminTenantId, groupKey: 'a', dueIn: -19 },
      ]);

      const rows = await queries().claimDue(
        claimInput({
          workerId: 'worker-1',
          types: [
            { type: jobType, leaseMs: 60_000, perGroupConcurrency: 2, perTenantConcurrency: 3 },
          ],
          // Default tenant has 1 job in flight in `a`, so 2 tenant slots and 1 `a` slot remain.
          tenantRemainingSlots: [{ tenantId: defaultTenantId, type: jobType, remainingSlots: 2 }],
          groupRemainingSlots: [
            { tenantId: defaultTenantId, type: jobType, groupKey: 'a', remainingSlots: 1 },
            { tenantId: defaultTenantId, type: jobType, groupKey: 'b', remainingSlots: 0 },
          ],
        })
      );

      expect(ids(rows)).toEqual(['a-1', 'admin-1', 'admin-2', 'c-1']);
    });

    it('skips saturated tenants', async () => {
      await seed([
        { id: 'default-1' },
        { id: 'admin-1', tenantId: adminTenantId, groupKey: 'other' },
      ]);

      const rows = await queries().claimDue(
        claimInput({
          workerId: 'worker-1',
          tenantRemainingSlots: [{ tenantId: defaultTenantId, type: jobType, remainingSlots: 0 }],
        })
      );

      expect(ids(rows)).toEqual(['admin-1']);
    });

    it('keeps backlogs of saturated groups and tenants out of the claim window', async () => {
      await seed([
        ...backlog('busy-group', defaultTenantId, 'busy'),
        ...backlog('busy-tenant', adminTenantId, 'other'),
        { id: 'fresh', groupKey: 'fresh', dueIn: -1 },
      ]);

      // One free slot considers 20 rows, fewer than either older backlog.
      const rows = await queries().claimDue(
        claimInput({
          workerId: 'worker-1',
          limit: 1,
          tenantRemainingSlots: [{ tenantId: adminTenantId, type: jobType, remainingSlots: 0 }],
          groupRemainingSlots: [
            { tenantId: defaultTenantId, type: jobType, groupKey: 'busy', remainingSlots: 0 },
          ],
        })
      );

      expect(ids(rows)).toEqual(['fresh']);
    });

    it('reclaims a row whose lease expired but not one still leased', async () => {
      await seed([
        { id: 'expired', claimedBy: 'stalled', attempts: 1, dueIn: -1 },
        { id: 'leased', claimedBy: 'busy', attempts: 1, dueIn: 30 },
      ]);

      const rows = await queries().claimDue(claimInput({ workerId: 'worker-2' }));

      expect(rows).toEqual([
        expect.objectContaining({ id: 'expired', claimedBy: 'worker-2', attempts: 2 }),
      ]);
      await expect(findJob('leased')).resolves.toMatchObject({ claimedBy: 'busy', attempts: 1 });
    });
  });

  describe('settle()', () => {
    it('rejects a stale writer once another worker reclaimed the row', async () => {
      await seed([{ id: 'job' }]);
      const [first] = await queries().claimDue(claimInput({ workerId: 'worker-1' }));
      assert(first, new Error('Expected a claimed row'));
      await expireLease('job');
      const [second] = await queries().claimDue(claimInput({ workerId: 'worker-2' }));
      assert(second, new Error('Expected a reclaimed row'));

      await expect(
        queries().settle({ job: first, workerId: 'worker-1', resolution: { status: 'done' } })
      ).resolves.toBe('stale');
      await expect(findJob('job')).resolves.toMatchObject({ claimedBy: 'worker-2', attempts: 2 });

      const nextAttemptAt = Date.now() + 10_000;
      await expect(
        queries().settle({
          job: second,
          workerId: 'worker-2',
          resolution: { status: 'retry', delayMs: 10_000, nextAttemptAt },
        })
      ).resolves.toBe('settled');
      const retried = await findJob('job');
      expect(retried).toMatchObject({ claimedBy: null, attempts: 2 });
      expect(Math.abs(retried!.nextAttemptAt - nextAttemptAt)).toBeLessThan(5);
    });

    it('rejects the same worker settling an earlier attempt', async () => {
      await seed([{ id: 'job' }]);
      const [first] = await queries().claimDue(claimInput({ workerId: 'worker-1' }));
      assert(first, new Error('Expected a claimed row'));
      await expireLease('job');
      await queries().claimDue(claimInput({ workerId: 'worker-1' }));

      await expect(
        queries().settle({ job: first, workerId: 'worker-1', resolution: { status: 'done' } })
      ).resolves.toBe('stale');
      await expect(findJob('job')).resolves.toMatchObject({ attempts: 2 });
    });

    it('rejects a settlement naming another tenant', async () => {
      await seed([{ id: 'job' }]);
      const [job] = await queries().claimDue(claimInput({ workerId: 'worker-1' }));
      assert(job, new Error('Expected a claimed row'));

      await expect(
        queries().settle({
          job: { ...job, tenantId: adminTenantId },
          workerId: 'worker-1',
          resolution: { status: 'fail' },
        })
      ).resolves.toBe('stale');
      await expect(
        queries().settle({ job, workerId: 'worker-1', resolution: { status: 'exhausted' } })
      ).resolves.toBe('settled');
      await expect(findJob('job')).resolves.toBeNull();
    });
  });

  describe('releaseClaimed()', () => {
    it('hands back only the rows this worker still holds, due now', async () => {
      await seed([{ id: 'job-1' }, { id: 'job-2' }, { id: 'job-3', groupKey: 'other' }]);
      const claimed = await queries().claimDue(
        claimInput({ workerId: 'worker-1', types: [{ type: jobType, leaseMs: 600_000 }] })
      );
      expect(claimed).toHaveLength(3);
      await expireLease('job-3');
      await queries().claimDue(claimInput({ workerId: 'worker-2' }));

      await expect(queries().releaseClaimed({ workerId: 'worker-1', jobs: claimed })).resolves.toBe(
        2
      );

      for (const id of ['job-1', 'job-2']) {
        // eslint-disable-next-line no-await-in-loop -- reads back each released row
        const job = await findJob(id);
        expect(job).toMatchObject({ claimedBy: null, attempts: 1 });
        expect(job!.nextAttemptAt).toBeLessThanOrEqual(Date.now() + 1000);
      }
      await expect(findJob('job-3')).resolves.toMatchObject({ claimedBy: 'worker-2' });
    });

    it('leaves a row already handed back for retry at its retry time', async () => {
      await seed([{ id: 'job' }]);
      const claimed = await queries().claimDue(claimInput({ workerId: 'worker-1' }));
      const nextAttemptAt = Date.now() + 60_000;
      await queries().settle({
        job: claimed[0]!,
        workerId: 'worker-1',
        resolution: { status: 'retry', delayMs: 60_000, nextAttemptAt },
      });

      await expect(queries().releaseClaimed({ workerId: 'worker-1', jobs: claimed })).resolves.toBe(
        0
      );
      const job = await findJob('job');
      expect(Math.abs(job!.nextAttemptAt - nextAttemptAt)).toBeLessThan(5);
    });
  });

  describe('getGauges()', () => {
    it('ages the row due longest, ignoring rows under a lease or a backoff', async () => {
      await pool.query(sql`
        insert into jobs (tenant_id, id, type, group_key, claimed_by, next_attempt_at, created_at)
        values
          (${defaultTenantId}, 'leased', ${jobType}, 'a', 'w', now() + interval '1 minute',
            now() - interval '3 hours'),
          (${defaultTenantId}, 'backoff', ${jobType}, 'a', null, now() + interval '1 hour',
            now() - interval '2 hours'),
          (${defaultTenantId}, 'expired', ${jobType}, 'a', 'w', now() - interval '10 minutes',
            now() - interval '11 minutes'),
          (${defaultTenantId}, 'waiting', ${jobType}, 'a', null, now() - interval '1 minute',
            now() - interval '1 minute')
      `);

      const gauges = await queries().getGauges();

      expect(gauges).toMatchObject({ depth: 4, expiredLeases: 1 });
      expect(gauges.oldestWaitingAgeMs).toBeGreaterThanOrEqual(600_000);
      expect(gauges.oldestWaitingAgeMs).toBeLessThan(660_000);
    });

    it('reports zero age when no row is due', async () => {
      await expect(queries().getGauges()).resolves.toEqual({
        depth: 0,
        oldestWaitingAgeMs: 0,
        expiredLeases: 0,
      });

      await seed([{ id: 'later', dueIn: 3600 }]);

      await expect(queries().getGauges()).resolves.toEqual({
        depth: 1,
        oldestWaitingAgeMs: 0,
        expiredLeases: 0,
      });
    });
  });

  describe('enqueueJob() under row-level security', () => {
    it('sets the tenant from the role and shows each tenant only its own rows', async () => {
      await enqueue(defaultTenantId, 'default-job', 'delivery-1');
      await enqueue(adminTenantId, 'admin-job', 'delivery-1');

      await expect(
        pool.one(sql`select tenant_id, payload from jobs where id = 'default-job'`)
      ).resolves.toEqual({ tenantId: defaultTenantId, payload: '{"b":1,"a":2}' });

      for (const [tenantId, id] of [
        [defaultTenantId, 'default-job'],
        [adminTenantId, 'admin-job'],
      ] as const) {
        // eslint-disable-next-line no-await-in-loop -- one transaction per tenant role
        const visible = await runAsTenant(pool, tenantId, async (connection) =>
          connection.anyFirst<string>(sql`select id from jobs`)
        );
        expect(visible).toEqual([id]);
      }

      await expect(
        runAsTenant(pool, adminTenantId, async (connection) =>
          connection.query(sql`delete from jobs where id = 'default-job'`)
        )
      ).resolves.toMatchObject({ rowCount: 0 });
    });

    it('rejects a second active job with the same dedupe key until the first ends', async () => {
      await enqueue(defaultTenantId, 'delivery', 'delivery-1');

      await expect(enqueue(defaultTenantId, 'redelivery', 'delivery-1')).rejects.toThrow();

      await pool.query(sql`delete from jobs where id = 'delivery'`);
      await expect(enqueue(defaultTenantId, 'redelivery', 'delivery-1')).resolves.toBeUndefined();
    });
  });
});
