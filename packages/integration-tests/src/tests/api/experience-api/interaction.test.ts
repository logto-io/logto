import {
  ConnectorType,
  InteractionEvent,
  SignInIdentifier,
  VerificationType,
} from '@logto/schemas';

import { mockEmailConnectorId, mockSocialConnectorId } from '#src/__mocks__/connectors-mock.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { SsoConnectorApi } from '#src/api/sso-connector.js';
import { initExperienceClient } from '#src/helpers/client.js';
import {
  clearConnectorsByTypes,
  setEmailConnector,
  setSocialConnector,
} from '#src/helpers/connector.js';
import {
  successfullyCreateEnterpriseSsoVerification,
  successfullyVerifyEnterpriseSsoAuthorization,
} from '#src/helpers/experience/enterprise-sso-verification.js';
import { identifyUserWithUsernamePassword } from '#src/helpers/experience/index.js';
import {
  successfullyCreateSocialVerification,
  successfullyVerifySocialAuthorization,
} from '#src/helpers/experience/social-verification.js';
import {
  successfullySendVerificationCode,
  successfullyVerifyVerificationCode,
} from '#src/helpers/experience/verification-code.js';
import { expectRejects } from '#src/helpers/index.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';
import { devFeatureTest, generateEmail, generateUserId, randomString } from '#src/utils.js';

describe('PUT /experience API', () => {
  const userApi = new UserApiTest();

  afterAll(async () => {
    await userApi.cleanUp();
  });

  it('PUT new experience API should reset all existing verification records', async () => {
    const { username, password } = generateNewUserProfile({ username: true, password: true });
    await userApi.create({ username, password });

    const client = await initExperienceClient();
    const { verificationId } = await client.verifyPassword({
      identifier: { type: SignInIdentifier.Username, value: username },
      password,
    });

    // PUT /experience
    await client.initInteraction({ interactionEvent: InteractionEvent.SignIn });

    await expectRejects(client.identifyUser({ verificationId }), {
      code: 'session.verification_session_not_found',
      status: 404,
    });
  });

  it('should throw if trying to update interaction event from ForgotPassword to others', async () => {
    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.ForgotPassword,
    });

    await expectRejects(
      client.updateInteractionEvent({ interactionEvent: InteractionEvent.SignIn }),
      {
        code: 'session.not_supported_for_forgot_password',
        status: 400,
      }
    );
  });

  it('should throw if trying to update interaction event from SignIn and Register to ForgotPassword', async () => {
    const client = await initExperienceClient();

    await expectRejects(
      client.updateInteractionEvent({ interactionEvent: InteractionEvent.ForgotPassword }),
      {
        code: 'session.not_supported_for_forgot_password',
        status: 400,
      }
    );
  });

  it('should update interaction event from SignIn to Register', async () => {
    const client = await initExperienceClient();

    await expect(
      client.updateInteractionEvent({ interactionEvent: InteractionEvent.Register })
    ).resolves.not.toThrow();
  });
});

