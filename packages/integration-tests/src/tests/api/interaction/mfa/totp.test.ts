import { InteractionEvent, MfaFactor, SignInIdentifier } from '@logto/schemas';
import { authenticator } from 'otplib';

import { putInteraction, deleteUser, initTotp, putInteractionBindMfa } from '#src/api/index.js';
import { initClient, processSession, logoutClient } from '#src/helpers/client.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  enableAllPasswordSignInMethods,
  enableMandatoryMfaWithTotp,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUser, generateNewUserProfile } from '#src/helpers/user.js';

describe('register with mfa (mandatory TOTP)', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods({
      identifiers: [SignInIdentifier.Username],
      password: true,
      verify: false,
    });
    await enableMandatoryMfaWithTotp();
  });

  it('should fail with missing_mfa error for normal register', async () => {
    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const client = await initClient();

    await client.send(putInteraction, {
      event: InteractionEvent.Register,
      profile: {
        username,
        password,
      },
    });

    await expectRejects(client.submitInteraction(), {
      code: 'user.missing_mfa',
      statusCode: 422,
    });
  });

  it('should fail with wrong totp code', async () => {
    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const client = await initClient();

    await client.send(putInteraction, {
      event: InteractionEvent.Register,
      profile: {
        username,
        password,
      },
    });

    await client.send(initTotp);
    await expectRejects(
      client.send(putInteractionBindMfa, {
        type: MfaFactor.TOTP,
        code: '123456',
      }),
      {
        code: 'session.mfa.invalid_totp_code',
        statusCode: 400,
      }
    );
  });

  it('should register and setup TOTP successfully', async () => {
    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const client = await initClient();

    await client.send(putInteraction, {
      event: InteractionEvent.Register,
      profile: {
        username,
        password,
      },
    });

    const { secret } = await client.send(initTotp);
    const code = authenticator.generate(secret);

    await client.send(putInteractionBindMfa, {
      type: MfaFactor.TOTP,
      code,
    });

    const { redirectTo } = await client.submitInteraction();

    const id = await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(id);
  });
});

describe('sign in and fulfill mfa (mandatory TOTP)', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods({
      identifiers: [SignInIdentifier.Username],
      password: true,
      verify: false,
    });
    await enableMandatoryMfaWithTotp();
  });

  it('should fail with missing_mfa error for normal sign in', async () => {
    const { userProfile, user } = await generateNewUser({ username: true, password: true });
    const client = await initClient();

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: {
        username: userProfile.username,
        password: userProfile.password,
      },
    });

    await expectRejects(client.submitInteraction(), {
      code: 'user.missing_mfa',
      statusCode: 422,
    });

    await deleteUser(user.id);
  });

  it('should sign in and fulfill totp', async () => {
    const { userProfile, user } = await generateNewUser({ username: true, password: true });
    const client = await initClient();

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: {
        username: userProfile.username,
        password: userProfile.password,
      },
    });

    const { secret } = await client.send(initTotp);
    const code = authenticator.generate(secret);

    await client.send(putInteractionBindMfa, {
      type: MfaFactor.TOTP,
      code,
    });

    const { redirectTo } = await client.submitInteraction();

    await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(user.id);
  });
});
