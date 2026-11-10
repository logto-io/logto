/* eslint-disable max-lines -- Covers every function of the user library in one place. */
import {
  defaultTenantId,
  MfaFactor,
  RoleType,
  type User,
  UsersPasswordEncryptionMethod,
} from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';

import { mockResource, mockAdminUserRole, mockScope } from '#src/__mocks__/index.js';
import { mockUser } from '#src/__mocks__/user.js';
import RequestError from '#src/errors/RequestError/index.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

mockEsm('hash-wasm', () => ({
  argon2Verify: jest.fn(async ({ password }: { password: string }) => {
    return password === 'password';
  }),
  bcryptVerify: jest.fn(async ({ password }: { password: string }) => {
    return password === 'password';
  }),
  md5: jest.fn(async (password) => {
    return password === 'password' ? '5f4dcc3b5aa765d61d8327deb882cf99' : 'wrong';
  }),
  sha1: jest.fn(async (password) => {
    return password === 'password' ? '5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8' : 'wrong';
  }),
  sha256: jest.fn(async (password) => {
    return password === 'password'
      ? '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
      : 'wrong';
  }),
}));

mockEsm('#src/utils/password.js', () => ({
  encryptPassword: jest.fn().mockResolvedValue('argon2:xxx'),
  legacyVerify: jest.fn().mockResolvedValue(true),
}));

const { argon2Verify } = await import('hash-wasm');

const { MockQueries } = await import('#src/test-utils/tenant.js');
const { createUserLibrary } = await import('./user.js');
const { decoyArgon2Hash } = await import('./user-password-verification.js');
const { encryptUserPassword } = await import('./user.utils.js');

const hasUserWithId = jest.fn();
const updateUserById = jest.fn();
const queries = new MockQueries({
  users: { hasUserWithId, findUserById: async () => mockUser, updateUserById },
  roles: { findRolesByRoleIds: async () => [mockAdminUserRole] },
  scopes: { findScopesByIdsAndResourceIndicator: async () => [mockScope] },
  usersRoles: { findUsersRolesByUserId: async () => [] },
  rolesScopes: { findRolesScopesByRoleIds: async () => [] },
});

describe('generateUserId()', () => {
  const { generateUserId } = createUserLibrary(defaultTenantId, queries);

  afterEach(() => {
    hasUserWithId.mockClear();
  });

  it('generates user ID with correct length when no conflict found', async () => {
    const mockedHasUserWithId = hasUserWithId.mockImplementationOnce(async () => false);

    await expect(generateUserId()).resolves.toHaveLength(12);
    expect(mockedHasUserWithId).toBeCalledTimes(1);
  });

  it('generates user ID with correct length when retry limit is not reached', async () => {
    // eslint-disable-next-line @silverhand/fp/no-let
    let tried = 0;
    const mockedHasUserWithId = hasUserWithId.mockImplementation(async () => {
      if (tried) {
        return false;
      }

      // eslint-disable-next-line @silverhand/fp/no-mutation
      tried++;

      return true;
    });

    await expect(generateUserId(2)).resolves.toHaveLength(12);
    expect(mockedHasUserWithId).toBeCalledTimes(2);
  });

  it('rejects with correct error message when retry limit is reached', async () => {
    const mockedHasUserWithId = hasUserWithId.mockImplementation(async () => true);

    await expect(generateUserId(10)).rejects.toThrow(
      'Cannot generate user ID in reasonable retries'
    );
    expect(mockedHasUserWithId).toBeCalledTimes(11);
  });
});

describe('encryptUserPassword()', () => {
  it('generates salt, encrypted and method', async () => {
    const { passwordEncryptionMethod, passwordEncrypted } = await encryptUserPassword('password');
    expect(passwordEncryptionMethod).toEqual(UsersPasswordEncryptionMethod.Argon2i);
    expect(passwordEncrypted).toContain('argon2');
  });
});

