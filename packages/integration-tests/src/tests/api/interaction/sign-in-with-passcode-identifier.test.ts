import { ConnectorType, InteractionEvent, SignInIdentifier } from '@logto/schemas';

import {
  sendVerificationPasscode,
  putInteraction,
  putInteractionEvent,
  patchInteractionProfile,
  patchInteractionIdentifiers,
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

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
    });

    await client.successSend(sendVerificationPasscode, {
      event: InteractionEvent.SignIn,
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
      event: InteractionEvent.SignIn,
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
      event: InteractionEvent.SignIn,
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
    await client.successSend(patchInteractionProfile, { email: newEmail });

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
      event: InteractionEvent.SignIn,
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
    await client.successSend(patchInteractionProfile, { phone: newPhone });

    const { redirectTo } = await client.submitInteraction();

    const id = await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(id);
  });
});
