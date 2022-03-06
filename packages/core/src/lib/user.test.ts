import { UsersPasswordEncryptionMethod } from '@logto/schemas';

import { hasUserWithId } from '@/queries/user';

import { encryptUserPassword, generateUserId, findUserSignInMethodsById } from './user';

const findUserById: jest.MockedFunction<() => Promise<unknown>> = jest.fn(async () => ({}));
const hasUserWithIdPlaceHolder = jest.fn() as jest.MockedFunction<typeof hasUserWithId>;
jest.mock('@/queries/user', () => ({
  findUserById: async () => findUserById(),
  hasUserWithId: async (_id: string) => hasUserWithIdPlaceHolder(_id),
}));

describe('generateUserId()', () => {
  afterEach(() => {
    hasUserWithIdPlaceHolder.mockClear();
  });

  it('generates user ID with correct length when no conflict found', async () => {
    const mockedHasUserWithId = hasUserWithIdPlaceHolder.mockImplementationOnce(async () => false);

    await expect(generateUserId()).resolves.toHaveLength(12);
    expect(mockedHasUserWithId).toBeCalledTimes(1);
  });

  it('generates user ID with correct length when retry limit is not reached', async () => {
    // eslint-disable-next-line @silverhand/fp/no-let
    let tried = 0;
    const mockedHasUserWithId = hasUserWithIdPlaceHolder.mockImplementation(async () => {
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
    const mockedHasUserWithId = hasUserWithIdPlaceHolder.mockImplementation(async () => true);

    await expect(generateUserId(10)).rejects.toThrow(
      'Cannot generate user ID in reasonable retries'
    );
    expect(mockedHasUserWithId).toBeCalledTimes(11);
  });
});

describe('encryptUserPassword()', () => {
  it('generates salt, encrypted and method', () => {
    const { passwordEncryptionMethod, passwordEncrypted, passwordEncryptionSalt } =
      encryptUserPassword('user-id', 'password');
    expect(passwordEncryptionMethod).toEqual(UsersPasswordEncryptionMethod.SaltAndPepper);
    expect(passwordEncrypted).toHaveLength(64);
    expect(passwordEncryptionSalt).toHaveLength(21);
  });
});

describe('findUserSignInMethodsById()', () => {
  afterEach(() => {
    findUserById.mockClear();
  });

  it('generate and test user with username and password sign-in method', async () => {
    findUserById.mockResolvedValue({
      username: 'abcd',
      passwordEncrypted: '1234567890',
      passwordEncryptionMethod: UsersPasswordEncryptionMethod.SaltAndPepper,
      passwordEncryptionSalt: '123456790',
    });
    const { usernameAndPassword, emailPasswordless, phonePasswordless, social } =
      await findUserSignInMethodsById('');
    expect(usernameAndPassword).toEqual(true);
    expect(emailPasswordless).toBeFalsy();
    expect(phonePasswordless).toBeFalsy();
    expect(social).toBeFalsy();
  });

  it('generate and test user with email passwordless sign-in method', async () => {
    findUserById.mockResolvedValue({
      primaryEmail: 'b@a.com',
      identities: {},
    });
    const { usernameAndPassword, emailPasswordless, phonePasswordless, social } =
      await findUserSignInMethodsById('');
    expect(usernameAndPassword).toBeFalsy();
    expect(emailPasswordless).toEqual(true);
    expect(phonePasswordless).toBeFalsy();
    expect(social).toBeFalsy();
  });

  it('generate and test user with phone passwordless sign-in method', async () => {
    findUserById.mockResolvedValue({
      primaryPhone: '13000000000',
    });
    const { usernameAndPassword, emailPasswordless, phonePasswordless, social } =
      await findUserSignInMethodsById('');
    expect(usernameAndPassword).toBeFalsy();
    expect(emailPasswordless).toBeFalsy();
    expect(phonePasswordless).toEqual(true);
    expect(social).toBeFalsy();
  });

  it('generate and test user with social sign-in method (single social connector information in record)', async () => {
    findUserById.mockResolvedValue({
      identities: { connector1: { userId: 'foo1' } },
    });
    const { usernameAndPassword, emailPasswordless, phonePasswordless, social } =
      await findUserSignInMethodsById('');
    expect(usernameAndPassword).toBeFalsy();
    expect(emailPasswordless).toBeFalsy();
    expect(phonePasswordless).toBeFalsy();
    expect(social).toEqual(true);
  });

  it('generate and test user with social sign-in method (multiple social connectors information in record)', async () => {
    findUserById.mockResolvedValue({
      identities: { connector1: { userId: 'foo1' }, connector2: { userId: 'foo2' } },
    });
    const { usernameAndPassword, emailPasswordless, phonePasswordless, social } =
      await findUserSignInMethodsById('');
    expect(usernameAndPassword).toBeFalsy();
    expect(emailPasswordless).toBeFalsy();
    expect(phonePasswordless).toBeFalsy();
    expect(social).toEqual(true);
  });
});
