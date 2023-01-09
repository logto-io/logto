import { InteractionEvent, ConnectorType, SignInIdentifier } from '@logto/schemas';

import {
  putInteraction,
  sendVerificationCode,
  deleteUser,
  patchInteractionIdentifiers,
  putInteractionProfile,
  patchInteractionProfile,
} from '#src/api/index.js';
import { expectRejects, readPasscode } from '#src/helpers.js';
import { generatePassword } from '#src/utils.js';

import { initClient, processSession, logoutClient } from './utils/client.js';
import { clearConnectorsByTypes, setEmailConnector, setSmsConnector } from './utils/connector.js';
import { enableAllVerificationCodeSignInMethods } from './utils/sign-in-experience.js';
import { generateNewUser } from './utils/user.js';

describe('reset password', () => {
  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
    await setEmailConnector();
    await setSmsConnector();
    await enableAllVerificationCodeSignInMethods({
      identifiers: [SignInIdentifier.Email, SignInIdentifier.Phone],
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
    await client.successSend(sendVerificationCode, {
      email: userProfile.primaryEmail,
    });

    const verificationCodeRecord = await readPasscode();

    expect(verificationCodeRecord).toMatchObject({
      address: userProfile.primaryEmail,
      type: InteractionEvent.ForgotPassword,
    });

    const { code } = verificationCodeRecord;

    await client.successSend(patchInteractionIdentifiers, {
      email: userProfile.primaryEmail,
      verificationCode: code,
    });

    await expectRejects(client.submitInteraction(), 'user.new_password_required_in_profile');

    await client.successSend(putInteractionProfile, { password: userProfile.password });

    await expectRejects(client.submitInteraction(), 'user.same_password');

    const newPasswordRecord = generatePassword();

    await client.successSend(patchInteractionProfile, { password: newPasswordRecord });

    await client.submitInteraction();

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: {
        email: userProfile.primaryEmail,
        password: newPasswordRecord,
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
    await client.successSend(sendVerificationCode, {
      phone: userProfile.primaryPhone,
    });

    const verificationCodeRecord = await readPasscode();

    expect(verificationCodeRecord).toMatchObject({
      phone: userProfile.primaryPhone,
      type: InteractionEvent.ForgotPassword,
    });

    const { code } = verificationCodeRecord;

    await client.successSend(patchInteractionIdentifiers, {
      phone: userProfile.primaryPhone,
      verificationCode: code,
    });

    await expectRejects(client.submitInteraction(), 'user.new_password_required_in_profile');

    await client.successSend(putInteractionProfile, { password: userProfile.password });

    await expectRejects(client.submitInteraction(), 'user.same_password');

    const newPasswordRecord = generatePassword();

    await client.successSend(patchInteractionProfile, { password: newPasswordRecord });

    await client.submitInteraction();

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: {
        phone: userProfile.primaryPhone,
        password: newPasswordRecord,
      },
    });

    const { redirectTo } = await client.submitInteraction();

    await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(user.id);
  });
});
