import { InteractionEvent, SignInIdentifier, SignInMode } from '@logto/schemas';

import { deleteUser, updateSignInExperience } from '#src/api/index.js';
import { createOneTimeToken } from '#src/api/one-time-token.js';
import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import { setEmailConnector } from '#src/helpers/connector.js';
import { expectRejects } from '#src/helpers/index.js';
import { generateNewUser } from '#src/helpers/user.js';
import { generatePassword, devFeatureTest } from '#src/utils.js';

const { it, describe } = devFeatureTest;

describe('Register interaction with one-time token happy path', () => {
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
    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.Register,
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

    await client.identifyUser({ verificationId });

    const { redirectTo } = await client.submitInteraction();
    const userId = await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(userId);
  });

  it('should fail to sign-up with existing email and be able to sign-in instead', async () => {
    const { userProfile, user } = await generateNewUser({
      primaryEmail: true,
      password: true,
    });

    const oneTimeToken = await createOneTimeToken({
      email: userProfile.primaryEmail,
    });

    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.Register,
    });

    const { verificationId } = await client.verifyOneTimeToken({
      token: oneTimeToken.token,
      identifier: {
        type: SignInIdentifier.Email,
        value: userProfile.primaryEmail,
      },
    });

    await expectRejects(
      client.identifyUser({
        verificationId,
      }),
      {
        code: 'user.email_already_in_use',
        status: 422,
      }
    );

    await client.updateInteractionEvent({ interactionEvent: InteractionEvent.SignIn });
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

    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.Register,
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

    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.Register,
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

    await client.identifyUser({ verificationId });

    const { redirectTo } = await client.submitInteraction();
    const userId = await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(userId);
  });
});
