import { UsersPasswordEncryptionMethod } from '@logto/schemas';

import { hasUserWithId, updateUserById } from '@/queries/user';

import { encryptUserPassword, generateUserId, updateLastSignInAt } from './user';

jest.mock('@/queries/user');

describe('generateUserId()', () => {
  afterEach(() => {
    (hasUserWithId as jest.MockedFunction<typeof hasUserWithId>).mockClear();
  });

  it('generates user ID with correct length when no conflict found', async () => {
    const mockedHasUserWithId = (
      hasUserWithId as jest.MockedFunction<typeof hasUserWithId>
    ).mockImplementationOnce(async () => false);

    await expect(generateUserId()).resolves.toHaveLength(12);
    expect(mockedHasUserWithId).toBeCalledTimes(1);
  });

  it('generates user ID with correct length when retry limit is not reached', async () => {
    // eslint-disable-next-line @silverhand/fp/no-let
    let tried = 0;
    const mockedHasUserWithId = (
      hasUserWithId as jest.MockedFunction<typeof hasUserWithId>
    ).mockImplementation(async () => {
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
    const mockedHasUserWithId = (
      hasUserWithId as jest.MockedFunction<typeof hasUserWithId>
    ).mockImplementation(async () => true);

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

describe('updateLastSignIn()', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));
  });

  it('calls updateUserById with current timestamp', async () => {
    await updateLastSignInAt('user-id');
    expect(updateUserById).toHaveBeenCalledWith(
      'user-id',
      expect.objectContaining({ lastSignInAt: new Date('2020-01-01').getTime() })
    );
  });
});
