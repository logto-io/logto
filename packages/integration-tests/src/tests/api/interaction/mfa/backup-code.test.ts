import { InteractionEvent, MfaFactor, SignInIdentifier } from '@logto/schemas';
import { assert } from '@silverhand/essentials';
import { authenticator } from 'otplib';

import {
  putInteraction,
  deleteUser,
  initTotp,
  postInteractionBindMfa,
  putInteractionMfa,
} from '#src/api/index.js';
import { initClient, processSession, logoutClient } from '#src/helpers/client.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  enableAllPasswordSignInMethods,
  enableMandatoryMfaWithTotpAndBackupCode,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile } from '#src/helpers/user.js';

const registerWithMfa = async () => {
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

  await client.send(postInteractionBindMfa, {
    type: MfaFactor.TOTP,
    code,
  });

  const { codes } = await expectRejects<{ codes: string[] }>(client.submitInteraction(), {
    code: 'session.mfa.backup_code_required',
    status: 400,
  });

  await client.send(postInteractionBindMfa, {
    type: MfaFactor.BackupCode,
  });

  const { redirectTo } = await client.submitInteraction();

  const id = await processSession(client, redirectTo);
  await logoutClient(client);

  const backupCode = codes[0];
  assert(backupCode, new Error('can not find backup code'));

  return { id, username, password, backupCode };
};

describe('sign in and verify mfa (Backup Code)', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods({
      identifiers: [SignInIdentifier.Username],
      password: true,
      verify: false,
    });
    await enableMandatoryMfaWithTotpAndBackupCode();
  });

  it('should fail with missing_mfa error for normal sign in', async () => {
    const { id, username, password } = await registerWithMfa();
    const client = await initClient();

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: {
        username,
        password,
      },
    });

    await expectRejects(client.submitInteraction(), {
      code: 'session.mfa.require_mfa_verification',
      status: 403,
    });

    await deleteUser(id);
  });

  it('should sign in successfully', async () => {
    const { id, username, password, backupCode } = await registerWithMfa();
    const client = await initClient();

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: {
        username,
        password,
      },
    });

    await client.successSend(putInteractionMfa, {
      type: MfaFactor.BackupCode,
      code: backupCode,
    });

    await client.submitInteraction();

    await deleteUser(id);
  });
});
