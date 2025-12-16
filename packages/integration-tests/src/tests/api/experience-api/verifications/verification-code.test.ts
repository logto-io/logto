import { ConnectorType, TemplateType } from '@logto/connector-kit';
import {
  AlternativeSignUpIdentifier,
  InteractionEvent,
  SignInIdentifier,
  type VerificationCodeIdentifier,
} from '@logto/schemas';

import { deleteUser } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import {
  clearConnectorsByTypes,
  setEmailConnector,
  setSmsConnector,
} from '#src/helpers/connector.js';
import {
  successfullySendVerificationCode,
  successfullyVerifyVerificationCode,
} from '#src/helpers/experience/verification-code.js';
import { createUserByAdmin, expectRejects, readConnectorMessage } from '#src/helpers/index.js';
import { generateEmail, generatePassword, generateUsername } from '#src/utils.js';

describe('Verification code verification APIs', () => {
  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
  });

  const identifiers: VerificationCodeIdentifier[] = [
    {
      type: SignInIdentifier.Email,
      value: 'foo@logto.io',
    },
    {
      type: SignInIdentifier.Phone,
      value: '1234567890',
    },
  ];

  describe.each(identifiers)('Verification code verification APIs for %p', ({ type, value }) => {
    it(`should throw an 501 error if the ${type} connector is not set`, async () => {
      const client = await initExperienceClient();

      await expectRejects(
        client.sendVerificationCode({
          interactionEvent: InteractionEvent.SignIn,
          identifier: {
            type,
            value,
          },
        }),
        {
          code: 'connector.not_found',
          status: 501,
        }
      );

      await (type === 'email' ? setEmailConnector() : setSmsConnector());
    });

    it(`should send a verification code to the ${type} successfully`, async () => {
      const client = await initExperienceClient();

      await successfullySendVerificationCode(client, {
        interactionEvent: InteractionEvent.SignIn,
        identifier: {
          type,
          value,
        },
      });
    });

    it('should throw a 404 error if the verificationId is invalid', async () => {
      const client = await initExperienceClient();

      const { code } = await successfullySendVerificationCode(client, {
        interactionEvent: InteractionEvent.SignIn,
        identifier: {
          type,
          value,
        },
      });

      await expectRejects(
        client.verifyVerificationCode({
          code,
          identifier: {
            type,
            value,
          },
          verificationId: 'invalid_verification_id',
        }),
        {
          code: 'session.verification_session_not_found',
          status: 404,
        }
      );
    });

    it('should throw a 404 error if the verification record is overwritten by a concurrent verification request', async () => {
      const client = await initExperienceClient();

      const { verificationId, code } = await successfullySendVerificationCode(client, {
        interactionEvent: InteractionEvent.SignIn,
        identifier: {
          type,
          value,
        },
      });

      // Resend and recreate the verification record
      await successfullySendVerificationCode(client, {
        interactionEvent: InteractionEvent.SignIn,
        identifier: {
          type,
          value,
        },
      });

      await expectRejects(
        client.verifyVerificationCode({
          code,
          identifier: {
            type,
            value,
          },
          verificationId,
        }),
        {
          code: 'session.verification_session_not_found',
          status: 404,
        }
      );
    });

    it('should throw a 400 error if the identifier is different', async () => {
      const client = await initExperienceClient();

      const { code, verificationId } = await successfullySendVerificationCode(client, {
        interactionEvent: InteractionEvent.SignIn,
        identifier: {
          type,
          value,
        },
      });

      // Use a valid but different identifier to trigger the mismatch error
      const differentValue = type === SignInIdentifier.Email ? 'different@logto.io' : '9876543210';

      await expectRejects(
        client.verifyVerificationCode({
          code,
          identifier: {
            type,
            value: differentValue,
          },
          verificationId,
        }),
        {
          code: `verification_code.${type}_mismatch`,
          status: 400,
        }
      );
    });

    it('should throw a 400 error if the code is mismatched', async () => {
      const client = await initExperienceClient();

      const { verificationId } = await successfullySendVerificationCode(client, {
        interactionEvent: InteractionEvent.SignIn,
        identifier: {
          type,
          value,
        },
      });

      await expectRejects(
        client.verifyVerificationCode({
          code: 'invalid_code',
          identifier: {
            type,
            value,
          },
          verificationId,
        }),
        {
          code: 'verification_code.code_mismatch',
          status: 400,
        }
      );
    });

    it('should verify the verification code successfully', async () => {
      const client = await initExperienceClient();

      const { code, verificationId } = await successfullySendVerificationCode(client, {
        interactionEvent: InteractionEvent.SignIn,
        identifier: {
          type,
          value,
        },
      });

      await successfullyVerifyVerificationCode(client, {
        code,
        identifier: {
          type,
          value,
        },
        verificationId,
      });
    });
  });

  describe('template selection respects sign-up identifiers', () => {
    beforeAll(async () => {
      await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
      await setEmailConnector();
      await setSmsConnector();
    });

    afterAll(async () => {
      await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
    });

    const usernamePasswordMethod = {
      identifier: SignInIdentifier.Username,
      password: true,
      verificationCode: false,
      isPasswordPrimary: true,
    };

    it('keeps using the Register template when email is still a sign-up identifier', async () => {
      await updateSignInExperience({
        signUp: {
          identifiers: [SignInIdentifier.Username, SignInIdentifier.Email],
          password: true,
          verify: true,
        },
        signIn: {
          methods: [usernamePasswordMethod],
        },
        forgotPasswordMethods: [],
      });

      const client = await initExperienceClient({
        interactionEvent: InteractionEvent.Register,
      });
      const username = generateUsername();
      const password = generatePassword();
      const email = generateEmail();

      await client.updateProfile({ type: SignInIdentifier.Username, value: username });
      await client.updateProfile({ type: 'password', value: password });

      // Create the user first so the interaction already has an identified user.
      await client.identifyUser();

      const { verificationId } = await client.sendVerificationCode({
        interactionEvent: InteractionEvent.Register,
        identifier: { type: SignInIdentifier.Email, value: email },
      });

      const emailMessage = await readConnectorMessage('Email');
      expect(emailMessage.type).toBe(TemplateType.Register);

      const { verificationId: verifiedEmailId } = await client.verifyVerificationCode({
        identifier: { type: SignInIdentifier.Email, value: email },
        verificationId,
        code: emailMessage.code,
      });

      await client.updateProfile({ type: SignInIdentifier.Email, verificationId: verifiedEmailId });

      const { redirectTo } = await client.submitInteraction();
      const userId = await processSession(client, redirectTo);
      await logoutClient(client);
      await deleteUser(userId);
    });

    it('keeps using the SignIn template when email is still a secondary sign-up identifier', async () => {
      await updateSignInExperience({
        signUp: {
          identifiers: [SignInIdentifier.Username],
          secondaryIdentifiers: [{ identifier: SignInIdentifier.Email, verify: true }],
          password: true,
          verify: true,
        },
        signIn: {
          methods: [usernamePasswordMethod],
        },
        forgotPasswordMethods: [],
      });

      const username = generateUsername();
      const password = generatePassword();
      const { id: userId } = await createUserByAdmin({ username, password });

      const client = await initExperienceClient({
        interactionEvent: InteractionEvent.SignIn,
      });
      const email = generateEmail();

      const { verificationId: passwordVerificationId } = await client.verifyPassword({
        identifier: { type: SignInIdentifier.Username, value: username },
        password,
      });

      await client.identifyUser({ verificationId: passwordVerificationId });

      const { verificationId } = await client.sendVerificationCode({
        interactionEvent: InteractionEvent.SignIn,
        identifier: { type: SignInIdentifier.Email, value: email },
      });

      const emailMessage = await readConnectorMessage('Email');
      expect(emailMessage.type).toBe(TemplateType.SignIn);

      const { verificationId: verifiedEmailId } = await client.verifyVerificationCode({
        identifier: { type: SignInIdentifier.Email, value: email },
        verificationId,
        code: emailMessage.code,
      });

      await client.updateProfile({ type: SignInIdentifier.Email, verificationId: verifiedEmailId });

      const { redirectTo } = await client.submitInteraction();
      const signedInUserId = await processSession(client, redirectTo);
      expect(signedInUserId).toBe(userId);

      await logoutClient(client);
      await deleteUser(userId);
    });

    it('keeps using the SignIn template when EmailOrPhone is still a secondary sign-up identifier', async () => {
      await updateSignInExperience({
        signUp: {
          identifiers: [SignInIdentifier.Username],
          secondaryIdentifiers: [
            { identifier: AlternativeSignUpIdentifier.EmailOrPhone, verify: true },
          ],
          password: true,
          verify: true,
        },
        signIn: {
          methods: [usernamePasswordMethod],
        },
        forgotPasswordMethods: [],
      });

      const username = generateUsername();
      const password = generatePassword();
      const { id: userId } = await createUserByAdmin({ username, password });

      const client = await initExperienceClient({
        interactionEvent: InteractionEvent.SignIn,
      });
      const email = generateEmail();

      const { verificationId: passwordVerificationId } = await client.verifyPassword({
        identifier: { type: SignInIdentifier.Username, value: username },
        password,
      });

      await client.identifyUser({ verificationId: passwordVerificationId });

      const { verificationId } = await client.sendVerificationCode({
        interactionEvent: InteractionEvent.SignIn,
        identifier: { type: SignInIdentifier.Email, value: email },
      });

      const emailMessage = await readConnectorMessage('Email');
      expect(emailMessage.type).toBe(TemplateType.SignIn);

      const { verificationId: verifiedEmailId } = await client.verifyVerificationCode({
        identifier: { type: SignInIdentifier.Email, value: email },
        verificationId,
        code: emailMessage.code,
      });

      await client.updateProfile({ type: SignInIdentifier.Email, verificationId: verifiedEmailId });

      const { redirectTo } = await client.submitInteraction();
      const signedInUserId = await processSession(client, redirectTo);
      expect(signedInUserId).toBe(userId);

      await logoutClient(client);
      await deleteUser(userId);
    });

    it('switches to BindMfa template when email is not part of sign-up identifiers', async () => {
      await updateSignInExperience({
        signUp: {
          identifiers: [SignInIdentifier.Username],
          password: true,
          verify: false,
        },
        signIn: {
          methods: [usernamePasswordMethod],
        },
        forgotPasswordMethods: [],
      });

      const client = await initExperienceClient({
        interactionEvent: InteractionEvent.Register,
      });
      const username = generateUsername();
      const password = generatePassword();
      const email = generateEmail();

      await client.updateProfile({ type: SignInIdentifier.Username, value: username });
      await client.updateProfile({ type: 'password', value: password });

      await client.identifyUser();

      const { verificationId } = await client.sendVerificationCode({
        interactionEvent: InteractionEvent.Register,
        identifier: { type: SignInIdentifier.Email, value: email },
      });

      const emailMessage = await readConnectorMessage('Email');
      expect(emailMessage.type).toBe(TemplateType.BindMfa);

      const { verificationId: verifiedEmailId } = await client.verifyVerificationCode({
        identifier: { type: SignInIdentifier.Email, value: email },
        verificationId,
        code: emailMessage.code,
      });

      await client.updateProfile({ type: SignInIdentifier.Email, verificationId: verifiedEmailId });

      const { redirectTo } = await client.submitInteraction();
      const userId = await processSession(client, redirectTo);
      await logoutClient(client);
      await deleteUser(userId);
    });
  });
});
