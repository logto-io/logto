import { ConnectorType } from '@logto/connector-kit';
import { InteractionEvent, MfaFactor, SignInIdentifier } from '@logto/schemas';

import { deleteUser } from '#src/api/admin-user.js';
import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import {
  clearConnectorsByTypes,
  setEmailConnector,
  setSmsConnector,
} from '#src/helpers/connector.js';
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
  enableMandatoryMfaWithPhone,
  enableMandatoryMfaWithPhoneAndBackupCode,
  resetMfaSettings,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';
import { devFeatureTest, generateEmail, generatePhone } from '#src/utils.js';

const { describe, it } = devFeatureTest;

const mfaConfigs = [
  {
    type: 'Email',
    connectorType: ConnectorType.Email,
    setConnector: setEmailConnector,
    generateValue: generateEmail,
    signInIdentifier: SignInIdentifier.Email,
    mfaFactor: MfaFactor.EmailVerificationCode,
    enableMandatoryMfa: enableMandatoryMfaWithEmail,
    enableMandatoryMfaWithBackupCode: enableMandatoryMfaWithEmailAndBackupCode,
  },
  {
    type: 'Phone',
    connectorType: ConnectorType.Sms,
    setConnector: setSmsConnector,
    generateValue: generatePhone,
    signInIdentifier: SignInIdentifier.Phone,
    mfaFactor: MfaFactor.PhoneVerificationCode,
    enableMandatoryMfa: enableMandatoryMfaWithPhone,
    enableMandatoryMfaWithBackupCode: enableMandatoryMfaWithPhoneAndBackupCode,
  },
] as const;

describe.each(mfaConfigs)('$type MFA binding API tests', (config) => {
  const {
    type,
    connectorType,
    setConnector,
    generateValue,
    signInIdentifier,
    mfaFactor,
    enableMandatoryMfa,
    enableMandatoryMfaWithBackupCode,
  } = config;
  const userApi = new UserApiTest();

  beforeAll(async () => {
    await clearConnectorsByTypes([connectorType]);
    await setConnector();
    await enableAllPasswordSignInMethods();
  });

  afterAll(async () => {
    await clearConnectorsByTypes([connectorType]);
    await resetMfaSettings();
  });

  afterEach(async () => {
    await userApi.cleanUp();
  });

  it(`should bind ${type} MFA on register`, async () => {
    await enableMandatoryMfa();

    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const identifierValue = generateValue();

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

    // Bind MFA
    const { verificationId: identifierVerificationId, code } =
      await successfullySendVerificationCode(client, {
        identifier: { type: signInIdentifier, value: identifierValue },
        interactionEvent: InteractionEvent.Register,
      });

    const finalVerificationId = await successfullyVerifyVerificationCode(client, {
      identifier: { type: signInIdentifier, value: identifierValue },
      verificationId: identifierVerificationId,
      code,
    });

    await client.bindMfa(mfaFactor, finalVerificationId);

    const { redirectTo } = await client.submitInteraction();
    const userId = await processSession(client, redirectTo);
    await logoutClient(client);

    // Clean up
    await deleteUser(userId);
  });

  it(`should skip ${type} MFA binding if ${type.toLowerCase()} is sign up identifier`, async () => {
    await enableAllPasswordSignInMethods({
      identifiers: [SignInIdentifier.Username, signInIdentifier],
      password: true,
      verify: true,
    });
    await enableMandatoryMfa();

    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const identifierValue = generateValue();

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

    // Bind MFA
    const { verificationId: identifierVerificationId, code } =
      await successfullySendVerificationCode(client, {
        identifier: { type: signInIdentifier, value: identifierValue },
        interactionEvent: InteractionEvent.Register,
      });

    const finalVerificationId = await successfullyVerifyVerificationCode(client, {
      identifier: { type: signInIdentifier, value: identifierValue },
      verificationId: identifierVerificationId,
      code,
    });

    await client.bindMfa(mfaFactor, finalVerificationId);

    const { redirectTo } = await client.submitInteraction();
    const userId = await processSession(client, redirectTo);
    await logoutClient(client);

    // Clean up
    await deleteUser(userId);
    await enableAllPasswordSignInMethods();
  });

  it(`should bind ${type} MFA on sign-in`, async () => {
    await enableMandatoryMfa();

    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const identifierValue = generateValue();

    await userApi.create({ username, password });

    const client = await initExperienceClient();
    await identifyUserWithUsernamePassword(client, username, password);

    // Bind MFA
    const { verificationId: identifierVerificationId, code } =
      await successfullySendVerificationCode(client, {
        identifier: { type: signInIdentifier, value: identifierValue },
        interactionEvent: InteractionEvent.SignIn,
      });

    const finalVerificationId = await successfullyVerifyVerificationCode(client, {
      identifier: { type: signInIdentifier, value: identifierValue },
      verificationId: identifierVerificationId,
      code,
    });

    await client.bindMfa(mfaFactor, finalVerificationId);

    const { redirectTo } = await client.submitInteraction();
    const userId = await processSession(client, redirectTo);
    await logoutClient(client);

    // Clean up
    await deleteUser(userId);
  });

  it(`should reject binding ${type} MFA with unverified ${type.toLowerCase()}`, async () => {
    await enableMandatoryMfa();

    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const identifierValue = generateValue();

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

    // Get verification ID but don't verify the identifier
    const { verificationId: identifierVerificationId } = await successfullySendVerificationCode(
      client,
      {
        identifier: { type: signInIdentifier, value: identifierValue },
        interactionEvent: InteractionEvent.Register,
      }
    );

    // Try to bind MFA with unverified identifier - should fail
    await expectRejects(client.bindMfa(mfaFactor, identifierVerificationId), {
      code: 'session.verification_failed',
      status: 400,
    });
  });

  it(`should bind both ${type} MFA and backup code`, async () => {
    await enableMandatoryMfaWithBackupCode();

    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const identifierValue = generateValue();

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

    // Bind MFA
    const { verificationId: identifierVerificationId, code } =
      await successfullySendVerificationCode(client, {
        identifier: { type: signInIdentifier, value: identifierValue },
        interactionEvent: InteractionEvent.Register,
      });

    const finalVerificationId = await successfullyVerifyVerificationCode(client, {
      identifier: { type: signInIdentifier, value: identifierValue },
      verificationId: identifierVerificationId,
      code,
    });

    await client.bindMfa(mfaFactor, finalVerificationId);

    // Should require backup code since both MFA and BackupCode are mandatory
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
