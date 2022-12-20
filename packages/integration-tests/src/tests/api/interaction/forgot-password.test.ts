import { Event, ConnectorType } from '@logto/schemas';
import { assert } from '@silverhand/essentials';

import {
  putInteraction,
  sendVerificationPasscode,
  deleteUser,
  patchInteraction,
} from '#src/api/index.js';
import { expectRejects, readPasscode } from '#src/helpers.js';
import { generatePassword } from '#src/utils.js';

import { initClient, processSession, logoutClient } from './utils/client.js';
import { clearConnectorsByTypes, setEmailConnector, setSmsConnector } from './utils/connector.js';
import { enableAllPasswordSignInMethods } from './utils/sign-in-experience.js';
import { generateNewUser } from './utils/user.js';

describe('reset password', () => {
  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
    await setEmailConnector();
    await setSmsConnector();
    await enableAllPasswordSignInMethods();
  });
  afterAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
  });
  it('reset password with email', async () => {
    const { user, userProfile } = await generateNewUser({
      primaryEmail: true,
      password: true,
    });

    const client = await initClient();
    assert(client.interactionCookie, new Error('Session not found'));

    await expect(
      sendVerificationPasscode(
        {
          event: Event.ForgotPassword,
          email: userProfile.primaryEmail,
        },
        client.interactionCookie
      )
    ).resolves.not.toThrow();

    const passcodeRecord = await readPasscode();

    expect(passcodeRecord).toMatchObject({
      address: userProfile.primaryEmail,
      type: Event.ForgotPassword,
    });

    const { code } = passcodeRecord;

    await expectRejects(
      putInteraction(
        {
          event: Event.ForgotPassword,
          identifier: {
            email: userProfile.primaryEmail,
            passcode: code,
          },
        },
        client.interactionCookie
      ),
      'user.new_password_required_in_profile'
    );

    await expectRejects(
      patchInteraction(
        {
          event: Event.ForgotPassword,
          profile: {
            password: userProfile.password,
          },
        },
        client.interactionCookie
      ),
      'user.same_password'
    );

    const newPasscodeRecord = generatePassword();

    await expect(
      patchInteraction(
        {
          event: Event.ForgotPassword,
          profile: {
            password: newPasscodeRecord,
          },
        },
        client.interactionCookie
      )
    ).resolves.not.toThrow();

    const { redirectTo } = await putInteraction(
      {
        event: Event.SignIn,
        identifier: {
          email: userProfile.primaryEmail,
          password: newPasscodeRecord,
        },
      },
      client.interactionCookie
    );

    await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(user.id);
  });
  it('reset password with phone', async () => {
    const { user, userProfile } = await generateNewUser({
      primaryPhone: true,
      password: true,
    });

    const client = await initClient();
    assert(client.interactionCookie, new Error('Session not found'));

    await expect(
      sendVerificationPasscode(
        {
          event: Event.ForgotPassword,
          phone: userProfile.primaryPhone,
        },
        client.interactionCookie
      )
    ).resolves.not.toThrow();

    const passcodeRecord = await readPasscode();

    expect(passcodeRecord).toMatchObject({
      phone: userProfile.primaryPhone,
      type: Event.ForgotPassword,
    });

    const { code } = passcodeRecord;

    await expectRejects(
      putInteraction(
        {
          event: Event.ForgotPassword,
          identifier: {
            phone: userProfile.primaryPhone,
            passcode: code,
          },
        },
        client.interactionCookie
      ),
      'user.new_password_required_in_profile'
    );

    await expectRejects(
      patchInteraction(
        {
          event: Event.ForgotPassword,
          profile: {
            password: userProfile.password,
          },
        },
        client.interactionCookie
      ),
      'user.same_password'
    );

    const newPasscodeRecord = generatePassword();

    await expect(
      patchInteraction(
        {
          event: Event.ForgotPassword,
          profile: {
            password: newPasscodeRecord,
          },
        },
        client.interactionCookie
      )
    ).resolves.not.toThrow();

    const { redirectTo } = await putInteraction(
      {
        event: Event.SignIn,
        identifier: {
          phone: userProfile.primaryPhone,
          password: newPasscodeRecord,
        },
      },
      client.interactionCookie
    );

    await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(user.id);
  });
});
