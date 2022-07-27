import { registerUserWithUsernameAndPassword, signInWithUsernameAndPassword } from '@/api';
import MockClient from '@/client';
import { generateUsername, generatePassword } from '@/utils';

describe('username and password flow', () => {
  const username = generateUsername();
  const password = generatePassword();

  it('register with username & password', async () => {
    const client = new MockClient();

    await client.initSession();

    expect(client.interactionCookie).toBeTruthy();

    if (!client.interactionCookie) {
      return;
    }

    const { redirectTo } = await registerUserWithUsernameAndPassword(
      username,
      password,
      client.interactionCookie
    );

    await client.processSession(redirectTo);

    expect(client.isAuthenticated).toBe(true);
  });

  it('sign-in with username & password', async () => {
    const client = new MockClient();

    await client.initSession();

    expect(client.interactionCookie).toBeTruthy();

    if (!client.interactionCookie) {
      return;
    }

    const { redirectTo } = await signInWithUsernameAndPassword(
      username,
      password,
      client.interactionCookie
    );

    await client.processSession(redirectTo);

    expect(client.isAuthenticated).toBe(true);
  });
});
