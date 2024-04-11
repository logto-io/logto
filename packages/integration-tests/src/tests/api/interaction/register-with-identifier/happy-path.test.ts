import { ConnectorType, InteractionEvent, SignInIdentifier } from '@logto/schemas';
import { assert } from '@silverhand/essentials';

import {
  sendVerificationCode,
  putInteraction,
  deleteUser,
  patchInteractionIdentifiers,
  putInteractionProfile,
  patchInteractionProfile,
  deleteInteractionProfile,
  putInteractionEvent,
} from '#src/api/index.js';
import { initClient, processSession, logoutClient } from '#src/helpers/client.js';
import {
  clearConnectorsByTypes,
  setEmailConnector,
  setSmsConnector,
} from '#src/helpers/connector.js';
import { readConnectorMessage, expectRejects } from '#src/helpers/index.js';
import {
  enableAllVerificationCodeSignInMethods,
  enableAllPasswordSignInMethods,
  resetPasswordPolicy,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, generateNewUser } from '#src/helpers/user.js';

describe('register with username and password', () => {
  it('register with username and password', async () => {
    await enableAllPasswordSignInMethods({
      identifiers: [SignInIdentifier.Username],
      password: true,
      verify: false,
    });
    // Run it sequentially to avoid race condition
    await resetPasswordPolicy();

    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const client = await initClient();

    await client.send(putInteraction, {
      event: InteractionEvent.Register,
      profile: {
        username,
        password,
      },
    });

    const { redirectTo } = await client.submitInteraction();

    const id = await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(id);
  });
});

