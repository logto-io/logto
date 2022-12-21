import { Event } from '@logto/schemas';

import { putInteraction, deleteUser } from '#src/api/index.js';

import { initClient, processSession, logoutClient } from './utils/client.js';
import { enableAllPasswordSignInMethods } from './utils/sign-in-experience.js';
import { generateNewUser } from './utils/user.js';

describe('Sign-In flow using password identifiers', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
  });

  it('sign-in with username and password', async () => {
    const { userProfile, user } = await generateNewUser({ username: true, password: true });
    const client = await initClient();

    await client.successSend(putInteraction, {
      event: Event.SignIn,
      identifier: {
        username: userProfile.username,
        password: userProfile.password,
      },
    });

    const { redirectTo } = await client.submitInteraction();

    await processSession(client, redirectTo);
    await logoutClient(client);

    await deleteUser(user.id);
  });

  it('sign-in with email and password', async () => {
    const { userProfile, user } = await generateNewUser({ primaryEmail: true, password: true });
    const client = await initClient();

    await client.successSend(putInteraction, {
      event: Event.SignIn,
      identifier: {
        email: userProfile.primaryEmail,
        password: userProfile.password,
      },
    });

    const { redirectTo } = await client.submitInteraction();

    await processSession(client, redirectTo);
    await logoutClient(client);

    await deleteUser(user.id);
  });

  it('sign-in with phone and password', async () => {
    const { userProfile, user } = await generateNewUser({ primaryPhone: true, password: true });
    const client = await initClient();

    await client.successSend(putInteraction, {
      event: Event.SignIn,
      identifier: {
        phone: userProfile.primaryPhone,
        password: userProfile.password,
      },
    });

    const { redirectTo } = await client.submitInteraction();

    await processSession(client, redirectTo);
    await logoutClient(client);

    await deleteUser(user.id);
  });
});