describe('verifyUserPassword()', () => {
  const { verifyUserPassword } = createUserLibrary(defaultTenantId, queries);

  afterEach(() => {
    jest.mocked(argon2Verify).mockClear();
  });

  describe('missing user or password', () => {
    it('rejects with invalid credentials when user is null', async () => {
      await expect(verifyUserPassword(null, 'password')).rejects.toThrowError(
        new RequestError({ code: 'session.invalid_credentials', status: 422 })
      );
      expect(argon2Verify).toHaveBeenCalledWith({
        password: 'password',
        hash: decoyArgon2Hash,
      });
    });

    it('rejects with invalid credentials when user has no password configured', async () => {
      const userWithoutPassword = {
        ...mockUser,
        passwordEncrypted: null,
        passwordEncryptionMethod: null,
      };

      await expect(verifyUserPassword(userWithoutPassword, 'password')).rejects.toThrowError(
        new RequestError({ code: 'session.invalid_credentials', status: 422 })
      );
      expect(argon2Verify).toHaveBeenCalledWith({
        password: 'password',
        hash: decoyArgon2Hash,
      });
    });
  });

  describe('Argon2i', () => {
    it('resolves when password is correct', async () => {
      await expect(verifyUserPassword(mockUser, 'password')).resolves.not.toThrowError();
    });

    it('rejects when password is incorrect', async () => {
      await expect(verifyUserPassword(mockUser, 'wrong')).rejects.toThrowError(
        new RequestError({ code: 'session.invalid_credentials', status: 422 })
      );
      expect(argon2Verify).toHaveBeenCalledTimes(1);
      expect(argon2Verify).not.toHaveBeenCalledWith(
        expect.objectContaining({ hash: decoyArgon2Hash })
      );
    });
  });

  describe('Argon2d', () => {
    const user = {
      ...mockUser,
      passwordEncrypted: '$argon2d$v=19$m=16,t=2,p=1$VW1JcEJrMjN1Vnp3Tm5JUA$Ddl/I6Zem7vbZ4r5jPCb/g',
      passwordEncryptionMethod: UsersPasswordEncryptionMethod.Argon2d,
    };

    it('resolves when password is correct', async () => {
      await expect(verifyUserPassword(user, 'password')).resolves.not.toThrowError();
    });

    it('rejects when password is incorrect', async () => {
      await expect(verifyUserPassword(user, 'wrong')).rejects.toThrowError(
        new RequestError({ code: 'session.invalid_credentials', status: 422 })
      );
    });
  });

  describe('Argon2id', () => {
    const user = {
      ...mockUser,
      passwordEncrypted:
        '$argon2id$v=19$m=16,t=2,p=1$VW1JcEJrMjN1Vnp3Tm5JUA$0uzNwxbjs/f/1e5r4uX7JQ',
      passwordEncryptionMethod: UsersPasswordEncryptionMethod.Argon2id,
    };

    it('resolves when password is correct', async () => {
      await expect(verifyUserPassword(user, 'password')).resolves.not.toThrowError();
    });

    it('rejects when password is incorrect', async () => {
      await expect(verifyUserPassword(user, 'wrong')).rejects.toThrowError(
        new RequestError({ code: 'session.invalid_credentials', status: 422 })
      );
      expect(argon2Verify).toHaveBeenCalledTimes(1);
      expect(argon2Verify).not.toHaveBeenCalledWith(
        expect.objectContaining({ hash: decoyArgon2Hash })
      );
    });
  });

  describe('MD5', () => {
    const user = {
      ...mockUser,
      passwordEncrypted: '5f4dcc3b5aa765d61d8327deb882cf99',
      passwordEncryptionMethod: UsersPasswordEncryptionMethod.MD5,
    };
    it('resolves when password is correct', async () => {
      await expect(verifyUserPassword(user, 'password')).resolves.not.toThrowError();
    });

    it('rejects when password is incorrect', async () => {
      await expect(verifyUserPassword(user, 'wrong')).rejects.toThrowError(
        new RequestError({ code: 'session.invalid_credentials', status: 422 })
      );
      expect(argon2Verify).toHaveBeenCalledWith({
        password: 'wrong',
        hash: decoyArgon2Hash,
      });
    });
  });

  describe('SHA1', () => {
    const user = {
      ...mockUser,
      passwordEncrypted: '5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8',
      passwordEncryptionMethod: UsersPasswordEncryptionMethod.SHA1,
    };
    it('resolves when password is correct', async () => {
      await expect(verifyUserPassword(user, 'password')).resolves.not.toThrowError();
    });

    it('rejects when password is incorrect', async () => {
      await expect(verifyUserPassword(user, 'wrong')).rejects.toThrowError(
        new RequestError({ code: 'session.invalid_credentials', status: 422 })
      );
      expect(argon2Verify).toHaveBeenCalledWith({
        password: 'wrong',
        hash: decoyArgon2Hash,
      });
    });
  });

  describe('SHA256', () => {
    const user = {
      ...mockUser,
      passwordEncrypted: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      passwordEncryptionMethod: UsersPasswordEncryptionMethod.SHA256,
    };
    it('resolves when password is correct', async () => {
      await expect(verifyUserPassword(user, 'password')).resolves.not.toThrowError();
    });

    it('rejects when password is incorrect', async () => {
      await expect(verifyUserPassword(user, 'wrong')).rejects.toThrowError(
        new RequestError({ code: 'session.invalid_credentials', status: 422 })
      );
      expect(argon2Verify).toHaveBeenCalledWith({
        password: 'wrong',
        hash: decoyArgon2Hash,
      });
    });
  });

  describe('Bcrypt', () => {
    const user = {
      ...mockUser,
      passwordEncrypted: '$2a$12$WQMqTfbtcZFBC1C1u8wpie6lXOSciUr5kk/8yEydoIMKltb9UKJ.6',
      passwordEncryptionMethod: UsersPasswordEncryptionMethod.Bcrypt,
    };
    it('resolves when password is correct', async () => {
      await expect(verifyUserPassword(user, 'password')).resolves.not.toThrowError();
    });

    it('rejects when password is incorrect', async () => {
      await expect(verifyUserPassword(user, 'wrong')).rejects.toThrowError(
        new RequestError({ code: 'session.invalid_credentials', status: 422 })
      );
    });
  });

  describe('Migrate other algorithms to Argon2', () => {
    const user = {
      ...mockUser,
      passwordEncrypted: '5f4dcc3b5aa765d61d8327deb882cf99',
      passwordEncryptionMethod: UsersPasswordEncryptionMethod.MD5,
    };
    it('migrates password to Argon2', async () => {
      await verifyUserPassword(user, 'password');
      expect(updateUserById).toHaveBeenCalledWith(user.id, {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        passwordEncrypted: expect.stringContaining('argon2'),
        passwordEncryptionMethod: UsersPasswordEncryptionMethod.Argon2i,
      });
      const lastCall = updateUserById.mock.calls.at(-1) as [string, Partial<User>] | undefined;
      expect(lastCall).toBeDefined();
      expect(lastCall?.[1].passwordUpdatedAt).toBeUndefined();
    });
  });
});