describe('register with passwordless identifier', () => {
  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
    await setEmailConnector();
    await setSmsConnector();
    // Run it sequentially to avoid race condition
    await resetPasswordPolicy();
  });

  afterAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
  });

  it('register with email', async () => {
    await enableAllVerificationCodeSignInMethods({
      identifiers: [SignInIdentifier.Email],
      password: false,
      verify: true,
    });

    const { primaryEmail } = generateNewUserProfile({ primaryEmail: true });
    const client = await initClient();

    await client.successSend(putInteraction, {
      event: InteractionEvent.Register,
    });

    await client.successSend(sendVerificationCode, {
      email: primaryEmail,
    });

    const verificationCodeRecord = await readConnectorMessage('Email');

    expect(verificationCodeRecord).toMatchObject({
      address: primaryEmail,
      type: InteractionEvent.Register,
    });

    const { code } = verificationCodeRecord;

    await client.successSend(patchInteractionIdentifiers, {
      email: primaryEmail,
      verificationCode: code,
    });

    await client.successSend(putInteractionProfile, {
      email: primaryEmail,
    });

    const { redirectTo } = await client.submitInteraction();

    const id = await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(id);
  });

  it('register with email and fulfill password', async () => {
    await enableAllVerificationCodeSignInMethods({
      identifiers: [SignInIdentifier.Email],
      password: true,
      verify: true,
    });

    const { primaryEmail, password } = generateNewUserProfile({
      primaryEmail: true,
      password: true,
    });
    const client = await initClient();

    await client.successSend(putInteraction, {
      event: InteractionEvent.Register,
    });

    await client.successSend(sendVerificationCode, {
      email: primaryEmail,
    });

    const verificationCodeRecord = await readConnectorMessage('Email');

    const { code } = verificationCodeRecord;

    await client.successSend(patchInteractionIdentifiers, {
      email: primaryEmail,
      verificationCode: code,
    });

    await client.successSend(putInteractionProfile, {
      email: primaryEmail,
    });

    await expectRejects(client.submitInteraction(), {
      code: 'user.missing_profile',
      status: 422,
    });

    await client.successSend(patchInteractionProfile, {
      password,
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
        password,
      },
    });

    const { redirectTo: redirectTo2 } = await client.submitInteraction();
    const id = await processSession(client, redirectTo2);
    await logoutClient(client);

    await deleteUser(id);
  });

  it('register with phone', async () => {
    await enableAllVerificationCodeSignInMethods({
      identifiers: [SignInIdentifier.Phone],
      password: false,
      verify: true,
    });

    const { primaryPhone } = generateNewUserProfile({ primaryPhone: true });
    const client = await initClient();

    await client.successSend(putInteraction, {
      event: InteractionEvent.Register,
    });

    await client.successSend(sendVerificationCode, {
      phone: primaryPhone,
    });

    const verificationCodeRecord = await readConnectorMessage('Sms');

    expect(verificationCodeRecord).toMatchObject({
      phone: primaryPhone,
      type: InteractionEvent.Register,
    });

    const { code } = verificationCodeRecord;

    await client.successSend(patchInteractionIdentifiers, {
      phone: primaryPhone,
      verificationCode: code,
    });

    await client.successSend(putInteractionProfile, {
      phone: primaryPhone,
    });

    const { redirectTo } = await client.submitInteraction();

    const id = await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(id);
  });

  it('register with phone and fulfill password', async () => {
    await enableAllVerificationCodeSignInMethods({
      identifiers: [SignInIdentifier.Phone],
      password: true,
      verify: true,
    });

    const { primaryPhone, password } = generateNewUserProfile({
      primaryPhone: true,
      password: true,
    });
    const client = await initClient();

    await client.successSend(putInteraction, {
      event: InteractionEvent.Register,
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

    await expectRejects(client.submitInteraction(), {
      code: 'user.missing_profile',
      status: 422,
    });

    await client.successSend(patchInteractionProfile, {
      password,
    });

    const { redirectTo } = await client.submitInteraction();

    await processSession(client, redirectTo);
    await logoutClient(client);

    // SignIn with phone and password
    await client.initSession();
    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: {
        phone: primaryPhone,
        password,
      },
    });

    const { redirectTo: redirectTo2 } = await client.submitInteraction();
    const id = await processSession(client, redirectTo2);
    await logoutClient(client);

    await deleteUser(id);
  });

  it('register with exiting email', async () => {
    const {
      user,
      userProfile: { primaryEmail },
    } = await generateNewUser({ primaryEmail: true });

    await enableAllVerificationCodeSignInMethods({
      identifiers: [SignInIdentifier.Email],
      password: false,
      verify: true,
    });

    const client = await initClient();

    await client.successSend(putInteraction, {
      event: InteractionEvent.Register,
    });

    await client.successSend(sendVerificationCode, {
      email: primaryEmail,
    });

    const verificationCodeRecord = await readConnectorMessage('Email');

    expect(verificationCodeRecord).toMatchObject({
      address: primaryEmail,
      type: InteractionEvent.Register,
    });

    const { code } = verificationCodeRecord;

    await client.successSend(patchInteractionIdentifiers, {
      email: primaryEmail,
      verificationCode: code,
    });

    await client.successSend(putInteractionProfile, {
      email: primaryEmail,
    });

    await expectRejects(client.submitInteraction(), {
      code: 'user.email_already_in_use',
      status: 422,
    });

    await client.successSend(deleteInteractionProfile);
    await client.successSend(putInteractionEvent, { event: InteractionEvent.SignIn });

    const { redirectTo } = await client.submitInteraction();
    await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(user.id);
  });

  it('register with exiting phone', async () => {
    const {
      user,
      userProfile: { primaryPhone },
    } = await generateNewUser({ primaryPhone: true });

    await enableAllVerificationCodeSignInMethods({
      identifiers: [SignInIdentifier.Phone],
      password: false,
      verify: true,
    });

    const client = await initClient();
    assert(client.interactionCookie, new Error('Session not found'));

    await client.successSend(putInteraction, {
      event: InteractionEvent.Register,
    });

    await client.successSend(sendVerificationCode, {
      phone: primaryPhone,
    });

    const verificationCodeRecord = await readConnectorMessage('Sms');

    expect(verificationCodeRecord).toMatchObject({
      phone: primaryPhone,
      type: InteractionEvent.Register,
    });

    const { code } = verificationCodeRecord;

    await client.successSend(patchInteractionIdentifiers, {
      phone: primaryPhone,
      verificationCode: code,
    });

    await client.successSend(putInteractionProfile, {
      phone: primaryPhone,
    });

    await expectRejects(client.submitInteraction(), {
      code: 'user.phone_already_in_use',
      status: 422,
    });

    await client.successSend(deleteInteractionProfile);
    await client.successSend(putInteractionEvent, { event: InteractionEvent.SignIn });

    const { redirectTo } = await client.submitInteraction();
    await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(user.id);
  });
});
