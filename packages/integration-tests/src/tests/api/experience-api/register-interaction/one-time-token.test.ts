import { InteractionEvent, SignInIdentifier, SignInMode } from '@logto/schemas';

import { deleteUser, updateSignInExperience } from '#src/api/index.js';
import { createOneTimeToken } from '#src/api/one-time-token.js';
import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import { setEmailConnector } from '#src/helpers/connector.js';
import { expectRejects } from '#src/helpers/index.js';
import { generateNewUser } from '#src/helpers/user.js';
import { generateUsername, generatePassword } from '#src/utils.js';

describe('Register interaction with one-time token', () => {
  beforeAll(async () => {
    await setEmailConnector();
    await updateSignInExperience({
      signInMode: SignInMode.SignInAndRegister,
      signUp: {
        identifiers: [SignInIdentifier.Email],
        password: false,
        verify: true,
      },
      signIn: {
        methods: [
          {
            identifier: SignInIdentifier.Username,
            password: true,
            verificationCode: false,
            isPasswordPrimary: true,
          },
          {
            identifier: SignInIdentifier.Email,
            password: true,
            verificationCode: true,
            isPasswordPrimary: false,
          },
        ],
      },
    });
  });

  it('should successfully register a new user with a magic link containing a one-time token', async () => {
    // New flow: try SignIn first, then switch to Register on user.user_not_exist
    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.SignIn,
    });

    const oneTimeToken = await createOneTimeToken({
      email: 'foo@logto.io',
    });

    const { verificationId } = await client.verifyOneTimeToken({
      token: oneTimeToken.token,
      identifier: {
        type: SignInIdentifier.Email,
        value: 'foo@logto.io',
      },
    });

    // First identify on SignIn should fail for new user
    await expectRejects(client.identifyUser({ verificationId }), {
      code: 'user.user_not_exist',
      status: 404,
    });

    // Switch to Register then continue
    await client.updateInteractionEvent({ interactionEvent: InteractionEvent.Register });
    await client.identifyUser({ verificationId });

    const { redirectTo } = await client.submitInteraction();
    const userId = await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(userId);
  });

  it('should sign-in directly when email already exists (no need to switch after verify)', async () => {
    const { userProfile, user } = await generateNewUser({
      primaryEmail: true,
      password: true,
    });

    const oneTimeToken = await createOneTimeToken({
      email: userProfile.primaryEmail,
    });

    // New flow starts with SignIn
    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.SignIn,
    });

    const { verificationId } = await client.verifyOneTimeToken({
      token: oneTimeToken.token,
      identifier: {
        type: SignInIdentifier.Email,
        value: userProfile.primaryEmail,
      },
    });

    // Existing user: identify on SignIn should succeed directly
    await client.identifyUser({ verificationId });

    const { redirectTo } = await client.submitInteraction();
    await processSession(client, redirectTo);
    await logoutClient(client);

    await deleteUser(user.id);
  });

  it('should prompt user to fulfill password if required upon registration', async () => {
    await updateSignInExperience({
      signUp: {
        identifiers: [SignInIdentifier.Email],
        password: true,
        verify: true,
      },
    });

    // Start with SignIn first per new flow
    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.SignIn,
    });

    const oneTimeToken = await createOneTimeToken({
      email: 'bar@logto.io',
    });

    const { verificationId } = await client.verifyOneTimeToken({
      token: oneTimeToken.token,
      identifier: {
        type: SignInIdentifier.Email,
        value: 'bar@logto.io',
      },
    });

    // First identify on SignIn should fail with user not exist
    await expectRejects(client.identifyUser({ verificationId }), {
      code: 'user.user_not_exist',
      status: 404,
    });

    // Switch to Register; now missing profile (password) is required
    await client.updateInteractionEvent({ interactionEvent: InteractionEvent.Register });
    await expectRejects(client.identifyUser({ verificationId }), {
      code: 'user.missing_profile',
      status: 422,
    });

    const password = generatePassword();

    await client.updateProfile({ type: 'password', value: password });

    await client.identifyUser({ verificationId });

    const { redirectTo } = await client.submitInteraction();
    const userId = await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(userId);
  });

  it('should allow user registration through one-time token even if the registration is turned off', async () => {
    // Turn off registration by setting sign-in mode to "SignIn"
    await updateSignInExperience({
      signInMode: SignInMode.SignIn,
      signUp: {
        identifiers: [SignInIdentifier.Email],
        password: false,
        verify: true,
      },
    });

    // Start with SignIn per new flow
    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.SignIn,
    });

    const oneTimeToken = await createOneTimeToken({
      email: 'foo@logto.io',
    });

    const { verificationId } = await client.verifyOneTimeToken({
      token: oneTimeToken.token,
      identifier: {
        type: SignInIdentifier.Email,
        value: 'foo@logto.io',
      },
    });
    // SignIn identify should fail then switch to Register
    await expectRejects(client.identifyUser({ verificationId }), {
      code: 'user.user_not_exist',
      status: 404,
    });
    await client.updateInteractionEvent({ interactionEvent: InteractionEvent.Register });
    await client.identifyUser({ verificationId });

    const { redirectTo } = await client.submitInteraction();
    const userId = await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(userId);
  });

  it('should allow user one-time token registration even if the sign-in identifier does NOT support email', async () => {
    await updateSignInExperience({
      signInMode: SignInMode.SignIn,
      signUp: {
        identifiers: [SignInIdentifier.Username],
        password: true,
        verify: false,
      },
      signIn: {
        methods: [
          {
            identifier: SignInIdentifier.Username,
            password: true,
            verificationCode: false,
            isPasswordPrimary: true,
          },
        ],
      },
    });

    // Start with SignIn per new flow
    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.SignIn,
    });

    const oneTimeToken = await createOneTimeToken({
      email: 'foo@logto.io',
    });

    const { verificationId } = await client.verifyOneTimeToken({
      token: oneTimeToken.token,
      identifier: {
        type: SignInIdentifier.Email,
        value: 'foo@logto.io',
      },
    });
    // SignIn identify should fail then switch to Register and fulfill required profile
    await expectRejects(client.identifyUser({ verificationId }), {
      code: 'user.user_not_exist',
      status: 404,
    });
    await client.updateInteractionEvent({ interactionEvent: InteractionEvent.Register });
    await client.updateProfile({ type: SignInIdentifier.Username, value: generateUsername() });
    await client.updateProfile({ type: 'password', value: generatePassword() });
    await client.identifyUser({ verificationId });

    const { redirectTo } = await client.submitInteraction();
    const userId = await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(userId);
  });
});
