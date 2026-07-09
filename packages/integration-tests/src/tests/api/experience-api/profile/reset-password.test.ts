import {
  ConnectorType,
  ExtraParamsKey,
  FirstScreen,
  ForgotPasswordMethod,
  InteractionEvent,
  OneTimeTokenStatus,
  SignInIdentifier,
} from '@logto/schemas';

import {
  createOneTimeToken,
  deleteOneTimeTokenById,
  getOneTimeTokenById,
  updateOneTimeTokenStatus,
} from '#src/api/one-time-token.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { ExperienceClient } from '#src/client/experience/index.js';
import { demoAppRedirectUri } from '#src/constants.js';
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
import { generateEmail, generatePassword, waitFor } from '#src/utils.js';

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

const startResetMagicLinkAuthorization = async (
  client: ExperienceClient,
  token: string,
  loginHint?: string
) => {
  const response = await client.startAuthorization(demoAppRedirectUri, {
    extraParams: {
      [ExtraParamsKey.FirstScreen]: FirstScreen.ResetPassword,
      [ExtraParamsKey.OneTimeToken]: token,
      ...(loginHint ? { [ExtraParamsKey.LoginHint]: loginHint } : {}),
    },
  });

  expect([302, 303]).toContain(response.status);
  client.mergeRawCookies(response.headers.getSetCookie());

  const location = response.headers.get('location');
  expect(location).toBeTruthy();

  if (!location) {
    throw new Error('Missing reset magic link redirect location');
  }

  const url = new URL(location, 'http://localhost');

  expect(url.pathname).toBe('/reset-password');
  expect(url.searchParams.get(ExtraParamsKey.OneTimeToken)).toBe(token);
  expect(url.searchParams.get(ExtraParamsKey.LoginHint)).toBe(loginHint ?? null);
};

const identifyForgotPasswordInteractionWithOneTimeToken = async (
  client: ExperienceClient,
  email: string,
  token: string
) => {
  await client.initInteraction({ interactionEvent: InteractionEvent.ForgotPassword });

  const { verificationId } = await client.verifyOneTimeToken({
    token,
    identifier: { type: SignInIdentifier.Email, value: email },
  });

  await client.identifyUser({ verificationId });
};

const expectOneTimeTokenForgotPasswordRejected = async (
  token: string,
  email: string,
  expectedError: { code: string; status: number }
) => {
  const client = await initExperienceClient({
    interactionEvent: InteractionEvent.ForgotPassword,
  });

  await expectRejects(
    client.verifyOneTimeToken({
      token,
      identifier: { type: SignInIdentifier.Email, value: email },
    }),
    expectedError
  );

  await expectRejects(client.resetPassword({ password: generatePassword() }), {
    status: 404,
    code: 'session.identifier_not_found',
  });
};

