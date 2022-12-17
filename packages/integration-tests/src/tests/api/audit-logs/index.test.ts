import { interaction } from '@logto/schemas';
import type { Optional } from '@silverhand/essentials';
import { assert } from '@silverhand/essentials';

import { deleteUser } from '#src/api/admin-user.js';
import { getLogs } from '#src/api/logs.js';
import { registerUserWithUsernameAndPassword } from '#src/api/session.js';
import MockClient from '#src/client/index.js';
import { generatePassword, generateUsername } from '#src/utils.js';

const parseCookies = (cookies: string[]): Map<string, Optional<string>> => {
  const map = new Map<string, Optional<string>>();

  for (const cookie of cookies) {
    for (const element of cookie.split(';')) {
      const [key, value] = element.trim().split('=');

      if (key) {
        map.set(key, value);
      }
    }
  }

  return map;
};

// TODO: @Gao Use new interaction APIs
describe('audit logs for interaction', () => {
  it('should insert log after interaction started and ended', async () => {
    const client = new MockClient();
    await client.initSession();
    const cookies = parseCookies(client.rawCookies);
    const interactionId = cookies.get('_interaction');

    assert(interactionId, new Error('No interaction found in cookie'));
    console.debug('Testing interaction', interactionId);

    // Expect interaction create log
    const createLogs = await getLogs(
      new URLSearchParams({ logType: `${interaction.prefix}.${interaction.Action.Create}` })
    );
    expect(createLogs.some((value) => value.payload.interactionId === interactionId)).toBeTruthy();

    // Process interaction with minimum effort
    const username = generateUsername();
    const password = generatePassword();
    const response = await registerUserWithUsernameAndPassword(
      username,
      password,
      client.interactionCookie
    );
    await client.processSession(response.redirectTo);

    // Expect interaction end log
    const endLogs = await getLogs(
      new URLSearchParams({ logType: `${interaction.prefix}.${interaction.Action.End}` })
    );
    expect(endLogs.some((value) => value.payload.interactionId === interactionId)).toBeTruthy();

    // Clean up
    const { sub: userId } = await client.getIdTokenClaims();
    await client.signOut();
    await deleteUser(userId);
  });
});
