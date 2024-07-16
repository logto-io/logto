import { MfaFactor, type CreateUser, type User } from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';
import { removeUndefinedKeys } from '@silverhand/essentials';

import {
  mockUser,
  mockUserBackupCodeMfaVerification,
  mockUserTotpMfaVerification,
  mockUserWithMfaVerifications,
} from '#src/__mocks__/index.js';
import { type InsertUserResult } from '#src/libraries/user.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import { MockTenant, type Partial2 } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

const mockedQueries = {
  users: {
    findUserById: jest.fn(async (id: string) => mockUser),
    hasUser: jest.fn(async () => mockHasUser()),
    hasUserWithEmail: jest.fn(async () => mockHasUserWithEmail()),
    hasUserWithPhone: jest.fn(async () => mockHasUserWithPhone()),
    updateUserById: jest.fn(
      async (_, data: Partial<CreateUser>): Promise<User> => ({
        ...mockUser,
        ...data,
      })
    ),
    deleteUserById: jest.fn(),
    deleteUserIdentity: jest.fn(),
  },
} satisfies Partial2<Queries>;

const mockHasUser = jest.fn(async () => false);
const mockHasUserWithEmail = jest.fn(async () => false);
const mockHasUserWithPhone = jest.fn(async () => false);

const { findUserById, updateUserById } = mockedQueries.users;

await mockEsmWithActual('../interaction/utils/totp-validation.js', () => ({
  generateTotpSecret: jest.fn().mockReturnValue('totp_secret'),
}));
await mockEsmWithActual('../interaction/utils/backup-code-validation.js', () => ({
  generateBackupCodes: jest.fn().mockReturnValue(['code']),
}));

const usersLibraries = {
  generateUserId: jest.fn(async () => 'fooId'),
  insertUser: jest.fn(
    async (user: CreateUser): Promise<InsertUserResult> => [
      {
        ...mockUser,
        ...removeUndefinedKeys(user), // No undefined values will be returned from database
      },
    ]
  ),
} satisfies Partial<Libraries['users']>;

const adminUserRoutes = await pickDefault(import('./mfa-verifications.js'));

describe('adminUserRoutes', () => {
  const tenantContext = new MockTenant(undefined, mockedQueries, undefined, {
    users: usersLibraries,
  });
  const userRequest = createRequester({ authedRoutes: adminUserRoutes, tenantContext });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GET /users/:userId/mfa-verifications', async () => {
    findUserById.mockResolvedValueOnce(mockUserWithMfaVerifications);
    const response = await userRequest.get(`/users/${mockUser.id}/mfa-verifications`);
    const { id, type, createdAt } = mockUserTotpMfaVerification;
    expect(response.body).toMatchObject([{ id, type, createdAt }]);
  });

  describe('POST /users/:userId/mfa-verifications', () => {
    describe('TOTP', () => {
      it('should bind and return totp secret', async () => {
        findUserById.mockResolvedValueOnce(mockUser);
        const response = await userRequest.post(`/users/${mockUser.id}/mfa-verifications`).send({
          type: MfaFactor.TOTP,
        });
        expect(response.body).toMatchObject({
          type: MfaFactor.TOTP,
          secret: 'totp_secret',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          secretQrCode: expect.stringContaining('data:image'),
        });
      });

      it('should fail for duplicate', async () => {
        findUserById.mockResolvedValueOnce({
          ...mockUser,
          mfaVerifications: [mockUserTotpMfaVerification],
        });
        const response = await userRequest.post(`/users/${mockUser.id}/mfa-verifications`).send({
          type: MfaFactor.TOTP,
        });
        expect(response.status).toEqual(422);
      });
    });
  });

  describe('Backup Code', () => {
    it('should bind and return codes', async () => {
      findUserById.mockResolvedValueOnce({
        ...mockUser,
        mfaVerifications: [mockUserTotpMfaVerification],
      });
      const response = await userRequest.post(`/users/${mockUser.id}/mfa-verifications`).send({
        type: MfaFactor.BackupCode,
      });
      expect(response.body).toMatchObject({
        type: MfaFactor.BackupCode,
        codes: ['code'],
      });
    });

    it('should fail if backup code is to be the only one', async () => {
      findUserById.mockResolvedValueOnce({
        ...mockUser,
        mfaVerifications: [],
      });
      const response = await userRequest.post(`/users/${mockUser.id}/mfa-verifications`).send({
        type: MfaFactor.BackupCode,
      });
      expect(response.status).toEqual(422);
    });

    it('should fail for duplicate', async () => {
      findUserById.mockResolvedValueOnce({
        ...mockUser,
        mfaVerifications: [mockUserBackupCodeMfaVerification, mockUserTotpMfaVerification],
      });
      const response = await userRequest.post(`/users/${mockUser.id}/mfa-verifications`).send({
        type: MfaFactor.BackupCode,
      });
      expect(response.status).toEqual(422);
    });
  });

  it('DELETE /users/:userId/mfa-verifications/:verificationId', async () => {
    findUserById.mockResolvedValueOnce({
      ...mockUser,
      mfaVerifications: [mockUserTotpMfaVerification],
    });
    const response = await userRequest.delete(
      `/users/${mockUser.id}/mfa-verifications/${mockUserTotpMfaVerification.id}`
    );
    expect(response.status).toEqual(204);
    expect(updateUserById).toHaveBeenCalledWith(mockUser.id, {
      mfaVerifications: [],
    });
  });

  it('DELETE /users/:userId/mfa-verifications/:verificationId should throw with wrong verification id', async () => {
    findUserById.mockResolvedValueOnce({
      ...mockUser,
      mfaVerifications: [mockUserTotpMfaVerification],
    });
    await expect(
      userRequest.delete(`/users/${mockUser.id}/mfa-verifications/wrong-verification-id`)
    ).resolves.toHaveProperty('status', 404);
  });
});
