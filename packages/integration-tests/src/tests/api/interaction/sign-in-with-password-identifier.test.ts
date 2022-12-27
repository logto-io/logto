import { InteractionEvent, ConnectorType, SignInIdentifier } from '@logto/schemas';

import {
  putInteraction,
  sendVerificationPasscode,
  patchInteractionIdentifiers,
  putInteractionProfile,
  deleteUser,
} from '#src/api/index.js';
import { readPasscode, expectRejects } from '#src/helpers.js';

import { initClient, processSession, logoutClient } from './utils/client.js';
import { clearConnectorsByTypes, setSmsConnector, setEmailConnector } from './utils/connector.js';
import {
  enableAllPasswordSignInMethods,
  enableAllPasscodeSignInMethods,
} from './utils/sign-in-experience.js';
import { generateNewUser, generateNewUserProfile } from './utils/user.js';

describe('Sign-In flow using password identifiers', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await clearConnectorsByTypes([ConnectorType.Sms, ConnectorType.Email]);
    await setSmsConnector();
    await setEmailConnector();
  });

  afterAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Sms, ConnectorType.Email]);
  });

  it('sign-in with username and password', async () => {
    const { userProfile, user } = await generateNewUser({ username: true, password: true });
    const client = await initClient();

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
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
      event: InteractionEvent.SignIn,
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
      event: InteractionEvent.SignIn,
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

  // Fulfill the email address
  it('sign-in with username and password and fulfill the email', async () => {
    await enableAllPasscodeSignInMethods({
      identifiers: [SignInIdentifier.Email],
      password: true,
      verify: true,
    });

    const { userProfile, user } = await generateNewUser({ username: true, password: true });
    const { primaryEmail } = generateNewUserProfile({ primaryEmail: true });
    const client = await initClient();

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: {
        username: userProfile.username,
        password: userProfile.password,
      },
    });

    await expectRejects(client.submitInteraction(), 'user.missing_profile');

    await client.successSend(sendVerificationPasscode, {
      event: InteractionEvent.SignIn,
      email: primaryEmail,
    });

    const { code } = await readPasscode();

    await client.successSend(patchInteractionIdentifiers, {
      email: primaryEmail,
      passcode: code,
    });

    await client.successSend(putInteractionProfile, {
      email: primaryEmail,
    });

    const { redirectTo } = await client.submitInteraction();

    await processSession(client, redirectTo);
    await logoutClient(client);

    // SignIn with email and password
    await client.initSession();
    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: {
        email: primaryEmail,
        password: userProfile.password,
      },
    });

    const { redirectTo: redirectTo2 } = await client.submitInteraction();
    await processSession(client, redirectTo2);
    await logoutClient(client);

    await deleteUser(user.id);
  });

  // Fulfill the phone number
  it('sign-in with username and password and fulfill the phone number', async () => {
    await enableAllPasscodeSignInMethods({
      identifiers: [SignInIdentifier.Sms, SignInIdentifier.Email],
      password: true,
      verify: true,
    });

    const { userProfile, user } = await generateNewUser({ username: true, password: true });
    const { primaryPhone } = generateNewUserProfile({ primaryPhone: true });
    const client = await initClient();

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: {
        username: userProfile.username,
        password: userProfile.password,
      },
    });

    await expectRejects(client.submitInteraction(), 'user.missing_profile');

    await client.successSend(sendVerificationPasscode, {
      event: InteractionEvent.SignIn,
      phone: primaryPhone,
    });

    const { code } = await readPasscode();

    await client.successSend(patchInteractionIdentifiers, {
      phone: primaryPhone,
      passcode: code,
    });

    await client.successSend(putInteractionProfile, {
      phone: primaryPhone,
    });

    const { redirectTo } = await client.submitInteraction();

    await processSession(client, redirectTo);
    await logoutClient(client);

    // SignIn with new phone and password
    await client.initSession();
    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: {
        phone: primaryPhone,
        password: userProfile.password,
      },
    });

    const { redirectTo: redirectTo2 } = await client.submitInteraction();
    await processSession(client, redirectTo2);
    await logoutClient(client);

    await deleteUser(user.id);
  });
});
