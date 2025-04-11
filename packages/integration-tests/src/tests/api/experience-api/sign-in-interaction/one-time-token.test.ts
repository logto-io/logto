import { InteractionEvent, OneTimeTokenStatus, SignInIdentifier, SignInMode } from '@logto/schemas';

import { deleteUser } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/index.js';
import {
  createOneTimeToken,
  updateOneTimeTokenStatus,
  deleteOneTimeTokenById,
} from '#src/api/one-time-token.js';
import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import { expectRejects } from '#src/helpers/index.js';
import { generateNewUser } from '#src/helpers/user.js';
import { devFeatureTest, waitFor } from '#src/utils.js';

const { it, describe } = devFeatureTest;

describe('Sign-in interaction with one-time token', async () => {
  const { user, userProfile } = await generateNewUser({ primaryEmail: true, password: true });

  it('should successfully sign-in with a one-time token', async () => {
    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.SignIn,
    });

    const oneTimeToken = await createOneTimeToken({
      email: userProfile.primaryEmail,
    });

    const { verificationId } = await client.verifyOneTimeToken({
      token: oneTimeToken.token,
      identifier: { type: SignInIdentifier.Email, value: userProfile.primaryEmail },
    });

    await client.identifyUser({ verificationId });
    const { redirectTo } = await client.submitInteraction();
    const userId = await processSession(client, redirectTo);

    expect(userId).toBe(user.id);

    await logoutClient(client);
    void deleteOneTimeTokenById(oneTimeToken.id);
  });

  it('should fail to sign-in with an invalid one-time token', async () => {
    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.SignIn,
    });

    await expectRejects(
      client.verifyOneTimeToken({
        token: 'invalid_token',
        identifier: { type: SignInIdentifier.Email, value: userProfile.primaryEmail },
      }),
      {
        code: 'one_time_token.token_not_found',
        status: 404,
      }
    );
  });

  it('should fail to sign-in with an expired one-time token', async () => {
    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.SignIn,
    });

    const oneTimeToken = await createOneTimeToken({
      email: userProfile.primaryEmail,
      expiresIn: 1,
    });

    await waitFor(1001);

    await expectRejects(
      client.verifyOneTimeToken({
        token: oneTimeToken.token,
        identifier: { type: SignInIdentifier.Email, value: userProfile.primaryEmail },
      }),
      {
        code: 'one_time_token.token_expired',
        status: 400,
      }
    );

    void deleteOneTimeTokenById(oneTimeToken.id);
  });

  it('should fail to sign-in with a consumed one-time token', async () => {
    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.SignIn,
    });

    const oneTimeToken = await createOneTimeToken({
      email: userProfile.primaryEmail,
    });

    await client.verifyOneTimeToken({
      token: oneTimeToken.token,
      identifier: { type: SignInIdentifier.Email, value: userProfile.primaryEmail },
    });

    await expectRejects(
      client.verifyOneTimeToken({
        token: oneTimeToken.token,
        identifier: { type: SignInIdentifier.Email, value: userProfile.primaryEmail },
      }),
      {
        code: 'one_time_token.token_consumed',
        status: 400,
      }
    );

    void deleteOneTimeTokenById(oneTimeToken.id);
  });

  it('should fail to sign-in with a revoked one-time token', async () => {
    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.SignIn,
    });

    const oneTimeToken = await createOneTimeToken({
      email: userProfile.primaryEmail,
    });

    await updateOneTimeTokenStatus(oneTimeToken.token, OneTimeTokenStatus.Revoked);

    await expectRejects(
      client.verifyOneTimeToken({
        token: oneTimeToken.token,
        identifier: { type: SignInIdentifier.Email, value: userProfile.primaryEmail },
      }),
      {
        code: 'one_time_token.token_revoked',
        status: 400,
      }
    );

    void deleteOneTimeTokenById(oneTimeToken.id);
  });

  it('should sign-in the user even if the sign-in method does not support email', async () => {
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

    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.SignIn,
    });

    const oneTimeToken = await createOneTimeToken({
      email: userProfile.primaryEmail,
    });

    const { verificationId } = await client.verifyOneTimeToken({
      token: oneTimeToken.token,
      identifier: { type: SignInIdentifier.Email, value: userProfile.primaryEmail },
    });

    await client.identifyUser({ verificationId });

    const { redirectTo } = await client.submitInteraction();
    const userId = await processSession(client, redirectTo);

    expect(userId).toBe(user.id);

    await logoutClient(client);
    void deleteUser(userId);
    void deleteOneTimeTokenById(oneTimeToken.id);
  });
});
