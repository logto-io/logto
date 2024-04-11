import {
  InteractionEvent,
  ConnectorType,
  SignInIdentifier,
  UsersPasswordEncryptionMethod,
} from '@logto/schemas';

import {
  putInteraction,
  sendVerificationCode,
  patchInteractionIdentifiers,
  putInteractionProfile,
  deleteUser,
} from '#src/api/index.js';
import { initClient, processSession, logoutClient } from '#src/helpers/client.js';
import {
  clearConnectorsByTypes,
  setSmsConnector,
  setEmailConnector,
} from '#src/helpers/connector.js';
import { readConnectorMessage, expectRejects, createUserByAdmin } from '#src/helpers/index.js';
import {
  enableAllPasswordSignInMethods,
  enableAllVerificationCodeSignInMethods,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUser, generateNewUserProfile } from '#src/helpers/user.js';
import { generateUsername } from '#src/utils.js';

describe('Sign-in flow using password identifiers', () => {
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

  it('sign-in with username and password twice to test algorithm transition', async () => {
    const username = generateUsername();
    const password = 'password';
    const user = await createUserByAdmin({
      username,
      passwordDigest: '5f4dcc3b5aa765d61d8327deb882cf99',
      passwordAlgorithm: UsersPasswordEncryptionMethod.MD5,
    });
    const client = await initClient();

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: {
        username,
        password,
      },
    });

    const { redirectTo } = await client.submitInteraction();

    await processSession(client, redirectTo);
    await logoutClient(client);

    const client2 = await initClient();

    await client2.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: {
        username,
        password,
      },
    });

    const { redirectTo: redirectTo2 } = await client2.submitInteraction();

    await processSession(client2, redirectTo2);
    await logoutClient(client2);

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
    await enableAllVerificationCodeSignInMethods({
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

    await expectRejects(client.submitInteraction(), {
      code: 'user.missing_profile',
      status: 422,
    });

    await client.successSend(sendVerificationCode, {
      email: primaryEmail,
    });

    const { code } = await readConnectorMessage('Email');

    await client.successSend(patchInteractionIdentifiers, {
      email: primaryEmail,
      verificationCode: code,
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
    await enableAllVerificationCodeSignInMethods({
      identifiers: [SignInIdentifier.Phone, SignInIdentifier.Email],
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

    await expectRejects(client.submitInteraction(), {
      code: 'user.missing_profile',
      status: 422,
    });

    await client.successSend(sendVerificationCode, {
      phone: primaryPhone,
    });

    const { code } = await readConnectorMessage('Sms');

    await client.successSend(patchInteractionIdentifiers, {
      phone: primaryPhone,
      verificationCode: code,
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
