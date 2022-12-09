import { assert } from '@silverhand/essentials';

import { signInWithPasswordIdentifiers, deleteUser } from '@/api';
import MockClient from '@/client';

import { enableAllPasswordSignInMethods } from './utils/sign-in-experience';
import { generateNewUser } from './utils/user';

describe('Sign-In flow using password identifiers', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
  });

  it('sign-in with username and password', async () => {
    const { userProfile, user } = await generateNewUser({ username: true });
    const client = new MockClient();
    await client.initSession();
    assert(client.interactionCookie, new Error('Session not found'));

    const { redirectTo } = await signInWithPasswordIdentifiers(
      {
        username: userProfile.username,
        password: userProfile.password,
      },
      client.interactionCookie
    );

    await client.processSession(redirectTo);

    await expect(client.isAuthenticated()).resolves.toBe(true);

    await client.signOut();

    await expect(client.isAuthenticated()).resolves.toBe(false);

    await deleteUser(user.id);
  });

  it('sign-in with email and password', async () => {
    const { userProfile, user } = await generateNewUser({ primaryEmail: true });
    const client = new MockClient();
    await client.initSession();
    assert(client.interactionCookie, new Error('Session not found'));

    const { redirectTo } = await signInWithPasswordIdentifiers(
      {
        email: userProfile.primaryEmail,
        password: userProfile.password,
      },
      client.interactionCookie
    );

    await client.processSession(redirectTo);

    await expect(client.isAuthenticated()).resolves.toBe(true);

    await client.signOut();

    await expect(client.isAuthenticated()).resolves.toBe(false);

    await deleteUser(user.id);
  });

  it('sign-in with phone and password', async () => {
    const { userProfile, user } = await generateNewUser({ primaryPhone: true });
    const client = new MockClient();
    await client.initSession();
    assert(client.interactionCookie, new Error('Session not found'));

    const { redirectTo } = await signInWithPasswordIdentifiers(
      {
        phone: userProfile.primaryPhone,
        password: userProfile.password,
      },
      client.interactionCookie
    );

    await client.processSession(redirectTo);

    await expect(client.isAuthenticated()).resolves.toBe(true);

    await client.signOut();

    await expect(client.isAuthenticated()).resolves.toBe(false);

    await deleteUser(user.id);
  });
});
