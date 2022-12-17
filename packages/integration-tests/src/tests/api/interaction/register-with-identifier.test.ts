import { ConnectorType, Event, SignInIdentifier } from '@logto/schemas';
import { assert } from '@silverhand/essentials';

import {
  sendVerificationPasscode,
  putInteraction,
  patchInteraction,
  deleteUser,
} from '#src/api/index.js';
import { readPasscode, expectRejects } from '#src/helpers.js';

import { initClient, processSession, logoutClient } from './utils/client.js';
import { clearConnectorsByTypes, setEmailConnector, setSmsConnector } from './utils/connector.js';
import {
  enableAllPasscodeSignInMethods,
  enableAllPasswordSignInMethods,
} from './utils/sign-in-experience.js';
import { generateNewUserProfile, generateNewUser } from './utils/user.js';

describe('Register with username and password', () => {
  it('register with username and password', async () => {
    await enableAllPasswordSignInMethods({
      identifiers: [SignInIdentifier.Username],
      password: true,
      verify: false,
    });

    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const client = await initClient();
    assert(client.interactionCookie, new Error('Session not found'));

    const { redirectTo } = await putInteraction(
      {
        event: Event.Register,
        profile: {
          username,
          password,
        },
      },
      client.interactionCookie
    );

    const id = await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(id);
  });
});

describe('Register with passwordless identifier', () => {
  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
    await setEmailConnector();
    await setSmsConnector();
  });
  afterAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
  });

  it('register with email', async () => {
    await enableAllPasscodeSignInMethods({
      identifiers: [SignInIdentifier.Email],
      password: false,
      verify: true,
    });

    const { primaryEmail } = generateNewUserProfile({ primaryEmail: true });
    const client = await initClient();
    assert(client.interactionCookie, new Error('Session not found'));

    await expect(
      sendVerificationPasscode(
        {
          event: Event.Register,
          email: primaryEmail,
        },
        client.interactionCookie
      )
    ).resolves.not.toThrow();

    const passcodeRecord = await readPasscode();

    expect(passcodeRecord).toMatchObject({
      address: primaryEmail,
      type: Event.Register,
    });

    const { code } = passcodeRecord;

    const { redirectTo } = await putInteraction(
      {
        event: Event.Register,
        identifier: {
          email: primaryEmail,
          passcode: code,
        },
        profile: {
          email: primaryEmail,
        },
      },
      client.interactionCookie
    );

    const id = await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(id);
  });

  it('register with phone', async () => {
    await enableAllPasscodeSignInMethods({
      identifiers: [SignInIdentifier.Sms],
      password: false,
      verify: true,
    });

    const { primaryPhone } = generateNewUserProfile({ primaryPhone: true });
    const client = await initClient();
    assert(client.interactionCookie, new Error('Session not found'));

    await expect(
      sendVerificationPasscode(
        {
          event: Event.Register,
          phone: primaryPhone,
        },
        client.interactionCookie
      )
    ).resolves.not.toThrow();

    const passcodeRecord = await readPasscode();

    expect(passcodeRecord).toMatchObject({
      phone: primaryPhone,
      type: Event.Register,
    });

    const { code } = passcodeRecord;

    const { redirectTo } = await putInteraction(
      {
        event: Event.Register,
        identifier: {
          phone: primaryPhone,
          passcode: code,
        },
        profile: {
          phone: primaryPhone,
        },
      },
      client.interactionCookie
    );

    const id = await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(id);
  });

  it('register with exiting email', async () => {
    const {
      user,
      userProfile: { primaryEmail },
    } = await generateNewUser({ primaryEmail: true });

    await enableAllPasscodeSignInMethods({
      identifiers: [SignInIdentifier.Email],
      password: false,
      verify: true,
    });

    const client = await initClient();
    assert(client.interactionCookie, new Error('Session not found'));

    await expect(
      sendVerificationPasscode(
        {
          event: Event.Register,
          email: primaryEmail,
        },
        client.interactionCookie
      )
    ).resolves.not.toThrow();

    const passcodeRecord = await readPasscode();

    expect(passcodeRecord).toMatchObject({
      address: primaryEmail,
      type: Event.Register,
    });

    const { code } = passcodeRecord;

    await expectRejects(
      putInteraction(
        {
          event: Event.Register,
          identifier: {
            email: primaryEmail,
            passcode: code,
          },
          profile: {
            email: primaryEmail,
          },
        },
        client.interactionCookie
      ),
      'user.email_already_in_use'
    );

    const { redirectTo } = await patchInteraction(
      {
        event: Event.SignIn,
      },
      client.interactionCookie
    );
    await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(user.id);
  });

  it('register with exiting phone', async () => {
    const {
      user,
      userProfile: { primaryPhone },
    } = await generateNewUser({ primaryPhone: true });

    await enableAllPasscodeSignInMethods({
      identifiers: [SignInIdentifier.Sms],
      password: false,
      verify: true,
    });

    const client = await initClient();
    assert(client.interactionCookie, new Error('Session not found'));

    await expect(
      sendVerificationPasscode(
        {
          event: Event.Register,
          phone: primaryPhone,
        },
        client.interactionCookie
      )
    ).resolves.not.toThrow();

    const passcodeRecord = await readPasscode();

    expect(passcodeRecord).toMatchObject({
      phone: primaryPhone,
      type: Event.Register,
    });

    const { code } = passcodeRecord;

    await expectRejects(
      putInteraction(
        {
          event: Event.Register,
          identifier: {
            phone: primaryPhone,
            passcode: code,
          },
          profile: {
            phone: primaryPhone,
          },
        },
        client.interactionCookie
      ),
      'user.phone_already_in_use'
    );

    const { redirectTo } = await patchInteraction(
      {
        event: Event.SignIn,
      },
      client.interactionCookie
    );
    await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(user.id);
  });
});
