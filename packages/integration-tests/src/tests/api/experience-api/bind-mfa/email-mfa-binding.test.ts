import { ConnectorType } from '@logto/connector-kit';
import { InteractionEvent, MfaFactor, SignInIdentifier } from '@logto/schemas';

import { deleteUser } from '#src/api/admin-user.js';
import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import { clearConnectorsByTypes, setEmailConnector } from '#src/helpers/connector.js';
import { identifyUserWithUsernamePassword } from '#src/helpers/experience/index.js';
import {
  successfullySendVerificationCode,
  successfullyVerifyVerificationCode,
} from '#src/helpers/experience/verification-code.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  enableAllPasswordSignInMethods,
  enableMandatoryMfaWithEmail,
  enableMandatoryMfaWithEmailAndBackupCode,
  resetMfaSettings,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';
import { devFeatureTest } from '#src/utils.js';

const { describe, it } = devFeatureTest;

describe('Email MFA binding API tests', () => {
  const userApi = new UserApiTest();

  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email]);
    await setEmailConnector();
    await enableAllPasswordSignInMethods();
  });

  afterAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email]);
    await resetMfaSettings();
  });

  afterEach(async () => {
    await userApi.cleanUp();
  });

  it('should bind Email MFA on register', async () => {
    await enableMandatoryMfaWithEmail();

    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const email = `register-test-${Date.now()}@example.com`;

    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.Register,
    });

    const { verificationId } = await client.createNewPasswordIdentityVerification({
      identifier: {
        type: SignInIdentifier.Username,
        value: username,
      },
      password,
    });

    await client.identifyUser({ verificationId });

    // Bind Email MFA
    const { verificationId: emailVerificationId, code } = await successfullySendVerificationCode(
      client,
      {
        identifier: { type: SignInIdentifier.Email, value: email },
        interactionEvent: InteractionEvent.Register,
      }
    );

    const finalEmailVerificationId = await successfullyVerifyVerificationCode(client, {
      identifier: { type: SignInIdentifier.Email, value: email },
      verificationId: emailVerificationId,
      code,
    });

    await client.bindMfa(MfaFactor.EmailVerificationCode, finalEmailVerificationId);

    const { redirectTo } = await client.submitInteraction();
    const userId = await processSession(client, redirectTo);
    await logoutClient(client);

    // Clean up
    await deleteUser(userId);
  });

  it('should skip Email MFA binding if email is sign up identifier', async () => {
    await enableAllPasswordSignInMethods({
      identifiers: [SignInIdentifier.Username, SignInIdentifier.Email],
      password: true,
      verify: true,
    });
    await enableMandatoryMfaWithEmail();

    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const email = `register-test-${Date.now()}@example.com`;

    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.Register,
    });

    const { verificationId } = await client.createNewPasswordIdentityVerification({
      identifier: {
        type: SignInIdentifier.Username,
        value: username,
      },
      password,
    });

    await client.identifyUser({ verificationId });

    // Bind Email MFA
    const { verificationId: emailVerificationId, code } = await successfullySendVerificationCode(
      client,
      {
        identifier: { type: SignInIdentifier.Email, value: email },
        interactionEvent: InteractionEvent.Register,
      }
    );

    const finalEmailVerificationId = await successfullyVerifyVerificationCode(client, {
      identifier: { type: SignInIdentifier.Email, value: email },
      verificationId: emailVerificationId,
      code,
    });

    await client.bindMfa(MfaFactor.EmailVerificationCode, finalEmailVerificationId);

    const { redirectTo } = await client.submitInteraction();
    const userId = await processSession(client, redirectTo);
    await logoutClient(client);

    // Clean up
    await deleteUser(userId);
    await enableAllPasswordSignInMethods();
  });

  it('should bind Email MFA on sign-in', async () => {
    await enableMandatoryMfaWithEmail();

    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const email = `signin-test-${Date.now()}@example.com`;

    await userApi.create({ username, password });

    const client = await initExperienceClient();
    await identifyUserWithUsernamePassword(client, username, password);

    // Bind Email MFA
    const { verificationId: emailVerificationId, code } = await successfullySendVerificationCode(
      client,
      {
        identifier: { type: SignInIdentifier.Email, value: email },
        interactionEvent: InteractionEvent.SignIn,
      }
    );

    const finalEmailVerificationId = await successfullyVerifyVerificationCode(client, {
      identifier: { type: SignInIdentifier.Email, value: email },
      verificationId: emailVerificationId,
      code,
    });

    await client.bindMfa(MfaFactor.EmailVerificationCode, finalEmailVerificationId);

    const { redirectTo } = await client.submitInteraction();
    const userId = await processSession(client, redirectTo);
    await logoutClient(client);

    // Clean up
    await deleteUser(userId);
  });

  it('should reject binding Email MFA with unverified email', async () => {
    await enableMandatoryMfaWithEmail();

    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const email = `unverified-test-${Date.now()}@example.com`;

    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.Register,
    });

    const { verificationId } = await client.createNewPasswordIdentityVerification({
      identifier: {
        type: SignInIdentifier.Username,
        value: username,
      },
      password,
    });

    await client.identifyUser({ verificationId });

    // Get verification ID but don't verify the email
    const { verificationId: emailVerificationId } = await successfullySendVerificationCode(client, {
      identifier: { type: SignInIdentifier.Email, value: email },
      interactionEvent: InteractionEvent.Register,
    });

    // Try to bind Email MFA with unverified email - should fail
    await expectRejects(client.bindMfa(MfaFactor.EmailVerificationCode, emailVerificationId), {
      code: 'session.verification_failed',
      status: 400,
    });
  });

  it('should bind both Email MFA and backup code', async () => {
    await enableMandatoryMfaWithEmailAndBackupCode();

    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const email = `backup-test-${Date.now()}@example.com`;

    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.Register,
    });

    const { verificationId } = await client.createNewPasswordIdentityVerification({
      identifier: {
        type: SignInIdentifier.Username,
        value: username,
      },
      password,
    });

    await client.identifyUser({ verificationId });

    // Bind Email MFA
    const { verificationId: emailVerificationId, code } = await successfullySendVerificationCode(
      client,
      {
        identifier: { type: SignInIdentifier.Email, value: email },
        interactionEvent: InteractionEvent.Register,
      }
    );

    const finalEmailVerificationId = await successfullyVerifyVerificationCode(client, {
      identifier: { type: SignInIdentifier.Email, value: email },
      verificationId: emailVerificationId,
      code,
    });

    await client.bindMfa(MfaFactor.EmailVerificationCode, finalEmailVerificationId);

    // Should require backup code since both Email and BackupCode are mandatory
    await expectRejects(client.submitInteraction(), {
      code: 'session.mfa.backup_code_required',
      status: 422,
    });

    // Bind backup code
    const { verificationId: backupCodeVerificationId } = await client.generateMfaBackupCodes();
    await client.bindMfa(MfaFactor.BackupCode, backupCodeVerificationId);

    const { redirectTo } = await client.submitInteraction();
    const userId = await processSession(client, redirectTo);
    await logoutClient(client);

    // Clean up
    await deleteUser(userId);
  });
});
