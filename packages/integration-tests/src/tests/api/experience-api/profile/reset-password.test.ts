import { ConnectorType, InteractionEvent, SignInIdentifier } from '@logto/schemas';

import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { type ExperienceClient } from '#src/client/experience/index.js';
import { initExperienceClient } from '#src/helpers/client.js';
import { clearConnectorsByTypes, setEmailConnector } from '#src/helpers/connector.js';
import { signInWithPassword } from '#src/helpers/experience/index.js';
import {
  successfullySendVerificationCode,
  successfullyVerifyVerificationCode,
} from '#src/helpers/experience/verification-code.js';
import { expectRejects } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';
import { devFeatureTest, generatePassword } from '#src/utils.js';

const identifyForgotPasswordInteraction = async (client: ExperienceClient, email: string) => {
  const { verificationId, code } = await successfullySendVerificationCode(client, {
    identifier: { type: SignInIdentifier.Email, value: email },
    interactionEvent: InteractionEvent.ForgotPassword,
  });
  await successfullyVerifyVerificationCode(client, {
    identifier: { type: SignInIdentifier.Email, value: email },
    verificationId,
    code,
  });
  await client.identifyUser({ verificationId });
};

devFeatureTest.describe('Reset Password', () => {
  const userApi = new UserApiTest();

  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email]);
    await setEmailConnector();
    await enableAllPasswordSignInMethods();
  });

  afterEach(async () => {
    await userApi.cleanUp();

    // Reset password policy to default value
    await updateSignInExperience({
      passwordPolicy: {},
    });
  });

  it('should 400 if the interaction is not ForgotPassword', async () => {
    const client = await initExperienceClient();

    await expectRejects(client.resetPassword({ password: 'password' }), {
      status: 400,
      code: 'session.invalid_interaction_type',
    });
  });

  it('should throw 404 if the interaction is not identified', async () => {
    const client = await initExperienceClient(InteractionEvent.ForgotPassword);

    await expectRejects(client.resetPassword({ password: 'password' }), {
      status: 404,
      code: 'session.identifier_not_found',
    });
  });

  it('should throw 422 if identify the user using VerificationType other than CodeVerification', async () => {
    const { username, password } = generateNewUserProfile({ username: true, password: true });
    await userApi.create({ username, password });
    const client = await initExperienceClient(InteractionEvent.ForgotPassword);

    const { verificationId } = await client.verifyPassword({
      identifier: { type: SignInIdentifier.Username, value: username },
      password,
    });

    await expectRejects(client.identifyUser({ verificationId }), {
      status: 422,
      code: 'session.not_supported_for_forgot_password',
    });
  });

  it('should throw 422 if the password is same as the current password', async () => {
    const { primaryEmail, password } = generateNewUserProfile({
      primaryEmail: true,
      password: true,
    });
    await userApi.create({ primaryEmail, password });
    const client = await initExperienceClient(InteractionEvent.ForgotPassword);

    await identifyForgotPasswordInteraction(client, primaryEmail);

    await expectRejects(client.resetPassword({ password }), {
      status: 422,
      code: 'user.same_password',
    });
  });

  it('should throw 422 if the password violates password policy (using email as password)', async () => {
    await updateSignInExperience({
      passwordPolicy: {
        length: { min: 8, max: 32 },
        characterTypes: { min: 3 },
        rejects: {
          pwned: true,
          repetitionAndSequence: true,
          userInfo: true,
        },
      },
    });

    const { primaryEmail, password } = generateNewUserProfile({
      primaryEmail: true,
      password: true,
    });

    await userApi.create({ primaryEmail, password });

    const client = await initExperienceClient(InteractionEvent.ForgotPassword);

    await identifyForgotPasswordInteraction(client, primaryEmail);

    await expectRejects(client.resetPassword({ password: primaryEmail }), {
      status: 422,
      code: 'password.rejected',
    });
  });

  it('should reset password successfully', async () => {
    const { primaryEmail, password } = generateNewUserProfile({
      primaryEmail: true,
      password: true,
    });
    await userApi.create({ primaryEmail, password });

    const newPassword = generatePassword();

    const client = await initExperienceClient(InteractionEvent.ForgotPassword);

    await identifyForgotPasswordInteraction(client, primaryEmail);

    await client.resetPassword({ password: newPassword });

    await client.submitInteraction();

    await signInWithPassword({
      identifier: { type: SignInIdentifier.Email, value: primaryEmail },
      password: newPassword,
    });
  });
});
