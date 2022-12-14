import { ConnectorType, Event } from '@logto/schemas';
import { assert } from '@silverhand/essentials';

import { sendVerificationPasscode, putInteraction, deleteUser } from '#src/api/index.js';
import MockClient from '#src/client/index.js';
import { readPasscode } from '#src/helpers.js';

import { clearConnectorsByTypes, setEmailConnector, setSmsConnector } from './utils/connector.js';
import { enableAllPasscodeSignInMethods } from './utils/sign-in-experience.js';
import { generateNewUser } from './utils/user.js';

describe('Sign-In flow using passcode identifiers', () => {
  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
    await setEmailConnector();
    await setSmsConnector();
    await enableAllPasscodeSignInMethods();
  });
  afterAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
  });

  it('sign-in with email and passcode', async () => {
    const { userProfile, user } = await generateNewUser({ primaryEmail: true });
    const client = new MockClient();
    await client.initSession();
    assert(client.interactionCookie, new Error('Session not found'));

    await expect(
      sendVerificationPasscode(
        {
          event: Event.SignIn,
          email: userProfile.primaryEmail,
        },
        client.interactionCookie
      )
    ).resolves.not.toThrow();

    const passcodeRecord = await readPasscode();

    expect(passcodeRecord).toMatchObject({
      address: userProfile.primaryEmail,
      type: Event.SignIn,
    });

    const { code } = passcodeRecord;

    const { redirectTo } = await putInteraction(
      {
        event: Event.SignIn,
        identifier: {
          email: userProfile.primaryEmail,
          passcode: code,
        },
      },
      client.interactionCookie
    );

    await client.processSession(redirectTo);

    await expect(client.isAuthenticated()).resolves.toBe(true);

    await client.signOut();

    await expect(client.isAuthenticated()).resolves.toBe(false);

    await deleteUser(user.id);
  });

  it('sign-in with phone and passcode', async () => {
    const { userProfile, user } = await generateNewUser({ primaryPhone: true });
    const client = new MockClient();
    await client.initSession();
    assert(client.interactionCookie, new Error('Session not found'));

    await expect(
      sendVerificationPasscode(
        {
          event: Event.SignIn,
          phone: userProfile.primaryPhone,
        },
        client.interactionCookie
      )
    ).resolves.not.toThrow();

    const passcodeRecord = await readPasscode();

    expect(passcodeRecord).toMatchObject({
      phone: userProfile.primaryPhone,
      type: Event.SignIn,
    });

    const { code } = passcodeRecord;

    const { redirectTo } = await putInteraction(
      {
        event: Event.SignIn,
        identifier: {
          phone: userProfile.primaryPhone,
          passcode: code,
        },
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
