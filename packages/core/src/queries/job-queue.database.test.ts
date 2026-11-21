/* eslint-disable max-lines -- all Postgres job-queue tests share one test database and must run sequentially in one file */
/**
 * Query tests for the `jobs` adapters against a seeded Postgres database (`logto db seed --test`).
 * They run only when `JOB_QUEUE_TEST_DB_URL` points to such a database, and they delete every
 * row in its `jobs` table.
 */
import { createHmac } from 'node:crypto';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { type AddressInfo } from 'node:net';

import {
  JobQueueWorker,
  withTimeout,
  type ClaimDueInput,
  type ClaimedJobRow,
} from '@logto/job-queue';
import { InteractionHookEvent, LogResult, adminTenantId, defaultTenantId } from '@logto/schemas';
import { assert, type Nullable } from '@silverhand/essentials';
import {
  createInterceptorsPreset,
  createPool,
  sql,
  type CommonQueryMethods,
  type DatabasePool,
} from '@silverhand/slonik';
import Sinon from 'sinon';

import { EnvSet } from '#src/env-set/index.js';
import {
  buildExpiredWebhookLog,
  createWebhookJobHandler,
  webhookJobType,
} from '#src/job-queue/webhook-handler.js';

import { createJobQueueQueries, type CoreJobSettlementMeta } from './job-queue.js';
import { createJobQueries } from './jobs.js';

const { jest } = import.meta;

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

const logMeta = (
  hookId: string,
  result: LogResult,
  extra?: Record<string, unknown>
): CoreJobSettlementMeta => ({
  log: {
    key: `TriggerHook.${InteractionHookEvent.PostSignIn}`,
    payload: {
      key: `TriggerHook.${InteractionHookEvent.PostSignIn}`,
      result,
      hookId,
      ...extra,
    },
  },
});

const waitUntil = async (predicate: () => Promise<boolean> | boolean, timeoutMs = 10_000) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    // eslint-disable-next-line no-await-in-loop -- polling condition in integration test
    if (await predicate()) {
      return;
    }
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => {
      setTimeout(resolve, 25);
    });
  }
  throw new Error(`Timed out after ${timeoutMs}ms waiting for condition`);
};

const withHttpFixture = async (
  handler: (request: IncomingMessage, response: ServerResponse) => void,
  run: (baseUrl: string) => Promise<void>
) => {
  Sinon.stub(EnvSet, 'values').value({
    ...EnvSet.values,
    isSsrfProtectionEnabled: false,
  });

  const sockets = new Set<IncomingMessage['socket']>();
  const server: Server = createServer((request, response) => {
    sockets.add(request.socket);
    request.socket.once('close', () => {
      sockets.delete(request.socket);
    });
    handler(request, response);
  });

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });
  const { port } = server.address() as AddressInfo;

  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    for (const socket of sockets) {
      socket.destroy();
    }
    await new Promise<void>((resolve) => {
      server.close(() => {
        resolve();
      });
    });
    Sinon.restore();
  }
};

