import { type CreateUser, type User, UsersPasswordEncryptionMethod } from '@logto/schemas';

import { mockUser } from '#src/__mocks__/user.js';
import RequestError from '#src/errors/RequestError/index.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import { type WithHooksAndLogsContext } from '../../types.js';

const { jest } = import.meta;

const { UserUpdateLibrary } = await import('./user-update-library.js');

const createUserUpdateLibrary = ({ user = mockUser }: { user?: User } = {}) => {
  const findUserById = jest.fn(async (): Promise<User> => user);
  const updateUserById = jest.fn(
    async (userId: string, payload: Partial<CreateUser>): Promise<User> => ({
      ...user,
      ...payload,
      id: userId,
    })
  );
  const checkIdentifierCollision = jest.fn();

  const tenant = new MockTenant(
    undefined,
    {
      users: {
        findUserById,
        updateUserById,
      },
    },
    undefined,
    {
      users: {
        checkIdentifierCollision,
      },
    }
  );

  // @ts-expect-error -- mock test context
  const ctx: WithHooksAndLogsContext = {
    assignReleaseOnSuccessInteractionHookResult: jest.fn(),
    assignReleaseAnywayInteractionHookResult: jest.fn(),
    appendDataHookContext: jest.fn(),
    appendExceptionHookContext: jest.fn(),
    ...createContextWithRouteParameters(),
    ...createMockLogContext(),
  };

  return {
    userUpdateLibrary: new UserUpdateLibrary(tenant, ctx),
    ctx,
    findUserById,
    updateUserById,
    checkIdentifierCollision,
  };
};