devFeatureTest.describe('GET /experience/interaction', () => {
  const userApi = new UserApiTest();
  const connectorIdMap = new Map<string, string>();
  const ssoConnectorApi = new SsoConnectorApi();

  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Social, ConnectorType.Email]);

    const [emailConnector, socialConnector] = await Promise.all([
      setEmailConnector(),
      setSocialConnector(),
    ]);
    connectorIdMap.set(mockEmailConnectorId, emailConnector.id);
    connectorIdMap.set(mockSocialConnectorId, socialConnector.id);
  });

  afterAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Social]);
    await userApi.cleanUp();
    await ssoConnectorApi.cleanUp();
  });

  devFeatureTest.it('should return public interaction data for fresh interaction', async () => {
    const client = await initExperienceClient();
    const data = await client.getInteractionData();

    expect(data).toMatchObject({
      interactionEvent: InteractionEvent.SignIn,
      profile: {},
      verificationRecords: [],
      captcha: {
        verified: false,
        skipped: false,
      },
    });
  });

  devFeatureTest.it(
    'should return correct interaction event type in interaction data',
    async () => {
      // Test SignIn event
      const signInClient = await initExperienceClient({
        interactionEvent: InteractionEvent.SignIn,
      });
      const signInData = await signInClient.getInteractionData();
      expect(signInData.interactionEvent).toBe(InteractionEvent.SignIn);

      // Test Register event
      const registerClient = await initExperienceClient({
        interactionEvent: InteractionEvent.Register,
      });
      const registerData = await registerClient.getInteractionData();
      expect(registerData.interactionEvent).toBe(InteractionEvent.Register);

      // Test ForgotPassword event
      const forgotPasswordClient = await initExperienceClient({
        interactionEvent: InteractionEvent.ForgotPassword,
      });
      const forgotPasswordData = await forgotPasswordClient.getInteractionData();
      expect(forgotPasswordData.interactionEvent).toBe(InteractionEvent.ForgotPassword);
    }
  );

  devFeatureTest.it(
    'should return interaction data with password verification record',
    async () => {
      const { username, password } = generateNewUserProfile({ username: true, password: true });
      await userApi.create({ username, password });

      const client = await initExperienceClient();

      // Create a password verification record
      const { verificationId } = await client.verifyPassword({
        identifier: { type: SignInIdentifier.Username, value: username },
        password,
      });

      const data = await client.getInteractionData();

      expect(data.verificationRecords).toHaveLength(1);
      expect(data.verificationRecords![0]).toMatchObject({
        id: verificationId,
        type: VerificationType.Password,
        verified: true,
        identifier: { type: SignInIdentifier.Username, value: username },
      });
    }
  );

  devFeatureTest.it('should return interaction data with email verification record', async () => {
    const { primaryEmail } = generateNewUserProfile({ primaryEmail: true });
    await userApi.create({ primaryEmail });

    const client = await initExperienceClient();

    // Create an email verification record
    const { verificationId, code } = await successfullySendVerificationCode(client, {
      identifier: { type: SignInIdentifier.Email, value: primaryEmail },
      interactionEvent: InteractionEvent.SignIn,
    });

    const dataBeforeVerification = await client.getInteractionData();

    expect(dataBeforeVerification.verificationRecords).toHaveLength(1);
    expect(dataBeforeVerification.verificationRecords![0]).toMatchObject({
      id: verificationId,
      type: VerificationType.EmailVerificationCode,
      verified: false,
      identifier: { type: SignInIdentifier.Email, value: primaryEmail },
    });

    await successfullyVerifyVerificationCode(client, {
      identifier: { type: SignInIdentifier.Email, value: primaryEmail },
      verificationId,
      code,
    });

    const dataAfterVerification = await client.getInteractionData();

    expect(dataAfterVerification.verificationRecords![0]).toMatchObject({
      id: verificationId,
      type: VerificationType.EmailVerificationCode,
      verified: true,
      identifier: { type: SignInIdentifier.Email, value: primaryEmail },
    });
  });

  devFeatureTest.it('should return interaction data with phone verification record', async () => {
    const { primaryPhone } = generateNewUserProfile({ primaryPhone: true });
    await userApi.create({ primaryPhone });

    const client = await initExperienceClient();

    // Create a phone verification record
    const { verificationId, code } = await successfullySendVerificationCode(client, {
      identifier: { type: SignInIdentifier.Phone, value: primaryPhone },
      interactionEvent: InteractionEvent.SignIn,
    });

    const dataBeforeVerification = await client.getInteractionData();

    expect(dataBeforeVerification.verificationRecords).toHaveLength(1);
    expect(dataBeforeVerification.verificationRecords![0]).toMatchObject({
      id: verificationId,
      type: VerificationType.PhoneVerificationCode,
      verified: false,
      identifier: { type: SignInIdentifier.Phone, value: primaryPhone },
    });

    await successfullyVerifyVerificationCode(client, {
      identifier: { type: SignInIdentifier.Phone, value: primaryPhone },
      verificationId,
      code,
    });

    const dataAfterVerification = await client.getInteractionData();

    expect(dataAfterVerification.verificationRecords![0]).toMatchObject({
      id: verificationId,
      type: VerificationType.PhoneVerificationCode,
      verified: true,
      identifier: { type: SignInIdentifier.Phone, value: primaryPhone },
    });
  });

  devFeatureTest.it(
    'should return interaction data with profile info after fulfilling profile',
    async () => {
      const { username, password } = generateNewUserProfile({ username: true, password: true });
      const { id: userId } = await userApi.create({ username, password });

      const client = await initExperienceClient();
      const { verificationId: passwordVerificationId } = await identifyUserWithUsernamePassword(
        client,
        username,
        password
      );

      const primaryEmail = generateEmail();

      const { verificationId: emailVerificationId, code: verificationCode } =
        await successfullySendVerificationCode(client, {
          identifier: { type: SignInIdentifier.Email, value: primaryEmail },
          interactionEvent: InteractionEvent.SignIn,
        });
      await successfullyVerifyVerificationCode(client, {
        identifier: { type: SignInIdentifier.Email, value: primaryEmail },
        verificationId: emailVerificationId,
        code: verificationCode,
      });

      await client.updateProfile({
        type: SignInIdentifier.Email,
        verificationId: emailVerificationId,
      });

      const data = await client.getInteractionData();

      expect(data).toMatchObject({
        interactionEvent: InteractionEvent.SignIn,
        userId,
        profile: { primaryEmail },
        verificationRecords: [
          {
            id: passwordVerificationId,
            type: VerificationType.Password,
            verified: true,
            identifier: { type: SignInIdentifier.Username, value: username },
          },
          {
            id: emailVerificationId,
            type: VerificationType.EmailVerificationCode,
            verified: true,
            identifier: { type: SignInIdentifier.Email, value: primaryEmail },
          },
        ],
      });
    }
  );

  devFeatureTest.it('should not include sensitive data in verification records', async () => {
    const { username, password } = generateNewUserProfile({ username: true, password: true });
    await userApi.create({ username, password });

    const client = await initExperienceClient();

    await client.verifyPassword({
      identifier: { type: SignInIdentifier.Username, value: username },
      password,
    });

    const data = await client.getInteractionData();

    const passwordRecord = data.verificationRecords![0];

    // Should not include password or other sensitive data
    expect(passwordRecord).not.toHaveProperty('password');
    expect(passwordRecord).not.toHaveProperty('passwordEncrypted');
  });

  devFeatureTest.it('should return interaction data for social verification', async () => {
    const state = 'fake_state';
    const redirectUri = 'http://localhost:3000/redirect';
    const authorizationCode = 'fake_code';
    const socialConnectorId = connectorIdMap.get(mockSocialConnectorId)!;
    const email = generateEmail();

    const client = await initExperienceClient({ interactionEvent: InteractionEvent.Register });

    const { verificationId } = await successfullyCreateSocialVerification(
      client,
      socialConnectorId,
      { redirectUri, state }
    );

    await successfullyVerifySocialAuthorization(client, socialConnectorId, {
      verificationId,
      connectorData: { code: authorizationCode, userId: '12345', email, name: 'John Doe' },
    });

    const data = await client.getInteractionData();

    expect(data).toMatchObject({
      verificationRecords: [
        {
          id: verificationId,
          type: VerificationType.Social,
          connectorId: socialConnectorId,
          socialUserInfo: {
            id: '12345',
            email,
            name: 'John Doe',
          },
        },
      ],
    });
  });

  devFeatureTest.it('should return interaction data for enterprise SSO verification', async () => {
    const state = 'fake_state';
    const redirectUri = 'http://localhost:3000/redirect';
    const code = 'fake_code';
    const domain = `foo${randomString()}.com`;
    await ssoConnectorApi.createMockOidcConnector([domain]);

    // Enable single sign-on
    await updateSignInExperience({ singleSignOnEnabled: true });

    const connectorId = ssoConnectorApi.firstConnectorId!;
    const client = await initExperienceClient({ interactionEvent: InteractionEvent.Register });

    // Create enterprise SSO verification
    const { verificationId } = await successfullyCreateEnterpriseSsoVerification(
      client,
      connectorId,
      { redirectUri, state }
    );

    const fakeSsoIdentitySub = generateUserId();
    // Verify enterprise SSO authorization with basic format (similar to verification test)
    await successfullyVerifyEnterpriseSsoAuthorization(client, connectorId, {
      verificationId,
      connectorData: {
        code,
        sub: fakeSsoIdentitySub,
        name: 'John Doe',
        email: `john.doe@${domain}`,
        email_verified: true,
        picture: 'https://example.com/picture.jpg',
        phone: '1234567890',
        phone_verified: true,
      },
    });

    // Get interaction data
    const data = await client.getInteractionData();

    expect(data).toMatchObject({
      verificationRecords: [
        {
          id: verificationId,
          type: VerificationType.EnterpriseSso,
          connectorId,
          enterpriseSsoUserInfo: {
            id: fakeSsoIdentitySub,
            name: 'John Doe',
            email: `john.doe@${domain}`,
            avatar: 'https://example.com/picture.jpg',
            phone: '1234567890',
          },
        },
      ],
    });
  });
});
