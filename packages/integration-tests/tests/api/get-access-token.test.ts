import { managementResource } from '@logto/schemas/lib/seeds';
import { assert } from '@silverhand/essentials';

import { signInWithUsernameAndPassword } from '@/api';
import MockClient from '@/client';
import { createUserByAdmin } from '@/helpers';
import { generateUsername, generatePassword } from '@/utils';

describe('get access token', () => {
  const username = generateUsername();
  const password = generatePassword();

  beforeAll(async () => {
    await createUserByAdmin(username, password);
  });

  it('sign-in and getAccessToken', async () => {
    const client = new MockClient({ resources: [managementResource.indicator] });
    await client.initSession();
    assert(client.interactionCookie, new Error('Session not found'));

    const { redirectTo } = await signInWithUsernameAndPassword(
      username,
      password,
      client.interactionCookie
    );

    await client.processSession(redirectTo);

    assert(client.isAuthenticated, new Error('Sign in get get access token failed'));

    const accessToken = await client.getAccessToken(managementResource.indicator);

    expect(accessToken).not.toBeNull();

    // Request for invalid resource should throw
    void expect(client.getAccessToken('api.foo.com')).rejects.toThrow();
  });
});
