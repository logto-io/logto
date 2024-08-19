import { InteractionEvent, SignInIdentifier } from '@logto/schemas';

import { initExperienceClient } from '#src/helpers/client.js';
import { expectRejects } from '#src/helpers/index.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';

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
    const client = await initExperienceClient(InteractionEvent.ForgotPassword);

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
