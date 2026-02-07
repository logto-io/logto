import { MfaFactor } from '@logto/schemas';

import {
  createUserMfaVerification,
  deleteUser,
  deleteUserMfaVerification,
  getUserLogtoConfig,
  getUserMfaVerifications,
  updateUserLogtoConfig,
} from '#src/api/index.js';
import { createUserByAdmin } from '#src/helpers/index.js';

describe('admin console user management (mfa verifications)', () => {
  it('should get empty list successfully', async () => {
    const user = await createUserByAdmin();

    const mfaVerifications = await getUserMfaVerifications(user.id);
    expect(mfaVerifications.length).toBe(0);
    await deleteUser(user.id);
  });

  it('should create TOTP', async () => {
    const user = await createUserByAdmin();

    const response = await createUserMfaVerification(user.id, MfaFactor.TOTP);
    expect(response).toHaveProperty('secret');
    expect(response).toHaveProperty('secretQrCode');
    const mfaVerifications = await getUserMfaVerifications(user.id);
    expect(mfaVerifications.length).toBe(1);
    expect(mfaVerifications[0]).toHaveProperty('type', MfaFactor.TOTP);
    await deleteUser(user.id);
  });

  it('should create backup code', async () => {
    const user = await createUserByAdmin();

    await createUserMfaVerification(user.id, MfaFactor.TOTP);
    const response = await createUserMfaVerification(user.id, MfaFactor.BackupCode);
    expect(response).toHaveProperty('codes');
    const mfaVerifications = await getUserMfaVerifications(user.id);
    expect(mfaVerifications.length).toBe(2);
    expect(mfaVerifications.find(({ type }) => type === MfaFactor.BackupCode)).toBeDefined();
    await deleteUser(user.id);
  });

  it('should delete verification successfully', async () => {
    const user = await createUserByAdmin();

    await createUserMfaVerification(user.id, MfaFactor.TOTP);
    const mfaVerifications = await getUserMfaVerifications(user.id);
    expect(mfaVerifications.length).toBe(1);
    if (mfaVerifications[0]) {
      await deleteUserMfaVerification(user.id, mfaVerifications[0].id);
      const mfaVerifications2 = await getUserMfaVerifications(user.id);
      expect(mfaVerifications2.length).toBe(0);
    }
    await deleteUser(user.id);
  });

  it('should update logto_config MFA skip state successfully', async () => {
    const user = await createUserByAdmin();

    const config = await getUserLogtoConfig(user.id);
    expect(config).toEqual({
      mfa: { skipped: false, skipMfaOnSignIn: false },
      passkeySignIn: { skipped: false },
    });

    const response = await updateUserLogtoConfig(user.id, {
      mfa: { skipped: true, skipMfaOnSignIn: false },
      passkeySignIn: { skipped: false },
    });
    expect(response).toEqual({
      mfa: { skipped: true, skipMfaOnSignIn: false },
      passkeySignIn: { skipped: false },
    });

    const updatedConfig = await getUserLogtoConfig(user.id);
    expect(updatedConfig.mfa.skipped).toBe(true);
    expect(updatedConfig.mfa.skipMfaOnSignIn).toBe(false);

    const response2 = await updateUserLogtoConfig(user.id, {
      mfa: { skipped: false, skipMfaOnSignIn: true },
      passkeySignIn: { skipped: true },
    });
    expect(response2).toEqual({
      mfa: { skipped: false, skipMfaOnSignIn: true },
      passkeySignIn: { skipped: true },
    });

    const updatedConfig2 = await getUserLogtoConfig(user.id);
    expect(updatedConfig2.mfa.skipped).toBe(false);
    expect(updatedConfig2.mfa.skipMfaOnSignIn).toBe(true);
    expect(updatedConfig2.passkeySignIn.skipped).toBe(true);

    // Reset all flags
    const response3 = await updateUserLogtoConfig(user.id, {
      mfa: { skipped: false, skipMfaOnSignIn: false },
      passkeySignIn: { skipped: false },
    });
    expect(response3).toEqual({
      mfa: { skipped: false, skipMfaOnSignIn: false },
      passkeySignIn: { skipped: false },
    });

    await deleteUser(user.id);
  });
});
