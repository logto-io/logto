import { InteractionEvent, SignInMode } from '@logto/schemas';

import { suspendUser } from '#src/api/admin-user.js';
import { putInteraction } from '#src/api/interaction.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { initClient } from '#src/helpers/client.js';
import { clearSsoConnectors } from '#src/helpers/connector.js';
import { expectRejects } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUser } from '#src/helpers/user.js';
import { generateName, generatePassword } from '#src/utils.js';

describe('Sign-in flow sad path using password identifiers', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
  });

  afterAll(async () => {
    await clearSsoConnectors();
  });

  it('Should fail to sign-in with password if sign-in mode is register only', async () => {
    await updateSignInExperience({ signInMode: SignInMode.Register });
    const client = await initClient();

    // Username & password
    const {
      userProfile: { username, password: password1 },
    } = await generateNewUser({ username: true, password: true });

    await expectRejects(
      client.send(putInteraction, {
        event: InteractionEvent.SignIn,
        identifier: { username, password: password1 },
      }),
      {
        code: 'auth.forbidden',
        status: 403,
      }
    );

    // Email & password
    const {
      userProfile: { primaryEmail, password: password2 },
    } = await generateNewUser({ primaryEmail: true, password: true });

    await expectRejects(
      client.send(putInteraction, {
        event: InteractionEvent.SignIn,
        identifier: { email: primaryEmail, password: password2 },
      }),
      {
        code: 'auth.forbidden',
        status: 403,
      }
    );

    // Phone & password
    const {
      userProfile: { primaryPhone, password: password3 },
    } = await generateNewUser({ primaryPhone: true, password: true });

    await expectRejects(
      client.send(putInteraction, {
        event: InteractionEvent.SignIn,
        identifier: { phone: primaryPhone, password: password3 },
      }),
      {
        code: 'auth.forbidden',
        status: 403,
      }
    );

    // Reset
    await enableAllPasswordSignInMethods();
  });

  it('Should fail to sign-in with password if related identifiers are not enabled', async () => {
    await updateSignInExperience({ signIn: { methods: [] } });
    const client = await initClient();

    // Username & password
    const {
      userProfile: { username, password: password1 },
    } = await generateNewUser({ username: true, password: true });

    await expectRejects(
      client.send(putInteraction, {
        event: InteractionEvent.SignIn,
        identifier: { username, password: password1 },
      }),
      {
        code: 'user.sign_in_method_not_enabled',
        status: 422,
      }
    );

    // Email & password
    const {
      userProfile: { primaryEmail, password: password2 },
    } = await generateNewUser({ primaryEmail: true, password: true });

    await expectRejects(
      client.send(putInteraction, {
        event: InteractionEvent.SignIn,
        identifier: { email: primaryEmail, password: password2 },
      }),
      {
        code: 'user.sign_in_method_not_enabled',
        status: 422,
      }
    );

    // Phone & password
    const {
      userProfile: { primaryPhone, password: password3 },
    } = await generateNewUser({ primaryPhone: true, password: true });

    await expectRejects(
      client.send(putInteraction, {
        event: InteractionEvent.SignIn,
        identifier: { phone: primaryPhone, password: password3 },
      }),
      {
        code: 'user.sign_in_method_not_enabled',
        status: 422,
      }
    );

    // Reset
    await enableAllPasswordSignInMethods();
  });

  it('Should fail to sign-in with username and password if username is not existed', async () => {
    const client = await initClient();

    await expectRejects(
      client.send(putInteraction, {
        event: InteractionEvent.SignIn,
        identifier: { username: generateName(), password: generatePassword() },
      }),
      {
        code: 'session.invalid_credentials',
        status: 422,
      }
    );
  });

  it('Should fail to sign-in with username and password if user password is not correct', async () => {
    const {
      userProfile: { username },
    } = await generateNewUser({ username: true, password: true });
    const client = await initClient();

    await expectRejects(
      client.send(putInteraction, {
        event: InteractionEvent.SignIn,
        identifier: { username, password: generatePassword() },
      }),
      {
        code: 'session.invalid_credentials',
        status: 422,
      }
    );
  });

  it('Should fail to sign-in with username and password if user password is not set', async () => {
    const {
      userProfile: { username },
    } = await generateNewUser({ username: true, primaryEmail: true });
    const client = await initClient();

    await expectRejects(
      client.send(putInteraction, {
        event: InteractionEvent.SignIn,
        identifier: { username, password: generatePassword() },
      }),
      {
        code: 'session.invalid_credentials',
        status: 422,
      }
    );
  });

  it('Should fail to sign-in with username and password if the user is suspended', async () => {
    const {
      user,
      userProfile: { username, password },
    } = await generateNewUser({ username: true, password: true });

    await suspendUser(user.id, true);

    const client = await initClient();

    await expectRejects(
      client.send(putInteraction, {
        event: InteractionEvent.SignIn,
        identifier: { username, password },
      }),
      {
        code: 'user.suspended',
        status: 401,
      }
    );
  });
});
