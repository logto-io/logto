import { ConnectorType, Event, SignInIdentifier } from '@logto/schemas';
import { assert } from '@silverhand/essentials';

import {
  sendVerificationPasscode,
  putInteraction,
  patchInteraction,
  deleteUser,
  updateSignInExperience,
} from '#src/api/index.js';
import { expectRejects, readPasscode } from '#src/helpers.js';
import { generateEmail, generatePhone } from '#src/utils.js';

import { initClient, processSession, logoutClient } from './utils/client.js';
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
    const client = await initClient();
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

    await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(user.id);
  });

  it('sign-in with phone and passcode', async () => {
    const { userProfile, user } = await generateNewUser({ primaryPhone: true });
    const client = await initClient();
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

    await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(user.id);
  });

  it('sign-in with non-exist email account with passcode', async () => {
    const newEmail = generateEmail();

    // Enable email sign-up
    await updateSignInExperience({
      signUp: { identifiers: [SignInIdentifier.Email], password: false, verify: true },
    });

    const client = await initClient();
    assert(client.interactionCookie, new Error('Session not found'));

    await expect(
      sendVerificationPasscode(
        {
          event: Event.SignIn,
          email: newEmail,
        },
        client.interactionCookie
      )
    ).resolves.not.toThrow();

    const passcodeRecord = await readPasscode();

    const { code } = passcodeRecord;

    await expectRejects(
      putInteraction(
        {
          event: Event.SignIn,
          identifier: {
            email: newEmail,
            passcode: code,
          },
        },
        client.interactionCookie
      ),
      'user.user_not_exist'
    );

    const { redirectTo } = await patchInteraction(
      {
        event: Event.Register,
        profile: {
          email: newEmail,
        },
      },
      client.interactionCookie
    );

    const id = await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(id);
  });

  it('sign-in with non-exist phone account with passcode', async () => {
    const newPhone = generatePhone();

    // Enable phone sign-up
    await updateSignInExperience({
      signUp: { identifiers: [SignInIdentifier.Sms], password: false, verify: true },
    });

    const client = await initClient();
    assert(client.interactionCookie, new Error('Session not found'));

    await expect(
      sendVerificationPasscode(
        {
          event: Event.SignIn,
          phone: newPhone,
        },
        client.interactionCookie
      )
    ).resolves.not.toThrow();

    const passcodeRecord = await readPasscode();

    const { code } = passcodeRecord;

    await expectRejects(
      putInteraction(
        {
          event: Event.SignIn,
          identifier: {
            phone: newPhone,
            passcode: code,
          },
        },
        client.interactionCookie
      ),
      'user.user_not_exist'
    );

    const { redirectTo } = await patchInteraction(
      {
        event: Event.Register,
        profile: {
          phone: newPhone,
        },
      },
      client.interactionCookie
    );

    const id = await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(id);
  });
});