const enqueueWebhook = async (pool: DatabasePool, tenantId: string, id: string, hookId: string) =>
  runAsTenant(pool, tenantId, async (connection) =>
    createJobQueries(connection).enqueueJob({
      id,
      type: webhookJobType,
      groupKey: hookId,
      dedupeKey: id,
      payload: JSON.stringify({
        event: InteractionHookEvent.PostSignIn,
        hookId,
        deliveryId: id,
      }),
    })
  );

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

  const seedHook = async ({
    id,
    tenantId = defaultTenantId,
    url = 'https://example.com/webhook',
    signingKey = 'secret-key',
    enabled = true,
  }: {
    id: string;
    tenantId?: string;
    url?: string;
    signingKey?: string;
    enabled?: boolean;
  }) =>
    pool.query(sql`
      insert into hooks (tenant_id, id, name, events, config, signing_key, enabled)
      values (
        ${tenantId},
        ${id},
        ${id},
        ${JSON.stringify([InteractionHookEvent.PostSignIn])}::jsonb,
        ${JSON.stringify({ url })}::jsonb,
        ${signingKey},
        ${enabled}
      )
    `);

  const findLog = async (id: string) =>
    pool.maybeOne<{
      tenantId: string;
      id: string;
      key: string;
      payload: Record<string, unknown>;
      createdAt: number;
      payloadHookId: Nullable<string>;
    }>(
      sql`select tenant_id, id, key, payload, created_at, payload_hook_id from logs where id = ${id}`
    );

  const cleanupTestRows = async () => {
    await pool.query(sql`delete from jobs`);
    await pool.query(sql`delete from logs where id like 'jq-%' or id = 'shared-log-id'`);
    await pool.query(sql`delete from hooks where id like 'jq-%'`);
  };

  beforeAll(async () => {
    assert(databaseUrl, new Error('JOB_QUEUE_TEST_DB_URL is required'));
    // eslint-disable-next-line @silverhand/fp/no-mutation -- pool handle assigned in beforeAll
    pool = await createPool(databaseUrl, { interceptors: createInterceptorsPreset() });
  });

  beforeEach(async () => {
    await cleanupTestRows();
  });

  afterAll(async () => {
    await cleanupTestRows();
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

      expect(gauges.depth).toBe(4);
      expect(gauges.oldestWaitingAgeMs).toBeGreaterThanOrEqual(600_000);
      expect(gauges.oldestWaitingAgeMs).toBeLessThan(660_000);
    });

    it('reports zero age when no row is due', async () => {
      await expect(queries().getGauges()).resolves.toEqual({
        depth: 0,
        oldestWaitingAgeMs: 0,
      });

      await seed([{ id: 'later', dueIn: 3600 }]);

      await expect(queries().getGauges()).resolves.toEqual({
        depth: 1,
        oldestWaitingAgeMs: 0,
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

  describe('findHookForDelivery() cross-tenant isolation', () => {
    it('reads only hooks belonging to the explicit tenantId under sharedPool', async () => {
      await seedHook({
        id: 'jq-default-hook',
        tenantId: defaultTenantId,
        url: 'https://default.example.com',
        signingKey: 'default-secret',
        enabled: true,
      });
      await seedHook({
        id: 'jq-admin-hook',
        tenantId: adminTenantId,
        url: 'https://admin.example.com',
        signingKey: 'admin-secret',
        enabled: false,
      });

      await expect(
        queries().findHookForDelivery(adminTenantId, 'jq-default-hook')
      ).resolves.toBeNull();
      await expect(
        queries().findHookForDelivery(defaultTenantId, 'jq-admin-hook')
      ).resolves.toBeNull();

      await expect(
        queries().findHookForDelivery(defaultTenantId, 'jq-default-hook')
      ).resolves.toEqual({
        id: 'jq-default-hook',
        config: { url: 'https://default.example.com' },
        signingKey: 'default-secret',
        enabled: true,
      });
      await expect(queries().findHookForDelivery(adminTenantId, 'jq-admin-hook')).resolves.toEqual({
        id: 'jq-admin-hook',
        config: { url: 'https://admin.example.com' },
        signingKey: 'admin-secret',
        enabled: false,
      });
    });
  });

  describe('settle() atomic logs CTE and cross-tenant isolation', () => {
    it('atomically deletes jobs and inserts tenant-scoped logs on terminal outcomes', async () => {
      await seed([
        { id: 'jq-log-done', tenantId: defaultTenantId, groupKey: 'jq-hook-1' },
        { id: 'jq-log-fail', tenantId: adminTenantId, groupKey: 'jq-hook-2' },
      ]);
      const claimed = await queries().claimDue(claimInput({ workerId: 'worker-1' }));
      const doneJob = claimed.find(({ id }) => id === 'jq-log-done');
      const failJob = claimed.find(({ id }) => id === 'jq-log-fail');
      assert(doneJob && failJob, new Error('Expected both claimed jobs'));

      await expect(
        queries().settle({
          job: doneJob,
          workerId: 'worker-1',
          resolution: { status: 'done' },
          meta: logMeta('jq-hook-1', LogResult.Success),
        })
      ).resolves.toBe('settled');

      await expect(
        queries().settle({
          job: failJob,
          workerId: 'worker-1',
          resolution: { status: 'fail' },
          meta: logMeta('jq-hook-2', LogResult.Error, { error: '400 Bad Request' }),
        })
      ).resolves.toBe('settled');

      await expect(findJob('jq-log-done')).resolves.toBeNull();
      await expect(findJob('jq-log-fail')).resolves.toBeNull();

      await expect(findLog('jq-log-done')).resolves.toMatchObject({
        tenantId: defaultTenantId,
        key: `TriggerHook.${InteractionHookEvent.PostSignIn}`,
        payloadHookId: 'jq-hook-1',
        payload: { result: LogResult.Success, hookId: 'jq-hook-1' },
      });
      await expect(findLog('jq-log-fail')).resolves.toMatchObject({
        tenantId: adminTenantId,
        key: `TriggerHook.${InteractionHookEvent.PostSignIn}`,
        payloadHookId: 'jq-hook-2',
        payload: { result: LogResult.Error, hookId: 'jq-hook-2', error: '400 Bad Request' },
      });

      // Verify RLS visibility for each tenant role.
      await expect(
        runAsTenant(pool, defaultTenantId, async (connection) =>
          connection.anyFirst<string>(sql`select id from logs where id like 'jq-log-%'`)
        )
      ).resolves.toEqual(['jq-log-done']);
      await expect(
        runAsTenant(pool, adminTenantId, async (connection) =>
          connection.anyFirst<string>(sql`select id from logs where id like 'jq-log-%'`)
        )
      ).resolves.toEqual(['jq-log-fail']);
    });

    it('updates the single log row in place across retry and final success', async () => {
      await seed([{ id: 'jq-log-retry', tenantId: defaultTenantId, groupKey: 'jq-hook-r' }]);
      const [firstClaim] = await queries().claimDue(claimInput({ workerId: 'worker-1' }));
      assert(firstClaim, new Error('Expected first claim'));

      const nextAttemptAt = Date.now() + 5000;
      await expect(
        queries().settle({
          job: firstClaim,
          workerId: 'worker-1',
          resolution: { status: 'retry', delayMs: 5000, nextAttemptAt },
          meta: logMeta('jq-hook-r', LogResult.Error, { attempts: 1 }),
        })
      ).resolves.toBe('settled');

      const retryLog = await findLog('jq-log-retry');
      expect(retryLog).toMatchObject({
        payloadHookId: 'jq-hook-r',
        payload: { result: LogResult.Error, attempts: 1, nextAttemptAt },
      });

      await expireLease('jq-log-retry');
      const [secondClaim] = await queries().claimDue(claimInput({ workerId: 'worker-2' }));
      assert(secondClaim, new Error('Expected second claim'));

      await expect(
        queries().settle({
          job: secondClaim,
          workerId: 'worker-2',
          resolution: { status: 'done' },
          meta: logMeta('jq-hook-r', LogResult.Success, { attempts: 2 }),
        })
      ).resolves.toBe('settled');

      await expect(findJob('jq-log-retry')).resolves.toBeNull();
      const settledLog = await findLog('jq-log-retry');
      expect(settledLog?.createdAt).toBe(retryLog?.createdAt);
      expect(settledLog?.payload).toMatchObject({
        result: LogResult.Success,
        attempts: 2,
      });
      expect(settledLog?.payload).not.toHaveProperty('nextAttemptAt');
    });

    it('rejects stale writers without inserting or overwriting logs', async () => {
      await seed([{ id: 'jq-log-stale', tenantId: defaultTenantId, groupKey: 'jq-hook-s' }]);
      const [first] = await queries().claimDue(claimInput({ workerId: 'worker-1' }));
      assert(first, new Error('Expected claimed job'));
      await expireLease('jq-log-stale');
      const [second] = await queries().claimDue(claimInput({ workerId: 'worker-2' }));
      assert(second, new Error('Expected reclaimed job'));

      await expect(
        queries().settle({
          job: first,
          workerId: 'worker-1',
          resolution: { status: 'fail' },
          meta: logMeta('jq-hook-s', LogResult.Error),
        })
      ).resolves.toBe('stale');
      await expect(findLog('jq-log-stale')).resolves.toBeNull();

      await expect(
        queries().settle({
          job: second,
          workerId: 'worker-2',
          resolution: { status: 'done' },
          meta: logMeta('jq-hook-s', LogResult.Success),
        })
      ).resolves.toBe('settled');

      await expect(
        queries().settle({
          job: first,
          workerId: 'worker-1',
          resolution: { status: 'fail' },
          meta: logMeta('jq-hook-s', LogResult.Error),
        })
      ).resolves.toBe('stale');
      await expect(findLog('jq-log-stale')).resolves.toMatchObject({
        payload: { result: LogResult.Success },
      });
    });

    it('settles jobs without writing logs when meta is omitted', async () => {
      await seed([{ id: 'jq-log-absent', tenantId: defaultTenantId, groupKey: 'jq-hook-a' }]);
      const [job] = await queries().claimDue(claimInput({ workerId: 'worker-1' }));
      assert(job, new Error('Expected claimed job'));

      await expect(
        queries().settle({
          job,
          workerId: 'worker-1',
          resolution: { status: 'done' },
        })
      ).resolves.toBe('settled');

      await expect(findJob('jq-log-absent')).resolves.toBeNull();
      await expect(findLog('jq-log-absent')).resolves.toBeNull();
    });

    it('never overwrites another tenant log on a conflicting log id', async () => {
      await pool.query(sql`
        insert into logs (tenant_id, id, key, payload)
        values (
          ${adminTenantId},
          'shared-log-id',
          'TriggerHook.PostSignIn',
          ${JSON.stringify({ key: 'TriggerHook.PostSignIn', result: LogResult.Success, owner: 'admin' })}::jsonb
        )
      `);
      await seed([{ id: 'shared-log-id', tenantId: defaultTenantId, groupKey: 'jq-hook-c' }]);
      const [job] = await queries().claimDue(claimInput({ workerId: 'worker-1' }));
      assert(job, new Error('Expected claimed job'));

      await expect(
        queries().settle({
          job,
          workerId: 'worker-1',
          resolution: { status: 'fail' },
          meta: logMeta('jq-hook-c', LogResult.Error, { owner: 'default' }),
        })
      ).resolves.toBe('settled');

      await expect(findJob('shared-log-id')).resolves.toBeNull();
      await expect(findLog('shared-log-id')).resolves.toMatchObject({
        tenantId: adminTenantId,
        payload: { result: LogResult.Success, owner: 'admin' },
      });
    });

    it('clears pending nextAttemptAt on existing logs when terminal settle omits meta', async () => {
      await seed([{ id: 'jq-log-clear', tenantId: defaultTenantId, groupKey: 'jq-hook-clr' }]);
      const [first] = await queries().claimDue(claimInput({ workerId: 'worker-1' }));
      assert(first, new Error('Expected claimed job'));

      const nextAttemptAt = Date.now() + 10_000;
      await expect(
        queries().settle({
          job: first,
          workerId: 'worker-1',
          resolution: { status: 'retry', delayMs: 10_000, nextAttemptAt },
          meta: logMeta('jq-hook-clr', LogResult.Error, { attempts: 1 }),
        })
      ).resolves.toBe('settled');

      await expect(findLog('jq-log-clear')).resolves.toMatchObject({
        payload: { result: LogResult.Error, attempts: 1, nextAttemptAt },
      });

      await expireLease('jq-log-clear');
      const [second] = await queries().claimDue(claimInput({ workerId: 'worker-2' }));
      assert(second, new Error('Expected reclaimed job'));

      await expect(
        queries().settle({
          job: second,
          workerId: 'worker-2',
          resolution: { status: 'done' },
        })
      ).resolves.toBe('settled');

      await expect(findJob('jq-log-clear')).resolves.toBeNull();
      const log = await findLog('jq-log-clear');
      expect(log?.payload).toMatchObject({ result: LogResult.Error, attempts: 1 });
      expect(log?.payload).not.toHaveProperty('nextAttemptAt');
    });
  });

  describe('parkDueGroup()', () => {
    it('parks due waiting rows and expired leases while leaving live leases, future rows, and other groups untouched', async () => {
      await seed([
        { id: 'jq-park-due', groupKey: 'jq-hook-park', dueIn: -10 },
        {
          id: 'jq-park-expired',
          groupKey: 'jq-hook-park',
          dueIn: -5,
          claimedBy: 'dead-worker',
          attempts: 1,
        },
        {
          id: 'jq-park-live',
          groupKey: 'jq-hook-park',
          dueIn: 60,
          claimedBy: 'live-worker',
          attempts: 1,
        },
        { id: 'jq-park-future', groupKey: 'jq-hook-park', dueIn: 120 },
        { id: 'jq-park-other-hook', groupKey: 'jq-hook-other', dueIn: -10 },
        {
          id: 'jq-park-other-tenant',
          tenantId: adminTenantId,
          groupKey: 'jq-hook-park',
          dueIn: -10,
        },
      ]);

      const previousNextAttemptAt = Date.now() - 5000;
      for (const id of ['jq-park-due', 'jq-park-expired']) {
        // eslint-disable-next-line no-await-in-loop -- seed matching log rows sequentially
        await pool.query(sql`
          insert into logs (tenant_id, id, key, payload)
          values (
            ${defaultTenantId},
            ${id},
            'TriggerHook.PostSignIn',
            ${JSON.stringify({
              key: 'TriggerHook.PostSignIn',
              result: LogResult.Error,
              hookId: 'jq-hook-park',
              attempts: 1,
              nextAttemptAt: previousNextAttemptAt,
            })}::jsonb
          )
        `);
      }

      const parkedAt = Date.now() + 45_000;
      await expect(
        queries().parkDueGroup({
          tenantId: defaultTenantId,
          type: jobType,
          groupKey: 'jq-hook-park',
          nextAttemptAt: parkedAt,
          minCreatedAt: 0,
        })
      ).resolves.toBe(2);

      for (const id of ['jq-park-due', 'jq-park-expired']) {
        // eslint-disable-next-line no-await-in-loop -- verify parked rows and updated logs
        const job = await findJob(id);
        expect(job).toMatchObject({ claimedBy: null });
        expect(Math.abs(job!.nextAttemptAt - parkedAt)).toBeLessThan(10);

        // eslint-disable-next-line no-await-in-loop
        await expect(findLog(id)).resolves.toMatchObject({
          payload: { nextAttemptAt: Math.trunc(parkedAt) },
        });
      }

      await expect(findJob('jq-park-live')).resolves.toMatchObject({
        claimedBy: 'live-worker',
        attempts: 1,
      });
      expect((await findJob('jq-park-future'))!.nextAttemptAt).toBeGreaterThan(parkedAt);
      expect((await findJob('jq-park-other-hook'))!.nextAttemptAt).toBeLessThanOrEqual(Date.now());
      expect((await findJob('jq-park-other-tenant'))!.nextAttemptAt).toBeLessThanOrEqual(
        Date.now()
      );
    });

    it('bulk-expires older due rows with fallback or cleared logs without cross-tenant overwrites', async () => {
      const makePayload = (deliveryId: string) =>
        JSON.stringify({
          event: InteractionHookEvent.PostSignIn,
          hookId: 'jq-hook-exp',
          deliveryId,
        });

      await pool.query(sql`
        insert into jobs (
          tenant_id, id, type, group_key, payload, attempts, next_attempt_at, created_at
        )
        values
          (${defaultTenantId}, 'jq-exp-unattempted', ${webhookJobType}, 'jq-hook-exp',
            ${makePayload('jq-exp-unattempted')}, 0, now() - interval '10 seconds',
            now() - interval '25 hours'),
          (${defaultTenantId}, 'jq-exp-attempted', ${webhookJobType}, 'jq-hook-exp',
            ${makePayload('jq-exp-attempted')}, 2, now() - interval '10 seconds',
            now() - interval '25 hours'),
          (${defaultTenantId}, 'jq-exp-foreign', ${webhookJobType}, 'jq-hook-exp',
            ${makePayload('jq-exp-foreign')}, 0, now() - interval '10 seconds',
            now() - interval '25 hours'),
          (${defaultTenantId}, 'jq-exp-fresh', ${webhookJobType}, 'jq-hook-exp',
            ${makePayload('jq-exp-fresh')}, 0, now() - interval '10 seconds',
            now() - interval '1 hour')
      `);

      await pool.query(sql`
        insert into logs (tenant_id, id, key, payload)
        values
          (${defaultTenantId}, 'jq-exp-attempted', 'TriggerHook.PostSignIn', ${JSON.stringify({
            key: 'TriggerHook.PostSignIn',
            result: LogResult.Error,
            hookId: 'jq-hook-exp',
            attempts: 2,
            response: { statusCode: 503, body: 'unavailable' },
            nextAttemptAt: Date.now() - 5000,
          })}::jsonb),
          (${adminTenantId}, 'jq-exp-foreign', 'TriggerHook.PostSignIn', ${JSON.stringify({
            key: 'TriggerHook.PostSignIn',
            result: LogResult.Success,
            owner: 'admin',
          })}::jsonb)
      `);

      const onBulkExpired = jest.fn();
      const parkedAt = Date.now() + 60_000;
      const customQueries = createJobQueueQueries(pool, {
        buildExpiredLog: buildExpiredWebhookLog,
        onBulkExpired,
      });

      await expect(
        customQueries.parkDueGroup({
          tenantId: defaultTenantId,
          type: webhookJobType,
          groupKey: 'jq-hook-exp',
          nextAttemptAt: parkedAt,
          minCreatedAt: Date.now() - 24 * 60 * 60 * 1000,
        })
      ).resolves.toBe(1);

      expect(onBulkExpired).toHaveBeenCalledWith(3);
      await expect(findJob('jq-exp-unattempted')).resolves.toBeNull();
      await expect(findJob('jq-exp-attempted')).resolves.toBeNull();
      await expect(findJob('jq-exp-foreign')).resolves.toBeNull();

      const freshJob = await findJob('jq-exp-fresh');
      expect(freshJob).toMatchObject({ claimedBy: null });
      expect(Math.abs(freshJob!.nextAttemptAt - parkedAt)).toBeLessThan(10);

      const fallbackLog = await findLog('jq-exp-unattempted');
      expect(fallbackLog).toMatchObject({
        tenantId: defaultTenantId,
        key: `TriggerHook.${InteractionHookEvent.PostSignIn}`,
        payloadHookId: 'jq-hook-exp',
        payload: {
          result: LogResult.Error,
          attempts: 0,
          hookRequest: { body: { deliveryId: 'jq-exp-unattempted' } },
        },
      });
      expect(fallbackLog?.payload).not.toHaveProperty('nextAttemptAt');

      const attemptedLog = await findLog('jq-exp-attempted');
      expect(attemptedLog?.payload).toMatchObject({
        result: LogResult.Error,
        attempts: 2,
        response: { statusCode: 503, body: 'unavailable' },
      });
      expect(attemptedLog?.payload).not.toHaveProperty('nextAttemptAt');

      await expect(findLog('jq-exp-foreign')).resolves.toMatchObject({
        tenantId: adminTenantId,
        payload: { result: LogResult.Success, owner: 'admin' },
      });
    });
  });

  describe('shutdown hand-back and multi-worker delivery', () => {
    it('hands back an in-flight delivery within 5s so a second worker completes it with exact raw body', async () => {
      Sinon.stub(EnvSet, 'values').value({
        ...EnvSet.values,
        isSsrfProtectionEnabled: false,
      });

      const receivedRequests: Array<{ rawBody: string; signature: string | undefined }> = [];
      const openSockets: Array<IncomingMessage['socket']> = [];
      // eslint-disable-next-line @silverhand/fp/no-let
      let markFirstRequestReceived: (() => void) | undefined;
      const firstRequestReceived = new Promise<void>((resolve) => {
        // eslint-disable-next-line @silverhand/fp/no-mutation
        markFirstRequestReceived = resolve;
      });
      // eslint-disable-next-line @silverhand/fp/no-let
      let markSecondRequestReceived: (() => void) | undefined;
      const secondRequestReceived = new Promise<void>((resolve) => {
        // eslint-disable-next-line @silverhand/fp/no-mutation
        markSecondRequestReceived = resolve;
      });

      const server: Server = createServer((request: IncomingMessage, response: ServerResponse) => {
        const chunks: Uint8Array[] = [];
        request.on('data', (chunk: Uint8Array) => {
          // eslint-disable-next-line @silverhand/fp/no-mutating-methods
          chunks.push(chunk);
        });
        request.on('end', () => {
          const rawBody = Buffer.concat(chunks).toString();
          const signatureHeader = request.headers['logto-signature-sha-256'];
          const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;
          // eslint-disable-next-line @silverhand/fp/no-mutating-methods
          receivedRequests.push({ rawBody, signature });

          if (receivedRequests.length === 1) {
            // Keep the first attempt open past worker 1's drain budget.
            // eslint-disable-next-line @silverhand/fp/no-mutating-methods
            openSockets.push(request.socket);
            markFirstRequestReceived?.();
            return;
          }

          response.writeHead(200, { 'Content-Type': 'application/json' });
          response.end('{"received":true}');
          markSecondRequestReceived?.();
        });
      });

      await new Promise<void>((resolve) => {
        server.listen(0, '127.0.0.1', resolve);
      });

      const { port } = server.address() as AddressInfo;
      const hookId = 'jq-shutdown-hook';
      const deliveryId = 'jq-shutdown-delivery';
      const signingKey = 'shutdown-signing-key';
      // Non-sorted keys prove `jobs.payload` text preserves the exact pre-serialized wire order.
      const rawBody = JSON.stringify({
        event: InteractionHookEvent.PostSignIn,
        zField: 'z-first',
        aField: 'a-second',
        hookId,
        deliveryId,
      });

      const worker1 = new JobQueueWorker<CoreJobSettlementMeta>(queries(), { pollIntervalMs: 50 });
      const worker2 = new JobQueueWorker<CoreJobSettlementMeta>(queries(), { pollIntervalMs: 50 });
      // eslint-disable-next-line @silverhand/fp/no-let
      let worker1Stopping: Promise<number> | undefined;

      try {
        await seedHook({
          id: hookId,
          tenantId: defaultTenantId,
          url: `http://127.0.0.1:${port}/hook`,
          signingKey,
          enabled: true,
        });

        await runAsTenant(pool, defaultTenantId, async (connection) =>
          createJobQueries(connection).enqueueJob({
            id: deliveryId,
            type: webhookJobType,
            groupKey: hookId,
            dedupeKey: deliveryId,
            payload: rawBody,
          })
        );

        worker1.register(createWebhookJobHandler(queries()));
        worker1.start();

        await firstRequestReceived;

        const shutdownStart = Date.now();
        // eslint-disable-next-line @silverhand/fp/no-mutation
        worker1Stopping = worker1.stop();
        await expect(withTimeout(worker1Stopping, 200, 'drain timeout')).rejects.toThrow(
          'drain timeout'
        );
        await expect(worker1.releaseClaimed()).resolves.toBe(1);
        expect(Date.now() - shutdownStart).toBeLessThan(5000);

        const handedBack = await findJob(deliveryId);
        expect(handedBack).toMatchObject({ claimedBy: null, attempts: 1 });
        expect(handedBack!.nextAttemptAt).toBeLessThanOrEqual(Date.now() + 1000);

        worker2.register(createWebhookJobHandler(queries()));
        worker2.start();

        await secondRequestReceived;
        await worker2.stop();

        const expectedSignature = createHmac('sha256', signingKey).update(rawBody).digest('hex');
        expect(receivedRequests).toHaveLength(2);
        expect(receivedRequests[1]).toEqual({ rawBody, signature: expectedSignature });

        await expect(findJob(deliveryId)).resolves.toBeNull();
        await expect(findLog(deliveryId)).resolves.toMatchObject({
          tenantId: defaultTenantId,
          id: deliveryId,
          key: `TriggerHook.${InteractionHookEvent.PostSignIn}`,
          payloadHookId: hookId,
          payload: {
            result: LogResult.Success,
            hookId,
            response: { statusCode: 200, body: { received: true } },
          },
        });
      } finally {
        for (const socket of openSockets) {
          socket.destroy();
        }
        await Promise.allSettled([worker1Stopping, worker2.stop()]);
        await new Promise<void>((resolve) => {
          server.close(() => {
            resolve();
          });
        });
        Sinon.restore();
      }
    }, 15_000);
  });

  describe('end-to-end queued webhook retries, circuit breaker, and fairness', () => {
    it('updates a single log entry in place across a 503 retry and 200 success with attempts = 2', async () => {
      const state = { hits: 0 };

      await withHttpFixture(
        (_request, response) => {
          // eslint-disable-next-line @silverhand/fp/no-mutation -- track per-request attempt count
          state.hits += 1;
          if (state.hits === 1) {
            response.writeHead(503, { 'content-type': 'text/plain' });
            response.end('try again');
            return;
          }
          response.writeHead(200, { 'content-type': 'application/json' });
          response.end('{"ok":true}');
        },
        async (baseUrl) => {
          const hookId = 'jq-retry-hook';
          const deliveryId = 'jq-retry-delivery';
          await seedHook({ id: hookId, url: `${baseUrl}/hook` });
          await enqueueWebhook(pool, defaultTenantId, deliveryId, hookId);

          const worker = new JobQueueWorker<CoreJobSettlementMeta>(queries(), {
            pollIntervalMs: 30,
          });
          worker.register(
            createWebhookJobHandler(queries(), {
              backoffMs: () => 150,
            })
          );
          worker.start();

          try {
            await waitUntil(async () => {
              const log = await findLog(deliveryId);
              return log?.payload.attempts === 1;
            });
            const firstLog = await findLog(deliveryId);
            expect(firstLog?.payload).toMatchObject({
              result: LogResult.Error,
              attempts: 1,
              response: { statusCode: 503, body: 'try again' },
            });
            expect(typeof firstLog?.payload.nextAttemptAt).toBe('number');

            await waitUntil(async () => (await findJob(deliveryId)) === null);
            const finalLog = await findLog(deliveryId);
            expect(finalLog?.createdAt).toBe(firstLog?.createdAt);
            expect(finalLog?.payload).toMatchObject({
              result: LogResult.Success,
              attempts: 2,
              response: { statusCode: 200, body: { ok: true } },
            });
            expect(finalLog?.payload).not.toHaveProperty('nextAttemptAt');
            expect(state.hits).toBe(2);
          } finally {
            await worker.stop();
          }
        }
      );
    }, 15_000);

    it('exhausts at the 24-hour cutoff, clears nextAttemptAt, and calls onExhausted', async () => {
      await withHttpFixture(
        (_request, response) => {
          response.writeHead(503);
          response.end('still down');
        },
        async (baseUrl) => {
          const hookId = 'jq-cutoff-hook';
          const deliveryId = 'jq-cutoff-delivery';
          await seedHook({ id: hookId, url: `${baseUrl}/hook` });
          await pool.query(sql`
            insert into jobs (tenant_id, id, type, group_key, dedupe_key, payload, created_at)
            values (
              ${defaultTenantId},
              ${deliveryId},
              ${webhookJobType},
              ${hookId},
              ${deliveryId},
              ${JSON.stringify({
                event: InteractionHookEvent.PostSignIn,
                hookId,
                deliveryId,
              })},
              now() - interval '24 hours'
            )
          `);

          const onExhausted = jest.fn();
          const worker = new JobQueueWorker<CoreJobSettlementMeta>(queries(), {
            pollIntervalMs: 30,
          });
          worker.register(createWebhookJobHandler(queries(), { onExhausted }));
          worker.start();

          try {
            await waitUntil(async () => (await findJob(deliveryId)) === null);
            expect(onExhausted).toHaveBeenCalledTimes(1);

            const log = await findLog(deliveryId);
            expect(log?.payload).toMatchObject({
              result: LogResult.Error,
              attempts: 1,
              response: { statusCode: 503, body: 'still down' },
            });
            expect(log?.payload).not.toHaveProperty('nextAttemptAt');
          } finally {
            await worker.stop();
          }
        }
      );
    }, 15_000);

    it('keeps slow hooks from delaying healthy hooks', async () => {
      const slowResponses: ServerResponse[] = [];
      const order: string[] = [];

      await withHttpFixture(
        (request, response) => {
          if (request.url === '/slow') {
            // eslint-disable-next-line @silverhand/fp/no-mutating-methods -- collect held responses for cleanup
            slowResponses.push(response);
            return;
          }
          // eslint-disable-next-line @silverhand/fp/no-mutating-methods -- record delivery completion order
          order.push('healthy');
          response.writeHead(200);
          response.end('ok');
        },
        async (baseUrl) => {
          await seedHook({ id: 'jq-slow-hook', url: `${baseUrl}/slow` });
          await seedHook({ id: 'jq-fast-hook', url: `${baseUrl}/healthy` });

          for (const index of Array.from({ length: 10 }, (_, item) => item)) {
            // eslint-disable-next-line no-await-in-loop -- preserve older due order
            await pool.query(sql`
              insert into jobs (
                tenant_id, id, type, group_key, dedupe_key, payload, next_attempt_at
              )
              values (
                ${defaultTenantId},
                ${`jq-slow-${index}`},
                ${webhookJobType},
                'jq-slow-hook',
                ${`jq-slow-${index}`},
                ${JSON.stringify({
                  event: InteractionHookEvent.PostSignIn,
                  hookId: 'jq-slow-hook',
                  deliveryId: `jq-slow-${index}`,
                })},
                now() - interval '10 seconds'
              )
            `);
          }

          await enqueueWebhook(pool, defaultTenantId, 'jq-fast-delivery', 'jq-fast-hook');

          const worker = new JobQueueWorker<CoreJobSettlementMeta>(queries(), {
            pollIntervalMs: 30,
          });
          worker.register(createWebhookJobHandler(queries()));
          worker.start();

          try {
            await waitUntil(async () => (await findJob('jq-fast-delivery')) === null);
            expect(order).toEqual(['healthy']);
            expect(slowResponses.length).toBeLessThanOrEqual(5);
          } finally {
            for (const response of slowResponses) {
              response.writeHead(200);
              response.end('done');
            }
            await worker.stop();
          }
        }
      );
    }, 15_000);

    it('opens a circuit breaker after 5 dead-hook failures without delaying healthy hooks and recovers on probe success', async () => {
      const state = { deadHealthy: false, deadAttempts: 0 };
      const customQueries = createJobQueueQueries(pool, {
        buildExpiredLog: buildExpiredWebhookLog,
      });

      await withHttpFixture(
        (request, response) => {
          if (request.url === '/dead') {
            // eslint-disable-next-line @silverhand/fp/no-mutation -- track dead-hook HTTP attempts
            state.deadAttempts += 1;
            if (!state.deadHealthy) {
              response.writeHead(500);
              response.end('down');
              return;
            }
          }
          response.writeHead(200);
          response.end('ok');
        },
        async (baseUrl) => {
          await seedHook({ id: 'jq-dead-hook', url: `${baseUrl}/dead` });
          await seedHook({ id: 'jq-live-hook', url: `${baseUrl}/live` });

          for (const index of Array.from({ length: 8 }, (_, item) => item)) {
            // eslint-disable-next-line no-await-in-loop -- preserve older due order
            await pool.query(sql`
              insert into jobs (
                tenant_id, id, type, group_key, dedupe_key, payload, next_attempt_at
              )
              values (
                ${defaultTenantId},
                ${`jq-dead-${index}`},
                ${webhookJobType},
                'jq-dead-hook',
                ${`jq-dead-${index}`},
                ${JSON.stringify({
                  event: InteractionHookEvent.PostSignIn,
                  hookId: 'jq-dead-hook',
                  deliveryId: `jq-dead-${index}`,
                })},
                now() - interval '10 seconds'
              )
            `);
          }

          await enqueueWebhook(pool, defaultTenantId, 'jq-live-delivery', 'jq-live-hook');

          const worker = new JobQueueWorker<CoreJobSettlementMeta>(customQueries, {
            pollIntervalMs: 30,
          });
          worker.register(
            createWebhookJobHandler(customQueries, {
              backoffMs: () => 250,
            })
          );
          worker.start();

          try {
            await waitUntil(async () => (await findJob('jq-live-delivery')) === null);
            await expect(findLog('jq-live-delivery')).resolves.toMatchObject({
              payload: { result: LogResult.Success, attempts: 1 },
            });

            await waitUntil(() => worker.openCircuitCount === 1);
            expect(state.deadAttempts).toBeGreaterThanOrEqual(5);

            // Recover the dead endpoint and verify a probe closes the circuit and drains parked rows.
            // eslint-disable-next-line @silverhand/fp/no-mutation -- toggle mock endpoint health
            state.deadHealthy = true;
            await waitUntil(async () => {
              const remaining = await pool.oneFirst<number>(
                sql`select count(*)::int4 from jobs where group_key = 'jq-dead-hook'`
              );
              return remaining === 0;
            });

            expect(worker.openCircuitCount).toBe(0);
          } finally {
            await worker.stop();
          }
        }
      );
    }, 15_000);

    it('prevents one tenant backlog from delaying another tenant', async () => {
      const backlogResponses: ServerResponse[] = [];
      const order: string[] = [];

      await withHttpFixture(
        (request, response) => {
          if (request.url === '/tenant-a') {
            // eslint-disable-next-line @silverhand/fp/no-mutating-methods -- collect held responses for cleanup
            backlogResponses.push(response);
            return;
          }
          // eslint-disable-next-line @silverhand/fp/no-mutating-methods -- record delivery completion order
          order.push('tenant-b');
          response.writeHead(200);
          response.end('ok');
        },
        async (baseUrl) => {
          for (const hookIndex of Array.from({ length: 5 }, (_, item) => item)) {
            // eslint-disable-next-line no-await-in-loop -- seed multiple hooks to saturate per-tenant cap (20)
            await seedHook({
              id: `jq-ta-hook-${hookIndex}`,
              tenantId: defaultTenantId,
              url: `${baseUrl}/tenant-a`,
            });
          }
          await seedHook({
            id: 'jq-tb-hook',
            tenantId: adminTenantId,
            url: `${baseUrl}/tenant-b`,
          });

          for (const index of Array.from({ length: 25 }, (_, item) => item)) {
            const hookId = `jq-ta-hook-${index % 5}`;
            // eslint-disable-next-line no-await-in-loop -- preserve older due order across groups
            await pool.query(sql`
              insert into jobs (
                tenant_id, id, type, group_key, dedupe_key, payload, next_attempt_at
              )
              values (
                ${defaultTenantId},
                ${`jq-ta-${index}`},
                ${webhookJobType},
                ${hookId},
                ${`jq-ta-${index}`},
                ${JSON.stringify({
                  event: InteractionHookEvent.PostSignIn,
                  hookId,
                  deliveryId: `jq-ta-${index}`,
                })},
                now() - interval '20 seconds'
              )
            `);
          }

          await enqueueWebhook(pool, adminTenantId, 'jq-tb-delivery', 'jq-tb-hook');

          const worker = new JobQueueWorker<CoreJobSettlementMeta>(queries(), {
            pollIntervalMs: 30,
          });
          worker.register(createWebhookJobHandler(queries()));
          worker.start();

          try {
            await waitUntil(async () => (await findJob('jq-tb-delivery')) === null);
            expect(order).toEqual(['tenant-b']);
            expect(backlogResponses.length).toBeLessThanOrEqual(20);
          } finally {
            for (const response of backlogResponses) {
              response.writeHead(200);
              response.end('done');
            }
            await worker.stop();
          }
        }
      );
    }, 15_000);
  });
});
/* eslint-enable max-lines */
