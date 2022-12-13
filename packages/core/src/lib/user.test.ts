import { UsersPasswordEncryptionMethod } from '@logto/schemas';
import { mockEsmWithActual } from '@logto/shared/esm';

const { jest } = import.meta;

const { updateUserById, hasUserWithId } = await mockEsmWithActual('#src/queries/user.js', () => ({
  updateUserById: jest.fn(),
  hasUserWithId: jest.fn(),
}));

const { encryptUserPassword, generateUserId } = await import('./user.js');

describe('generateUserId()', () => {
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

describe('updateLastSignIn()', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));
  });

  it('calls updateUserById with current timestamp', async () => {
    await updateUserById('user-id', { lastSignInAt: Date.now() });
    expect(updateUserById).toHaveBeenCalledWith(
      'user-id',
      expect.objectContaining({ lastSignInAt: new Date('2020-01-01').getTime() })
    );
  });
});
