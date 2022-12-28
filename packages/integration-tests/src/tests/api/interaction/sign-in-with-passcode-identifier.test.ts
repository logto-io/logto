import { ConnectorType, InteractionEvent, SignInIdentifier } from '@logto/schemas';

import {
  sendVerificationPasscode,
  putInteraction,
  putInteractionEvent,
  putInteractionProfile,
  patchInteractionIdentifiers,
  deleteUser,
  updateSignInExperience,
} from '#src/api/index.js';
import { expectRejects, readPasscode } from '#src/helpers.js';
import { generateEmail, generatePhone } from '#src/utils.js';

import { initClient, processSession, logoutClient } from './utils/client.js';
import { clearConnectorsByTypes, setEmailConnector, setSmsConnector } from './utils/connector.js';
import { enableAllPasscodeSignInMethods } from './utils/sign-in-experience.js';
import { generateNewUser, generateNewUserProfile } from './utils/user.js';

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

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
    });

    await client.successSend(sendVerificationPasscode, {
      email: userProfile.primaryEmail,
    });

    const passcodeRecord = await readPasscode();

    expect(passcodeRecord).toMatchObject({
      address: userProfile.primaryEmail,
      type: InteractionEvent.SignIn,
    });

    const { code } = passcodeRecord;

    await client.successSend(patchInteractionIdentifiers, {
      email: userProfile.primaryEmail,
      passcode: code,
    });

    const { redirectTo } = await client.submitInteraction();

    await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(user.id);
  });

  it('sign-in with phone and passcode', async () => {
    const { userProfile, user } = await generateNewUser({ primaryPhone: true });
    const client = await initClient();

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
    });

    await client.successSend(sendVerificationPasscode, {
      phone: userProfile.primaryPhone,
    });

    const passcodeRecord = await readPasscode();

    expect(passcodeRecord).toMatchObject({
      phone: userProfile.primaryPhone,
      type: InteractionEvent.SignIn,
    });

    const { code } = passcodeRecord;

    await client.successSend(patchInteractionIdentifiers, {
      phone: userProfile.primaryPhone,
      passcode: code,
    });

    const { redirectTo } = await client.submitInteraction();

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

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
    });

    await client.successSend(sendVerificationPasscode, {
      email: newEmail,
    });

    const passcodeRecord = await readPasscode();

    const { code } = passcodeRecord;

    await client.successSend(patchInteractionIdentifiers, {
      email: newEmail,
      passcode: code,
    });

    await expectRejects(client.submitInteraction(), 'user.user_not_exist');

    await client.successSend(putInteractionEvent, { event: InteractionEvent.Register });
    await client.successSend(putInteractionProfile, { email: newEmail });

    const { redirectTo } = await client.submitInteraction();

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

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
    });

    await client.successSend(sendVerificationPasscode, {
      phone: newPhone,
    });

    const passcodeRecord = await readPasscode();

    const { code } = passcodeRecord;

    await client.successSend(patchInteractionIdentifiers, {
      phone: newPhone,
      passcode: code,
    });

    await expectRejects(client.submitInteraction(), 'user.user_not_exist');

    await client.successSend(putInteractionEvent, { event: InteractionEvent.Register });
    await client.successSend(putInteractionProfile, { phone: newPhone });

    const { redirectTo } = await client.submitInteraction();

    const id = await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(id);
  });

  // Fulfill the username and password
  it('email passcode sign-in', async () => {
    await updateSignInExperience({
      signUp: {
        identifiers: [SignInIdentifier.Username],
        password: true,
        verify: false,
      },
    });

    const { userProfile, user } = await generateNewUser({ primaryEmail: true });
    const { username, password } = generateNewUserProfile({ username: true, password: true });

    // SignIn with email
    const client = await initClient();

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
    });

    await client.successSend(sendVerificationPasscode, {
      email: userProfile.primaryEmail,
    });
    const { code } = await readPasscode();

    await client.successSend(patchInteractionIdentifiers, {
      email: userProfile.primaryEmail,
      passcode: code,
    });

    await expectRejects(client.submitInteraction(), 'user.missing_profile');

    // Fulfill user profile
    await client.successSend(putInteractionProfile, {
      username,
      password,
    });

    const { redirectTo } = await client.submitInteraction();

    await processSession(client, redirectTo);
    await logoutClient(client);

    await client.initSession();
    // SignIn with username and password
    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: {
        username,
        password,
      },
    });

    const { redirectTo: redirectTo2 } = await client.submitInteraction();
    await processSession(client, redirectTo2);
    await logoutClient(client);

    await deleteUser(user.id);
  });

  it('email passcode sign-in with existing password', async () => {
    await updateSignInExperience({
      signUp: {
        identifiers: [SignInIdentifier.Username],
        password: true,
        verify: false,
      },
    });

    const { userProfile, user } = await generateNewUser({ primaryEmail: true, password: true });
    const { username, password } = generateNewUserProfile({ username: true, password: true });

    // SignIn with email
    const client = await initClient();

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
    });

    await client.successSend(sendVerificationPasscode, {
      email: userProfile.primaryEmail,
    });
    const { code } = await readPasscode();

    await client.successSend(patchInteractionIdentifiers, {
      email: userProfile.primaryEmail,
      passcode: code,
    });

    await expectRejects(client.submitInteraction(), 'user.missing_profile');

    // Fulfill user profile with existing password
    await client.successSend(putInteractionProfile, {
      username,
      password,
    });

    await expectRejects(client.submitInteraction(), 'user.password_exists_in_profile');

    await client.successSend(putInteractionProfile, {
      username,
    });

    const { redirectTo } = await client.submitInteraction();

    await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(user.id);
  });

  it('email passcode sign-in with registered username', async () => {
    await updateSignInExperience({
      signUp: {
        identifiers: [SignInIdentifier.Username],
        password: true,
        verify: false,
      },
    });

    const { userProfile, user } = await generateNewUser({ primaryEmail: true });
    const { userProfile: userProfile2, user: user2 } = await generateNewUser({ username: true });
    const { username, password } = generateNewUserProfile({ username: true, password: true });

    // SignIn with email
    const client = await initClient();

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
    });

    await client.successSend(sendVerificationPasscode, {
      email: userProfile.primaryEmail,
    });
    const { code } = await readPasscode();

    await client.successSend(patchInteractionIdentifiers, {
      email: userProfile.primaryEmail,
      passcode: code,
    });

    await expectRejects(client.submitInteraction(), 'user.missing_profile');

    // Fulfill user profile with existing password
    await client.successSend(putInteractionProfile, {
      username: userProfile2.username,
      password,
    });

    await expectRejects(client.submitInteraction(), 'user.username_already_in_use');

    await client.successSend(putInteractionProfile, {
      username,
      password,
    });

    const { redirectTo } = await client.submitInteraction();

    await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(user.id);
    await deleteUser(user2.id);
  });
});
