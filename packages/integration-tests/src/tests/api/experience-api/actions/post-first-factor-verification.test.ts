import {
  LogtoActionKey,
  MfaFactor,
  SignInIdentifier,
  UsersPasswordEncryptionMethod,
} from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import { authenticator } from 'otplib';

import {
  createUserMfaVerification,
  deleteUser,
  getUser,
  getUserMfaVerifications,
} from '#src/api/admin-user.js';
import { deleteAction, updateAction, upsertAction } from '#src/api/logto-config.js';
import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import { identifyUserWithUsernamePassword } from '#src/helpers/experience/index.js';
import {
  successfullyCreateAndVerifyTotp,
  successfullyVerifyTotp,
} from '#src/helpers/experience/totp-verification.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  enableAllPasswordSignInMethods,
  enableMandatoryMfaWithTotp,
  resetMfaSettings,
} from '#src/helpers/sign-in-experience.js';
import { UserApiTest } from '#src/helpers/user.js';
import { devFeatureTest, generatePassword, generateUsername } from '#src/utils.js';

const actionKey = LogtoActionKey.PostFirstFactorVerification;

/**
 * Accepts unknown identifiers (user not found locally) and provisions a new user with profile,
 * custom data, and the submitted password.
 */
const createUserScript = `
const runAction = ({ event }) => {
  if (event.user) {
    return;
  }

  return {
    action: 'createUser',
    user: {
      name: 'Migrated User',
      customData: { legacyId: 'legacy-001', migratedBy: 'p1-action' },
      profile: { nickname: 'legacy-nick', website: 'https://legacy.example.com' },
    },
    passwordVerified: true,
  };
};
`;

/**
 * Treats the submitted password as verified by the legacy system for existing users and
 * resynchronizes profile, custom data, and password.
 */
const updateUserScript = `
const runAction = ({ event }) => {
  if (!event.user) {
    return;
  }

  return {
    action: 'updateUser',
    user: {
      name: 'Synced From Legacy',
      customData: { legacySynced: true },
      profile: { nickname: 'legacy-synced-nick' },
    },
    passwordVerified: true,
  };
};
`;