describe('UserUpdateLibrary', () => {
  it('checks identifiers, atomically merges customData, updates the user, and appends data hook context', async () => {
    const customData = {
      plan: 'pro',
      upstreamId: 'user-1',
    };
    const profile = { givenName: 'Jane' };
    const { userUpdateLibrary, ctx, findUserById, updateUserById, checkIdentifierCollision } =
      createUserUpdateLibrary({
        user: {
          ...mockUser,
          id: 'user-id',
          customData: {
            source: 'registration',
            plan: 'free',
          },
        },
      });

    const updatedUser = await userUpdateLibrary.updateUser(
      'user-id',
      {
        name: 'Jane Doe',
        username: 'jane',
        primaryEmail: 'jane@example.com',
        primaryPhone: '+1234567890',
        profile,
        customData,
        passwordEncrypted: 'hashed-password',
        passwordEncryptionMethod: UsersPasswordEncryptionMethod.Argon2i,
      },
      {
        mergeCustomData: true,
      }
    );

    expect(checkIdentifierCollision).toHaveBeenCalledWith(
      {
        username: 'jane',
        primaryEmail: 'jane@example.com',
        primaryPhone: '+1234567890',
      },
      'user-id'
    );
    expect(findUserById).not.toHaveBeenCalled();
    expect(Number(checkIdentifierCollision.mock.invocationCallOrder[0])).toBeLessThan(
      Number(updateUserById.mock.invocationCallOrder[0])
    );

    expect(updateUserById).toHaveBeenCalledWith(
      'user-id',
      expect.objectContaining({
        name: 'Jane Doe',
        username: 'jane',
        primaryEmail: 'jane@example.com',
        primaryPhone: '+1234567890',
        profile,
        customData,
        passwordEncrypted: 'hashed-password',
        passwordEncryptionMethod: UsersPasswordEncryptionMethod.Argon2i,
        isPasswordExpired: false,
      }),
      'merge'
    );
    expect(updateUserById.mock.calls[0]?.[1]).toHaveProperty(
      'passwordUpdatedAt',
      expect.any(Number)
    );
    expect(updateUserById.mock.calls[0]?.[1]).not.toHaveProperty('id');
    expect(updateUserById.mock.calls[0]?.[1]).not.toHaveProperty('logtoConfig');
    expect(ctx.appendDataHookContext).toHaveBeenCalledWith('User.Data.Updated', {
      user: updatedUser,
    });

    findUserById.mockClear();
    updateUserById.mockClear();
    await userUpdateLibrary.updateUser('user-id', { name: 'Jane Doe' });

    expect(findUserById).not.toHaveBeenCalled();
    expect(updateUserById).toHaveBeenCalledWith('user-id', { name: 'Jane Doe' }, 'merge');
  });

  it('merges profile at the SQL layer then replaces customData without a read-modify-write', async () => {
    const customData = {
      plan: 'pro',
    };
    const profile = {
      givenName: 'Janet',
    };
    const { userUpdateLibrary, findUserById, updateUserById } = createUserUpdateLibrary({
      user: {
        ...mockUser,
        id: 'user-id',
        profile: {
          givenName: 'Jane',
          familyName: 'Doe',
        },
        customData: {
          plan: 'free',
        },
      },
    });

    await userUpdateLibrary.updateUser('user-id', {
      profile,
      customData,
    });

    expect(findUserById).not.toHaveBeenCalled();
    expect(updateUserById).toHaveBeenNthCalledWith(
      1,
      'user-id',
      expect.objectContaining({
        profile,
      }),
      'merge'
    );
    expect(updateUserById.mock.calls[0]?.[1]).not.toHaveProperty('customData');
    expect(updateUserById).toHaveBeenNthCalledWith(2, 'user-id', { customData }, 'replace');
  });

  it('replaces customData without reading the existing user when mergeCustomData is false', async () => {
    const customData = {
      plan: 'pro',
      upstreamId: 'user-1',
    };
    const { userUpdateLibrary, findUserById, updateUserById } = createUserUpdateLibrary({
      user: {
        ...mockUser,
        id: 'user-id',
        customData: {
          source: 'registration',
          plan: 'free',
        },
      },
    });

    await userUpdateLibrary.updateUser('user-id', { customData });

    expect(findUserById).not.toHaveBeenCalled();
    expect(updateUserById).toHaveBeenCalledTimes(1);
    expect(updateUserById).toHaveBeenCalledWith('user-id', { customData }, 'replace');
  });

  it('ignores empty customData when mergeCustomData is false', async () => {
    const { userUpdateLibrary, ctx, findUserById, updateUserById } = createUserUpdateLibrary({
      user: {
        ...mockUser,
        id: 'user-id',
        customData: {
          plan: 'free',
        },
      },
    });

    await userUpdateLibrary.updateUser('user-id', { customData: {} });

    expect(updateUserById).not.toHaveBeenCalled();
    expect(findUserById).toHaveBeenCalledWith('user-id');
    expect(ctx.appendDataHookContext).not.toHaveBeenCalled();
  });

  it('ignores empty profile when updating customData in replace mode', async () => {
    const customData = {
      plan: 'pro',
    };
    const { userUpdateLibrary, updateUserById } = createUserUpdateLibrary({
      user: {
        ...mockUser,
        id: 'user-id',
        profile: {
          givenName: 'Jane',
          familyName: 'Doe',
        },
        customData: {
          plan: 'free',
        },
      },
    });

    await userUpdateLibrary.updateUser('user-id', { profile: {}, customData });

    expect(updateUserById).toHaveBeenCalledWith(
      'user-id',
      expect.objectContaining({
        customData,
      }),
      'replace'
    );
    expect(updateUserById.mock.calls[0]?.[1]).not.toHaveProperty('profile');
  });

  it('returns the existing user without updating when the profile is empty', async () => {
    const { userUpdateLibrary, ctx, findUserById, updateUserById, checkIdentifierCollision } =
      createUserUpdateLibrary({
        user: {
          ...mockUser,
          id: 'user-id',
        },
      });

    const user = await userUpdateLibrary.updateUser('user-id', {});

    expect(checkIdentifierCollision).toHaveBeenCalledWith({}, 'user-id');
    expect(findUserById).toHaveBeenCalledWith('user-id');
    expect(updateUserById).not.toHaveBeenCalled();
    expect(ctx.appendDataHookContext).not.toHaveBeenCalled();
    expect(user).toEqual(expect.objectContaining({ id: 'user-id' }));
  });

  it('propagates identifier collision errors without updating the user', async () => {
    const error = new RequestError({ code: 'user.email_already_in_use', status: 422 });
    const { userUpdateLibrary, ctx, findUserById, checkIdentifierCollision, updateUserById } =
      createUserUpdateLibrary();

    checkIdentifierCollision.mockRejectedValueOnce(error);

    await expect(
      userUpdateLibrary.updateUser('user-id', { primaryEmail: 'jane@example.com' })
    ).rejects.toBe(error);

    expect(findUserById).not.toHaveBeenCalled();
    expect(updateUserById).not.toHaveBeenCalled();
    expect(ctx.appendDataHookContext).not.toHaveBeenCalled();
  });
});
