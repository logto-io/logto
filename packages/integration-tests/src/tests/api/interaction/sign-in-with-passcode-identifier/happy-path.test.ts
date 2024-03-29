import { ConnectorType, InteractionEvent, SignInIdentifier } from '@logto/schemas';

import {
  sendVerificationCode,
  putInteraction,
  putInteractionEvent,
  putInteractionProfile,
  patchInteractionIdentifiers,
  deleteUser,
  updateSignInExperience,
} from '#src/api/index.js';
import { initClient, processSession, logoutClient } from '#src/helpers/client.js';
import {
  clearConnectorsByTypes,
  setEmailConnector,
  setSmsConnector,
} from '#src/helpers/connector.js';
import { expectRejects, readConnectorMessage } from '#src/helpers/index.js';
import { enableAllVerificationCodeSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUser, generateNewUserProfile } from '#src/helpers/user.js';
import { generateEmail, generatePhone } from '#src/utils.js';

describe('Sign-in flow using verification-code identifiers', () => {
  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
    await setEmailConnector();
    await setSmsConnector();
    await enableAllVerificationCodeSignInMethods();
  });

  afterAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
  });

  it('sign-in with email and verification-code', async () => {
    const { userProfile, user } = await generateNewUser({ primaryEmail: true });
    const client = await initClient();

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
    });

    await client.successSend(sendVerificationCode, {
      email: userProfile.primaryEmail,
    });

    const verificationCodeRecord = await readConnectorMessage('Email');

    expect(verificationCodeRecord).toMatchObject({
      address: userProfile.primaryEmail,
      type: InteractionEvent.SignIn,
    });

    const { code } = verificationCodeRecord;

    await client.successSend(patchInteractionIdentifiers, {
      email: userProfile.primaryEmail,
      verificationCode: code,
    });

    const { redirectTo } = await client.submitInteraction();

    await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(user.id);
  });

  it('sign-in with phone and verification-code', async () => {
    const { userProfile, user } = await generateNewUser({ primaryPhone: true });
    const client = await initClient();

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
    });

    await client.successSend(sendVerificationCode, {
      phone: userProfile.primaryPhone,
    });

    const verificationCodeRecord = await readConnectorMessage('Sms');

    expect(verificationCodeRecord).toMatchObject({
      phone: userProfile.primaryPhone,
      type: InteractionEvent.SignIn,
    });

    const { code } = verificationCodeRecord;

    await client.successSend(patchInteractionIdentifiers, {
      phone: userProfile.primaryPhone,
      verificationCode: code,
    });

    const { redirectTo } = await client.submitInteraction();

    await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(user.id);
  });

  it('sign-in with non-exist email account with verification-code', async () => {
    const newEmail = generateEmail();

    // Enable email sign-up
    await updateSignInExperience({
      signUp: { identifiers: [SignInIdentifier.Email], password: false, verify: true },
    });

    const client = await initClient();

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
    });

    await client.successSend(sendVerificationCode, {
      email: newEmail,
    });

    const verificationCodeRecord = await readConnectorMessage('Email');

    const { code } = verificationCodeRecord;

    await client.successSend(patchInteractionIdentifiers, {
      email: newEmail,
      verificationCode: code,
    });

    await expectRejects(client.submitInteraction(), {
      code: 'user.user_not_exist',
      status: 404,
    });

    await client.successSend(putInteractionEvent, { event: InteractionEvent.Register });
    await client.successSend(putInteractionProfile, { email: newEmail });

    const { redirectTo } = await client.submitInteraction();

    const id = await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(id);
  });

  it('sign-in with non-exist phone account with verification-code', async () => {
    const newPhone = generatePhone();

    // Enable phone sign-up
    await updateSignInExperience({
      signUp: { identifiers: [SignInIdentifier.Phone], password: false, verify: true },
    });

    const client = await initClient();

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
    });

    await client.successSend(sendVerificationCode, {
      phone: newPhone,
    });

    const verificationCodeRecord = await readConnectorMessage('Sms');

    const { code } = verificationCodeRecord;

    await client.successSend(patchInteractionIdentifiers, {
      phone: newPhone,
      verificationCode: code,
    });

    await expectRejects(client.submitInteraction(), {
      code: 'user.user_not_exist',
      status: 404,
    });

    await client.successSend(putInteractionEvent, { event: InteractionEvent.Register });
    await client.successSend(putInteractionProfile, { phone: newPhone });

    const { redirectTo } = await client.submitInteraction();

    const id = await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(id);
  });

  // Fulfill the username and password
  it('email verification-code sign-in', async () => {
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

    await client.successSend(sendVerificationCode, {
      email: userProfile.primaryEmail,
    });
    const { code } = await readConnectorMessage('Email');

    await client.successSend(patchInteractionIdentifiers, {
      email: userProfile.primaryEmail,
      verificationCode: code,
    });

    await expectRejects(client.submitInteraction(), {
      code: 'user.missing_profile',
      status: 422,
    });

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

  it('email verification-code sign-in with existing password', async () => {
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

    await client.successSend(sendVerificationCode, {
      email: userProfile.primaryEmail,
    });
    const { code } = await readConnectorMessage('Email');

    await client.successSend(patchInteractionIdentifiers, {
      email: userProfile.primaryEmail,
      verificationCode: code,
    });

    await expectRejects(client.submitInteraction(), {
      code: 'user.missing_profile',
      status: 422,
    });

    // Fulfill user profile with existing password
    await client.successSend(putInteractionProfile, {
      username,
      password,
    });

    await expectRejects(client.submitInteraction(), {
      code: 'user.password_exists_in_profile',
      status: 400,
    });

    await client.successSend(putInteractionProfile, {
      username,
    });

    const { redirectTo } = await client.submitInteraction();

    await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(user.id);
  });

  it('email verification-code sign-in with registered username', async () => {
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

    await client.successSend(sendVerificationCode, {
      email: userProfile.primaryEmail,
    });
    const { code } = await readConnectorMessage('Email');

    await client.successSend(patchInteractionIdentifiers, {
      email: userProfile.primaryEmail,
      verificationCode: code,
    });

    await expectRejects(client.submitInteraction(), {
      code: 'user.missing_profile',
      status: 422,
    });

    // Fulfill user profile with existing password
    await client.successSend(putInteractionProfile, {
      username: userProfile2.username,
      password,
    });

    await expectRejects(client.submitInteraction(), {
      code: 'user.username_already_in_use',
      status: 422,
    });

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
