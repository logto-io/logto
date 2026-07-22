import { UserScope } from '@logto/core-kit';
import { LogtoActionKey, MfaFactor, SignInIdentifier } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import { authenticator } from 'otplib';

import { createUserMfaVerification, deleteUser, getUser } from '#src/api/admin-user.js';
import { deleteAction, upsertAction } from '#src/api/logto-config.js';
import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import { identifyUserWithUsernamePassword } from '#src/helpers/experience/index.js';
import { successfullyVerifyTotp } from '#src/helpers/experience/totp-verification.js';
import { expectRejects, createUserByAdmin } from '#src/helpers/index.js';
import {
  enableAllPasswordSignInMethods,
  enableMandatoryMfaWithTotp,
  resetMfaSettings,
} from '#src/helpers/sign-in-experience.js';
import { devFeatureTest, generateName, generatePassword, generateUsername } from '#src/utils.js';

const p1Key = LogtoActionKey.PostFirstFactorVerification;
const p2Key = LogtoActionKey.PostSignIn;

devFeatureTest.describe('action: post sign-in composition', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods({
      identifiers: [SignInIdentifier.Username],
      password: true,
      verify: false,
    });
  });

  afterEach(async () => {
    await Promise.all([trySafe(deleteAction(p1Key)), trySafe(deleteAction(p2Key))]);
    await resetMfaSettings();
  });

  it('should run after MFA side effects, resynchronize a profile value, and complete before token issuance', async () => {
    await enableMandatoryMfaWithTotp();
    await upsertAction(p2Key, {
      script: `
        const runAction = ({ event }) => ({
          action: 'updateUser',
          user: {
            name: event.user.customData.displayName,
            customData: { p2MfaFactors: event.user.mfaVerificationFactors },
          },
        });
      `,
      enabled: true,
    });

    const username = generateUsername();
    const password = generatePassword();
    const displayName = generateName();
    const user = await createUserByAdmin({
      username,
      password,
      customData: { displayName },
    });
    const mfa = await createUserMfaVerification(user.id, MfaFactor.TOTP);

    if (mfa.type !== MfaFactor.TOTP) {
      throw new Error('unexpected mfa type');
    }

    const client = await initExperienceClient({ config: { scopes: [UserScope.Profile] } });
    await identifyUserWithUsernamePassword(client, username, password);

    await expectRejects(client.submitInteraction(), {
      code: 'session.mfa.require_mfa_verification',
      status: 403,
    });

    await successfullyVerifyTotp(client, { code: authenticator.generate(mfa.secret) });

    const { redirectTo } = await client.submitInteraction();
    const userId = await processSession(client, redirectTo);
    const { name: idTokenName } = await client.getIdTokenClaims();
    await logoutClient(client);

    expect(userId).toBe(user.id);
    // The P2-updated profile value is already reflected in the issued ID token.
    expect(idTokenName).toBe(displayName);

    const updated = await getUser(user.id);
    expect(updated.name).toBe(displayName);
    // The action observed the finalized user context, including the just-bound MFA factor.
    expect(updated.customData).toMatchObject({ displayName, p2MfaFactors: [MfaFactor.TOTP] });

    await deleteUser(user.id);
  });

  it('should merge custom data updates from P1 and P2 and expose P1 data to P2', async () => {
    await upsertAction(p1Key, {
      script: `
        const runAction = ({ event }) => {
          if (event.user) {
            return;
          }

          return {
            action: 'createUser',
            user: { customData: { legacyId: 'legacy-777', p1: true } },
            passwordVerified: true,
          };
        };
      `,
      enabled: true,
    });
    await upsertAction(p2Key, {
      script: `
        const runAction = ({ event }) => ({
          action: 'updateUser',
          user: {
            customData: { p2: true, p2SawLegacyId: event.user.customData.legacyId },
          },
        });
      `,
      enabled: true,
    });

    const username = generateUsername();
    const password = generatePassword();

    const client = await initExperienceClient();
    await identifyUserWithUsernamePassword(client, username, password);
    const { redirectTo } = await client.submitInteraction();
    const userId = await processSession(client, redirectTo);
    await logoutClient(client);

    const created = await getUser(userId);
    expect(created.customData).toMatchObject({
      legacyId: 'legacy-777',
      p1: true,
      p2: true,
      p2SawLegacyId: 'legacy-777',
    });

    await deleteUser(userId);
  });
});