describe('Reset Password', () => {
  const userApi = new UserApiTest();

  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email]);
    await setEmailConnector();
    await enableAllPasswordSignInMethods();
    await updateSignInExperience({
      forgotPasswordMethods: [ForgotPasswordMethod.EmailVerificationCode],
    });
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
    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.ForgotPassword,
    });

    await expectRejects(client.resetPassword({ password: 'password' }), {
      status: 404,
      code: 'session.identifier_not_found',
    });
  });

  it('should throw 422 if identify the user using VerificationType other than CodeVerification', async () => {
    const { username, password } = generateNewUserProfile({ username: true, password: true });
    await userApi.create({ username, password });
    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.ForgotPassword,
    });

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
    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.ForgotPassword,
    });

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

    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.ForgotPassword,
    });

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

    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.ForgotPassword,
    });

    await identifyForgotPasswordInteraction(client, primaryEmail);

    await client.resetPassword({ password: newPassword });

    await client.submitInteraction();

    await signInWithPassword({
      identifier: { type: SignInIdentifier.Email, value: primaryEmail },
      password: newPassword,
    });
  });

  it('should reset password with an admin-issued magic link containing login_hint', async () => {
    const { primaryEmail, password } = generateNewUserProfile({
      primaryEmail: true,
      password: true,
    });
    await userApi.create({ primaryEmail, password });

    const newPassword = generatePassword();
    const client = new ExperienceClient();
    const oneTimeToken = await createOneTimeToken({
      email: primaryEmail,
      context: {
        interactionEvent: InteractionEvent.ForgotPassword,
      },
    });

    try {
      await startResetMagicLinkAuthorization(client, oneTimeToken.token, primaryEmail);
      await identifyForgotPasswordInteractionWithOneTimeToken(
        client,
        primaryEmail,
        oneTimeToken.token
      );

      await client.resetPassword({ password: newPassword });
      await client.submitInteraction();

      await expect(getOneTimeTokenById(oneTimeToken.id)).resolves.toMatchObject({
        status: OneTimeTokenStatus.Consumed,
      });
      await signInWithPassword({
        identifier: { type: SignInIdentifier.Email, value: primaryEmail },
        password: newPassword,
      });
    } finally {
      await deleteOneTimeTokenById(oneTimeToken.id);
    }
  });

  it('should reset password with an admin-issued magic link after the user enters email', async () => {
    const { primaryEmail, password } = generateNewUserProfile({
      primaryEmail: true,
      password: true,
    });
    await userApi.create({ primaryEmail, password });

    const newPassword = generatePassword();
    const client = new ExperienceClient();
    const oneTimeToken = await createOneTimeToken({
      email: primaryEmail,
      context: {
        interactionEvent: InteractionEvent.ForgotPassword,
      },
    });

    try {
      await startResetMagicLinkAuthorization(client, oneTimeToken.token);
      await identifyForgotPasswordInteractionWithOneTimeToken(
        client,
        primaryEmail,
        oneTimeToken.token
      );

      await client.resetPassword({ password: newPassword });
      await client.submitInteraction();

      await expect(getOneTimeTokenById(oneTimeToken.id)).resolves.toMatchObject({
        status: OneTimeTokenStatus.Consumed,
      });
      await signInWithPassword({
        identifier: { type: SignInIdentifier.Email, value: primaryEmail },
        password: newPassword,
      });
    } finally {
      await deleteOneTimeTokenById(oneTimeToken.id);
    }
  });

  it('should not consume the one-time token or identify the forgot-password interaction if email mismatches', async () => {
    const email = generateEmail();
    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.ForgotPassword,
    });
    const oneTimeToken = await createOneTimeToken({ email });

    try {
      await expectRejects(
        client.verifyOneTimeToken({
          token: oneTimeToken.token,
          identifier: { type: SignInIdentifier.Email, value: generateEmail() },
        }),
        {
          status: 400,
          code: 'one_time_token.email_mismatch',
        }
      );

      await expect(getOneTimeTokenById(oneTimeToken.id)).resolves.toMatchObject({
        status: OneTimeTokenStatus.Active,
      });

      const interactionData = await client.getInteractionData();

      expect(interactionData.interactionEvent).toBe(InteractionEvent.ForgotPassword);
      expect(interactionData.userId).toBeUndefined();
      await expectRejects(client.resetPassword({ password: generatePassword() }), {
        status: 404,
        code: 'session.identifier_not_found',
      });
    } finally {
      await deleteOneTimeTokenById(oneTimeToken.id);
    }
  });

  it('should not consume the one-time token or identify the user if the token scope mismatches', async () => {
    const email = generateEmail();
    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.ForgotPassword,
    });
    const oneTimeToken = await createOneTimeToken({
      email,
      context: {
        interactionEvent: InteractionEvent.SignIn,
      },
    });

    try {
      await expectRejects(
        client.verifyOneTimeToken({
          token: oneTimeToken.token,
          identifier: { type: SignInIdentifier.Email, value: email },
        }),
        {
          status: 400,
          code: 'one_time_token.interaction_event_mismatch',
        }
      );

      await expect(getOneTimeTokenById(oneTimeToken.id)).resolves.toMatchObject({
        status: OneTimeTokenStatus.Active,
      });

      const interactionData = await client.getInteractionData();

      expect(interactionData.interactionEvent).toBe(InteractionEvent.ForgotPassword);
      expect(interactionData.userId).toBeUndefined();
      await expectRejects(client.resetPassword({ password: generatePassword() }), {
        status: 404,
        code: 'session.identifier_not_found',
      });
    } finally {
      await deleteOneTimeTokenById(oneTimeToken.id);
    }
  });

  it('should reject forgot-password one-time-token verification with invalid token', async () => {
    await expectOneTimeTokenForgotPasswordRejected('invalid_token', generateEmail(), {
      status: 404,
      code: 'one_time_token.token_not_found',
    });
  });

  it('should reject forgot-password one-time-token verification with expired token', async () => {
    const email = generateEmail();
    const oneTimeToken = await createOneTimeToken({
      email,
      expiresIn: 1,
    });

    try {
      await waitFor(1001);

      await expectOneTimeTokenForgotPasswordRejected(oneTimeToken.token, email, {
        status: 400,
        code: 'one_time_token.token_expired',
      });
    } finally {
      await deleteOneTimeTokenById(oneTimeToken.id);
    }
  });

  it('should reject forgot-password one-time-token verification with consumed token', async () => {
    const email = generateEmail();
    const oneTimeToken = await createOneTimeToken({ email });
    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.ForgotPassword,
    });

    try {
      await client.verifyOneTimeToken({
        token: oneTimeToken.token,
        identifier: { type: SignInIdentifier.Email, value: email },
      });

      await expectOneTimeTokenForgotPasswordRejected(oneTimeToken.token, email, {
        status: 400,
        code: 'one_time_token.token_consumed',
      });
    } finally {
      await deleteOneTimeTokenById(oneTimeToken.id);
    }
  });

  it('should reject forgot-password one-time-token verification with revoked token', async () => {
    const email = generateEmail();
    const oneTimeToken = await createOneTimeToken({ email });

    try {
      await updateOneTimeTokenStatus(oneTimeToken.id, OneTimeTokenStatus.Revoked);

      await expectOneTimeTokenForgotPasswordRejected(oneTimeToken.token, email, {
        status: 400,
        code: 'one_time_token.token_revoked',
      });
    } finally {
      await deleteOneTimeTokenById(oneTimeToken.id);
    }
  });
});
