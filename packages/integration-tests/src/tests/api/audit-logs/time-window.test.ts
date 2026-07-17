import { InteractionEvent, SignInIdentifier, defaultTenantId, interaction } from '@logto/schemas';
import { assert, assertEnv } from '@silverhand/essentials';
import { createInterceptorsPreset, createPool, sql, type DatabasePool } from '@silverhand/slonik';
import { HTTPError } from 'ky';

import { deleteUser } from '#src/api/admin-user.js';
import { getAuditLogs, getAuditLogsResponse } from '#src/api/logs.js';
import { initExperienceClient } from '#src/helpers/client.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile } from '#src/helpers/user.js';
import { parseInteractionCookie } from '#src/utils.js';

// Integration coverage for the `start_time` / `end_time` query params on
// `GET /api/logs`. Validation paths (400 responses) are covered exhaustively;
// behavioral filtering is verified against an interaction-triggered log
// captured at "now", since integration tests don't have direct DB access to
// seed logs with arbitrary `createdAt` timestamps.
describe('GET /logs start_time / end_time params', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods({
      identifiers: [SignInIdentifier.Username],
      password: true,
      verify: false,
    });
  });

  describe('validation', () => {
    it('returns 400 when start_time > end_time', async () => {
      const response = await getAuditLogsResponse(
        new URLSearchParams({ start_time: '2000', end_time: '1000' })
      ).catch((error: unknown) => error);
      expect(response instanceof HTTPError && response.response.status).toBe(400);
    });

    it('succeeds when start_time equals end_time (inclusive bounds)', async () => {
      const response = await getAuditLogsResponse(
        new URLSearchParams({ start_time: '1000', end_time: '1000' })
      );
      expect(response.status).toBe(200);
    });

    it('returns 400 when start_time is not a finite number', async () => {
      const response = await getAuditLogsResponse(new URLSearchParams({ start_time: 'abc' })).catch(
        (error: unknown) => error
      );
      expect(response instanceof HTTPError && response.response.status).toBe(400);
    });

    it('returns 400 when end_time is not a finite number', async () => {
      const response = await getAuditLogsResponse(new URLSearchParams({ end_time: 'NaN' })).catch(
        (error: unknown) => error
      );
      expect(response instanceof HTTPError && response.response.status).toBe(400);
    });
  });

  describe('default behavior (no params)', () => {
    it('returns logs as before when neither param is supplied', async () => {
      const response = await getAuditLogsResponse(new URLSearchParams({ page_size: '5' }));
      expect(response.status).toBe(200);
      expect(response.headers.get('total-number')).not.toBeNull();
    });
  });

  describe('time-window filtering', () => {
    it('includes a log created within the window and excludes it from a non-overlapping window', async () => {
      // Capture the moment we kick off an interaction.
      const beforeStart = Date.now();
      const client = await initExperienceClient({ interactionEvent: InteractionEvent.Register });
      const interactionCookie = client.parsedCookies.get('_interaction');
      assert(interactionCookie, new Error('No interaction found in cookie'));
      const interactionId = parseInteractionCookie(interactionCookie)['demo-app'];
      const afterStart = Date.now();

      // Sanity: the interaction.create log must be in [beforeStart-1s, afterStart+1s].
      const matchingWindow = await getAuditLogs(
        new URLSearchParams({
          logKey: `${interaction.prefix}.${interaction.Action.Create}`,
          start_time: String(beforeStart - 1000),
          end_time: String(afterStart + 1000),
        })
      );
      expect(
        matchingWindow.some((log) => log.payload.interactionId === interactionId)
      ).toBeTruthy();

      // A window that ends before the interaction started must exclude the log.
      const nonOverlappingWindow = await getAuditLogs(
        new URLSearchParams({
          logKey: `${interaction.prefix}.${interaction.Action.Create}`,
          end_time: String(beforeStart - 1),
        })
      );
      expect(
        nonOverlappingWindow.some((log) => log.payload.interactionId === interactionId)
      ).toBeFalsy();

      // Same for a window that starts after the interaction ended.
      const futureWindow = await getAuditLogs(
        new URLSearchParams({
          logKey: `${interaction.prefix}.${interaction.Action.Create}`,
          start_time: String(afterStart + 60_000),
        })
      );
      expect(futureWindow.some((log) => log.payload.interactionId === interactionId)).toBeFalsy();

      // Process the interaction so the test user can be cleaned up.
      const { username, password } = generateNewUserProfile({ username: true, password: true });
      await client.updateProfile({ type: SignInIdentifier.Username, value: username });
      await client.updateProfile({ type: 'password', value: password });
      await client.identifyUser();
      const response = await client.submitInteraction();
      await client.processSession(response.redirectTo);
      const { sub: userId } = await client.getIdTokenClaims();
      await client.signOut();
      await deleteUser(userId);
    });

    it('composes with other filters (AND semantics)', async () => {
      // Sanity check: combining start_time with logKey returns a non-error
      // response. Empirical row count varies with test ordering, so we only
      // assert the request shape is accepted and well-formed.
      const response = await getAuditLogsResponse(
        new URLSearchParams({
          start_time: String(Date.now() - 60_000),
          end_time: String(Date.now() + 60_000),
          logKey: `${interaction.prefix}.${interaction.Action.Create}`,
        })
      );
      expect(response.status).toBe(200);
    });
  });
});

// Regression: PostgreSQL stores timestamps at microsecond precision while the
// API exposes createdAt as a unix-millisecond integer. The SQL filter must
// treat end_time as an inclusive millisecond bucket so that a row stored at
// e.g. epoch 1784217599999.500 (displayed as createdAt: 1784217599999) is
// returned when querying with end_time=1784217599999.
describe('GET /logs end_time with sub-millisecond createdAt', () => {
  // A millisecond boundary with a clean .5 fractional second.
  const epochMs = 1_784_217_599_999;
  // Sub-ms timestamp ÷ 1000 = 1784217599.999500
  const subMsTimestamp = epochMs + 0.5;
  const logId = 'sub-ms-boundary-test';
  const logKey = 'Test.SubMillisecondBoundary';

  /* eslint-disable @silverhand/fp/no-let */
  let pool: DatabasePool;
  /* eslint-enable @silverhand/fp/no-let */

  beforeAll(async () => {
    /* eslint-disable @silverhand/fp/no-mutation */
    pool = await createPool(assertEnv('DB_URL'), {
      interceptors: createInterceptorsPreset(),
    });
    /* eslint-enable @silverhand/fp/no-mutation */

    await pool.query(sql`
      insert into logs (tenant_id, id, key, payload, created_at)
      values (
        ${defaultTenantId},
        ${logId},
        ${logKey},
        ${sql.jsonb({})},
        to_timestamp(${subMsTimestamp}::double precision / 1000)
      )
    `);
  });

  afterAll(async () => {
    await pool.query(sql`
      delete from logs where id = ${logId}
    `);
    await pool.end();
  });

  it('includes a log whose displayed createdAt equals end_time despite sub-millisecond offset', async () => {
    const logs = await getAuditLogs(new URLSearchParams({ logKey, end_time: String(epochMs) }));
    expect(logs.some((log) => log.id === logId)).toBeTruthy();
  });

  it('excludes the same log when end_time is one millisecond earlier', async () => {
    const logs = await getAuditLogs(new URLSearchParams({ logKey, end_time: String(epochMs - 1) }));
    expect(logs.some((log) => log.id === logId)).toBeFalsy();
  });
});
