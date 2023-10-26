import { MfaFactor } from '@logto/schemas';

import {
  createUserMfaVerification,
  deleteUser,
  deleteUserMfaVerification,
  getUserMfaVerifications,
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
});
