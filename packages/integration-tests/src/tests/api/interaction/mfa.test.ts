import { InteractionEvent, MfaFactor, MfaPolicy } from '@logto/schemas';
import { assert } from '@silverhand/essentials';
import { authenticator } from 'otplib';

import api from '#src/api/api.js';
import type { RedirectResponse } from '#src/api/interaction.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import type MockClient from '#src/client/index.js';
import { initClient, logoutClient, processSession } from '#src/helpers/client.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  enableAllPasswordSignInMethods,
  resetMfaSettings,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';

const startLegacyPasswordSignIn = async (username: string, password: string) => {
  const client = await initClient();
  const response = await api.put('interaction', {
    headers: { cookie: client.interactionCookie },
    json: {
      event: InteractionEvent.SignIn,
      identifier: { username, password },
    },
  });
  client.mergeRawCookies(response.headers.getSetCookie());

  return client;
};

const submitLegacyInteraction = async (client: MockClient) => {
  const response = await api.post('interaction/submit', {
    headers: { cookie: client.interactionCookie },
  });
  client.mergeRawCookies(response.headers.getSetCookie());

  return response.json<RedirectResponse>();
};

const completeLegacySignIn = async (client: MockClient, expectedUserId: string) => {
  const { redirectTo } = await submitLegacyInteraction(client);
  const signedInUserId = await processSession(client, redirectTo);
  expect(signedInUserId).toBe(expectedUserId);
  await logoutClient(client);
};

describe('legacy interaction MFA smoke test', () => {
  const userApi = new UserApiTest();

  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await updateSignInExperience({
      mfa: {
        factors: [MfaFactor.TOTP, MfaFactor.BackupCode],
        policy: MfaPolicy.PromptAtSignInAndSignUp,
      },
    });
  });

  afterAll(async () => {
    await resetMfaSettings();
    await userApi.cleanUp();
  });

  it('should skip MFA binding under an optional policy and not prompt on the next sign-in', async () => {
    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const user = await userApi.create({ username, password });

    const skipClient = await startLegacyPasswordSignIn(username, password);

    await expectRejects<{ skippable?: boolean }>(submitLegacyInteraction(skipClient), {
      code: 'user.missing_mfa',
      status: 422,
      expectData: (data) => {
        expect(data.skippable).toBe(true);
      },
    });

    await api.put('interaction/mfa-skipped', {
      headers: { cookie: skipClient.interactionCookie },
      json: { mfaSkipped: true },
    });

    await completeLegacySignIn(skipClient, user.id);

    const nextClient = await startLegacyPasswordSignIn(username, password);
    await completeLegacySignIn(nextClient, user.id);
  });

  it('should bind TOTP and backup codes, then sign in with TOTP and a backup code', async () => {
    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const user = await userApi.create({ username, password });

    const bindClient = await startLegacyPasswordSignIn(username, password);

    await expectRejects(submitLegacyInteraction(bindClient), {
      code: 'user.missing_mfa',
      status: 422,
    });

    const { secret, secretQrCode } = await api
      .post('interaction/verification/totp', {
        headers: { cookie: bindClient.interactionCookie },
      })
      .json<{ secret: string; secretQrCode: string }>();

    expect(secret).toBeTruthy();
    expect(secretQrCode).toBeTruthy();

    await api.post('interaction/bind-mfa', {
      headers: { cookie: bindClient.interactionCookie },
      json: {
        type: MfaFactor.TOTP,
        code: authenticator.generate(secret),
      },
    });

    const { codes: backupCodes } = await expectRejects<{ codes: string[] }>(
      submitLegacyInteraction(bindClient),
      {
        code: 'session.mfa.backup_code_required',
        status: 400,
        expectData: (data) => {
          expect(data.codes.length).toBeGreaterThan(0);
        },
      }
    );

    await api.post('interaction/bind-mfa', {
      headers: { cookie: bindClient.interactionCookie },
      json: {
        type: MfaFactor.BackupCode,
      },
    });

    await completeLegacySignIn(bindClient, user.id);

    const totpClient = await startLegacyPasswordSignIn(username, password);

    await expectRejects<{ availableFactors: MfaFactor[] }>(submitLegacyInteraction(totpClient), {
      code: 'session.mfa.require_mfa_verification',
      status: 403,
      expectData: (data) => {
        expect(data.availableFactors).toEqual([MfaFactor.TOTP, MfaFactor.BackupCode]);
      },
    });

    await api.put('interaction/mfa', {
      headers: { cookie: totpClient.interactionCookie },
      json: {
        type: MfaFactor.TOTP,
        code: authenticator.generate(secret),
      },
    });

    await completeLegacySignIn(totpClient, user.id);

    const backupCodeClient = await startLegacyPasswordSignIn(username, password);

    await expectRejects<{ availableFactors: MfaFactor[] }>(
      submitLegacyInteraction(backupCodeClient),
      {
        code: 'session.mfa.require_mfa_verification',
        status: 403,
      }
    );

    const backupCode = backupCodes[0];
    assert(backupCode, new Error('Missing generated backup code'));

    await api.put('interaction/mfa', {
      headers: { cookie: backupCodeClient.interactionCookie },
      json: {
        type: MfaFactor.BackupCode,
        code: backupCode,
      },
    });

    await completeLegacySignIn(backupCodeClient, user.id);
  });
});
