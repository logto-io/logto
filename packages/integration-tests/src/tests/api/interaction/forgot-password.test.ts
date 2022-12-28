import { InteractionEvent, ConnectorType, SignInIdentifier } from '@logto/schemas';

import {
  putInteraction,
  sendVerificationPasscode,
  deleteUser,
  patchInteractionIdentifiers,
  putInteractionProfile,
  patchInteractionProfile,
} from '#src/api/index.js';
import { expectRejects, readPasscode } from '#src/helpers.js';
import { generatePassword } from '#src/utils.js';

import { initClient, processSession, logoutClient } from './utils/client.js';
import { clearConnectorsByTypes, setEmailConnector, setSmsConnector } from './utils/connector.js';
import { enableAllPasscodeSignInMethods } from './utils/sign-in-experience.js';
import { generateNewUser } from './utils/user.js';

describe('reset password', () => {
  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
    await setEmailConnector();
    await setSmsConnector();
    await enableAllPasscodeSignInMethods({
      identifiers: [SignInIdentifier.Email, SignInIdentifier.Sms],
      password: true,
      verify: true,
    });
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

    await client.successSend(putInteraction, { event: InteractionEvent.ForgotPassword });
    await client.successSend(sendVerificationPasscode, {
      email: userProfile.primaryEmail,
    });

    const passcodeRecord = await readPasscode();

    expect(passcodeRecord).toMatchObject({
      address: userProfile.primaryEmail,
      type: InteractionEvent.ForgotPassword,
    });

    const { code } = passcodeRecord;

    await client.successSend(patchInteractionIdentifiers, {
      email: userProfile.primaryEmail,
      passcode: code,
    });

    await expectRejects(client.submitInteraction(), 'user.new_password_required_in_profile');

    await client.successSend(putInteractionProfile, { password: userProfile.password });

    await expectRejects(client.submitInteraction(), 'user.same_password');

    const newPasscodeRecord = generatePassword();

    await client.successSend(patchInteractionProfile, { password: newPasscodeRecord });

    await client.submitInteraction();

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: {
        email: userProfile.primaryEmail,
        password: newPasscodeRecord,
      },
    });

    const { redirectTo } = await client.submitInteraction();

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

    await client.successSend(putInteraction, { event: InteractionEvent.ForgotPassword });
    await client.successSend(sendVerificationPasscode, {
      phone: userProfile.primaryPhone,
    });

    const passcodeRecord = await readPasscode();

    expect(passcodeRecord).toMatchObject({
      phone: userProfile.primaryPhone,
      type: InteractionEvent.ForgotPassword,
    });

    const { code } = passcodeRecord;

    await client.successSend(patchInteractionIdentifiers, {
      phone: userProfile.primaryPhone,
      passcode: code,
    });

    await expectRejects(client.submitInteraction(), 'user.new_password_required_in_profile');

    await client.successSend(putInteractionProfile, { password: userProfile.password });

    await expectRejects(client.submitInteraction(), 'user.same_password');

    const newPasscodeRecord = generatePassword();

    await client.successSend(patchInteractionProfile, { password: newPasscodeRecord });

    await client.submitInteraction();

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: {
        phone: userProfile.primaryPhone,
        password: newPasscodeRecord,
      },
    });

    const { redirectTo } = await client.submitInteraction();

    await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(user.id);
  });
});