devFeatureTest.describe('action: post first factor verification', () => {
  const userApi = new UserApiTest();

  beforeAll(async () => {
    await enableAllPasswordSignInMethods({
      identifiers: [SignInIdentifier.Username],
      password: true,
      verify: false,
    });
  });

  afterEach(async () => {
    await trySafe(deleteAction(actionKey));
    await userApi.cleanUp();
    await resetMfaSettings();
  });

  it('should create a user for an unknown identifier accepted by the action', async () => {
    await upsertAction(actionKey, { script: createUserScript, enabled: true });

    const username = generateUsername();
    const password = generatePassword();

    const client = await initExperienceClient();
    await identifyUserWithUsernamePassword(client, username, password);
    const { redirectTo } = await client.submitInteraction();
    const userId = await processSession(client, redirectTo);
    await logoutClient(client);

    const user = await getUser(userId);
    expect(user.username).toBe(username);
    expect(user.name).toBe('Migrated User');
    expect(user.customData).toMatchObject({ legacyId: 'legacy-001', migratedBy: 'p1-action' });
    expect(user.profile).toMatchObject({
      nickname: 'legacy-nick',
      website: 'https://legacy.example.com',
    });

    await deleteUser(userId);
  });

  it('should not issue tokens until MFA succeeds for an action-created user', async () => {
    await enableMandatoryMfaWithTotp();
    await upsertAction(actionKey, { script: createUserScript, enabled: true });

    const username = generateUsername();
    const password = generatePassword();

    const client = await initExperienceClient();
    await identifyUserWithUsernamePassword(client, username, password);

    await expectRejects(client.submitInteraction(), {
      code: 'user.missing_mfa',
      status: 422,
    });
    await expect(client.isAuthenticated()).resolves.toBe(false);

    const totpVerificationId = await successfullyCreateAndVerifyTotp(client);
    await client.bindMfa(MfaFactor.TOTP, totpVerificationId);

    const { redirectTo } = await client.submitInteraction();
    const userId = await processSession(client, redirectTo);
    await logoutClient(client);

    const user = await getUser(userId);
    expect(user.username).toBe(username);
    expect(user.customData).toMatchObject({ legacyId: 'legacy-001', migratedBy: 'p1-action' });

    const mfaVerifications = await getUserMfaVerifications(userId);
    expect(mfaVerifications.some(({ type }) => type === MfaFactor.TOTP)).toBe(true);

    await deleteUser(userId);
  });

  it('should update profile and password for an existing user whose local password fails', async () => {
    await upsertAction(actionKey, { script: updateUserScript, enabled: true });

    const username = generateUsername();
    const localPassword = generatePassword();
    const legacyPassword = generatePassword();
    const user = await userApi.create({ username, password: localPassword });

    const client = await initExperienceClient();
    await identifyUserWithUsernamePassword(client, username, legacyPassword);
    const { redirectTo } = await client.submitInteraction();
    const userId = await processSession(client, redirectTo);
    await logoutClient(client);

    expect(userId).toBe(user.id);

    const updated = await getUser(user.id, { includePasswordHash: true });
    expect(updated.name).toBe('Synced From Legacy');
    expect(updated.customData).toMatchObject({ legacySynced: true });
    expect(updated.profile).toMatchObject({ nickname: 'legacy-synced-nick' });
    // The legacy password was persisted as a fresh local credential.
    expect(updated.passwordAlgorithm).toBe(UsersPasswordEncryptionMethod.Argon2i);
    expect(updated.passwordDigest).toBeTruthy();
  });

  it('should store the migrated password with Argon2i and sign in locally once the action is disabled', async () => {
    await upsertAction(actionKey, { script: updateUserScript, enabled: true });

    const username = generateUsername();
    const localPassword = generatePassword();
    const legacyPassword = generatePassword();
    const user = await userApi.create({ username, password: localPassword });

    // Migrate the password through the action.
    const client = await initExperienceClient();
    await identifyUserWithUsernamePassword(client, username, legacyPassword);
    const { redirectTo } = await client.submitInteraction();
    await processSession(client, redirectTo);
    await logoutClient(client);

    const migrated = await getUser(user.id, { includePasswordHash: true });
    expect(migrated.passwordAlgorithm).toBe(UsersPasswordEncryptionMethod.Argon2i);
    expect(migrated.passwordDigest).toBeTruthy();

    // Disable the action and poison the script: if it were invoked again, the user would be renamed.
    await updateAction(actionKey, {
      enabled: false,
      script: `
        const runAction = () => ({
          action: 'updateUser',
          user: { name: 'Action Was Invoked' },
          passwordVerified: true,
        });
      `,
    });

    // The next sign-in succeeds through local password verification.
    const reloginClient = await initExperienceClient();
    await identifyUserWithUsernamePassword(reloginClient, username, legacyPassword);
    const { redirectTo: reloginRedirectTo } = await reloginClient.submitInteraction();
    await processSession(reloginClient, reloginRedirectTo);
    await logoutClient(reloginClient);

    const afterRelogin = await getUser(user.id);
    expect(afterRelogin.name).toBe('Synced From Legacy');
  });

  it('should complete MFA for an existing user with seeded TOTP after action password sync', async () => {
    await enableMandatoryMfaWithTotp();
    await upsertAction(actionKey, { script: updateUserScript, enabled: true });

    const username = generateUsername();
    const localPassword = generatePassword();
    const legacyPassword = generatePassword();
    const user = await userApi.create({ username, password: localPassword });
    const mfa = await createUserMfaVerification(user.id, MfaFactor.TOTP);

    if (mfa.type !== MfaFactor.TOTP) {
      throw new Error('unexpected mfa type');
    }

    const client = await initExperienceClient();
    await identifyUserWithUsernamePassword(client, username, legacyPassword);

    await expectRejects(client.submitInteraction(), {
      code: 'session.mfa.require_mfa_verification',
      status: 403,
    });
    await expect(client.isAuthenticated()).resolves.toBe(false);

    await successfullyVerifyTotp(client, { code: authenticator.generate(mfa.secret) });

    const { redirectTo } = await client.submitInteraction();
    const userId = await processSession(client, redirectTo);
    await logoutClient(client);

    expect(userId).toBe(user.id);

    const updated = await getUser(user.id);
    expect(updated.name).toBe('Synced From Legacy');
    expect(updated.customData).toMatchObject({ legacySynced: true });
  });
});
