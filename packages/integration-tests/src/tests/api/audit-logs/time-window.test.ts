import { InteractionEvent, SignInIdentifier, interaction } from '@logto/schemas';
import { assert } from '@silverhand/essentials';
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
    it('returns 400 when start_time >= end_time', async () => {
      const response = await getAuditLogsResponse(
        new URLSearchParams({ start_time: '2000', end_time: '1000' })
      ).catch((error: unknown) => error);
      expect(response instanceof HTTPError && response.response.status).toBe(400);
    });

    it('returns 400 when start_time equals end_time', async () => {
      const response = await getAuditLogsResponse(
        new URLSearchParams({ start_time: '1000', end_time: '1000' })
      ).catch((error: unknown) => error);
      expect(response instanceof HTTPError && response.response.status).toBe(400);
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
          end_time: String(beforeStart),
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