describe('findUserScopesForResourceId()', () => {
  const { findUserScopesForResourceIndicator } = createUserLibrary(defaultTenantId, queries);

  it('returns scopes that the user has access', async () => {
    await expect(
      findUserScopesForResourceIndicator(mockUser.id, mockResource.indicator)
    ).resolves.toEqual([mockScope]);
  });
});

describe('findUserRoles()', () => {
  const { findUserRoles } = createUserLibrary(defaultTenantId, queries);

  it('returns user roles', async () => {
    await expect(findUserRoles(mockUser.id)).resolves.toEqual([mockAdminUserRole]);
  });
});

describe('provisionOrganizations()', () => {
  const userId = 'user-id';
  const organizationId = 'organization-id';
  const getJitOrganizationsByIds = jest.fn(async () => [
    { organizationId, organizationRoleIds: ['default-role'] },
  ]);
  const findRolesByIds = jest.fn(async (): Promise<Array<{ id: string; type: RoleType }>> => []);
  const insertUsers = jest.fn();
  const insertUsersRoles = jest.fn();

  const { provisionOrganizations } = createUserLibrary(
    defaultTenantId,
    new MockQueries({
      organizations: {
        jit: { getJitOrganizationsByIds },
        roles: { findByIds: findRolesByIds },
        relations: {
          users: { getExistingOrganizationIds: async () => [], insert: insertUsers },
          usersRoles: { insert: insertUsersRoles },
        },
      },
    } as unknown as ConstructorParameters<typeof MockQueries>[0])
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('assigns the default JIT roles when no role IDs are given', async () => {
    await provisionOrganizations({ userId, organizationIds: [organizationId] });

    expect(findRolesByIds).not.toHaveBeenCalled();
    expect(insertUsersRoles).toHaveBeenCalledWith({
      organizationId,
      organizationRoleId: 'default-role',
      userId,
    });
  });

  it('assigns the given roles instead of the default JIT roles', async () => {
    findRolesByIds.mockResolvedValueOnce([{ id: 'admin', type: RoleType.User }]);

    await expect(
      provisionOrganizations({
        userId,
        organizationIds: [organizationId],
        organizationRoleIds: ['admin'],
      })
    ).resolves.toEqual([{ organizationId, organizationRoleIds: ['admin'] }]);

    expect(insertUsersRoles).toHaveBeenCalledTimes(1);
    expect(insertUsersRoles).toHaveBeenCalledWith({
      organizationId,
      organizationRoleId: 'admin',
      userId,
    });
  });

  it('skips the given roles that can no longer be assigned to a user', async () => {
    findRolesByIds.mockResolvedValueOnce([
      { id: 'admin', type: RoleType.User },
      { id: 'machine', type: RoleType.MachineToMachine },
    ]);

    await provisionOrganizations({
      userId,
      organizationIds: [organizationId],
      organizationRoleIds: ['admin', 'machine', 'deleted'],
    });

    expect(insertUsersRoles).toHaveBeenCalledTimes(1);
    expect(insertUsersRoles).toHaveBeenCalledWith({
      organizationId,
      organizationRoleId: 'admin',
      userId,
    });
  });

  it('adds the membership without roles when none of the given roles remain', async () => {
    findRolesByIds.mockResolvedValueOnce([]);

    await provisionOrganizations({
      userId,
      organizationIds: [organizationId],
      organizationRoleIds: ['deleted'],
    });

    expect(insertUsers).toHaveBeenCalledWith({ organizationId, userId });
    expect(insertUsersRoles).not.toHaveBeenCalled();
  });
});

describe('provisionOrganizationsByEmailDomain()', () => {
  const userId = 'user-id';
  const getJitOrganizations = jest.fn(async () => [
    { organizationId: 'organization-1', organizationRoleIds: ['default-role'] },
    { organizationId: 'organization-2', organizationRoleIds: ['default-role'] },
  ]);
  const insertUsers = jest.fn();
  const insertUsersRoles = jest.fn();

  const { provisionOrganizationsByEmailDomain } = createUserLibrary(
    defaultTenantId,
    new MockQueries({
      organizations: {
        jit: { emailDomains: { getJitOrganizations } },
        relations: {
          users: { getExistingOrganizationIds: async () => [], insert: insertUsers },
          usersRoles: { insert: insertUsersRoles },
        },
      },
    } as unknown as ConstructorParameters<typeof MockQueries>[0])
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('skips the excluded organizations', async () => {
    await expect(
      provisionOrganizationsByEmailDomain(userId, 'foo@example.com', ['organization-1'])
    ).resolves.toEqual([
      { organizationId: 'organization-2', organizationRoleIds: ['default-role'] },
    ]);

    expect(getJitOrganizations).toHaveBeenCalledWith('example.com');
    expect(insertUsers).toHaveBeenCalledWith({ organizationId: 'organization-2', userId });
    expect(insertUsersRoles).toHaveBeenCalledWith({
      organizationId: 'organization-2',
      organizationRoleId: 'default-role',
      userId,
    });
  });

  it('inserts nothing when every organization is excluded', async () => {
    await expect(
      provisionOrganizationsByEmailDomain(userId, 'foo@example.com', [
        'organization-1',
        'organization-2',
      ])
    ).resolves.toEqual([]);

    expect(insertUsers).not.toHaveBeenCalled();
    expect(insertUsersRoles).not.toHaveBeenCalled();
  });
});

describe('addUserMfaVerification()', () => {
  const createdAt = new Date().toISOString();
  const { addUserMfaVerification } = createUserLibrary(defaultTenantId, queries);

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(createdAt));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('update user with new mfa verification', async () => {
    await addUserMfaVerification(mockUser.id, { type: MfaFactor.TOTP, secret: 'secret' });
    expect(updateUserById).toHaveBeenCalledWith(mockUser.id, {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      mfaVerifications: [{ type: MfaFactor.TOTP, key: 'secret', id: expect.anything(), createdAt }],
    });
  });
});
/* eslint-enable max-lines */
