import { verifyUserPassword } from '#src/lib/user.js';
import { findUserByUsername, findUserByEmail, findUserByPhone } from '#src/queries/user.js';

import {
  verifyUserByIdentityAndPassword,
  verifyUserByVerifiedPasscodeIdentity,
} from './verify-user.js';

jest.mock('#src/lib/user.js', () => ({
  verifyUserPassword: jest.fn(),
}));

jest.mock('#src/queries/user.js', () => ({
  findUserByUsername: jest.fn(),
  findUserByEmail: jest.fn(),
  findUserByPhone: jest.fn(),
}));

describe('verifyUserByIdentityAndPassword', () => {
  const findUserByUsernameMock = findUserByUsername as jest.Mock;
  const findUserByEmailMock = findUserByEmail as jest.Mock;
  const findUserByPhoneMock = findUserByPhone as jest.Mock;
  const verifyUserPasswordMock = verifyUserPassword as jest.Mock;
  const mockUser = { id: 'mock_user', isSuspended: false };

  const usernameIdentifier = {
    username: 'username',
    password: 'password',
  };

  const emailIdentifier = {
    email: 'email',
    password: 'password',
  };

  const phoneIdentifier = {
    phone: 'phone',
    password: 'password',
  };

  it('username password', async () => {
    findUserByUsernameMock.mockResolvedValueOnce(mockUser);
    verifyUserPasswordMock.mockResolvedValueOnce(mockUser);

    const userId = await verifyUserByIdentityAndPassword(usernameIdentifier);

    expect(findUserByUsernameMock).toBeCalledWith(usernameIdentifier.username);
    expect(verifyUserPasswordMock).toBeCalledWith(mockUser, usernameIdentifier.password);
    expect(userId).toEqual(mockUser.id);
  });

  it('should reject if user is suspended', async () => {
    findUserByUsernameMock.mockResolvedValueOnce(mockUser);
    verifyUserPasswordMock.mockResolvedValueOnce({
      ...mockUser,
      isSuspended: true,
    });

    await expect(verifyUserByIdentityAndPassword(usernameIdentifier)).rejects.toThrow();

    expect(findUserByUsernameMock).toBeCalledWith(usernameIdentifier.username);
    expect(verifyUserPasswordMock).toBeCalledWith(mockUser, usernameIdentifier.password);
  });

  it('email password', async () => {
    findUserByEmailMock.mockResolvedValueOnce(mockUser);
    verifyUserPasswordMock.mockResolvedValueOnce(mockUser);

    const userId = await verifyUserByIdentityAndPassword(emailIdentifier);

    expect(findUserByEmailMock).toBeCalledWith(emailIdentifier.email);
    expect(verifyUserPasswordMock).toBeCalledWith(mockUser, emailIdentifier.password);
    expect(userId).toEqual(mockUser.id);
  });

  it('phone password', async () => {
    findUserByPhoneMock.mockResolvedValueOnce(mockUser);
    verifyUserPasswordMock.mockResolvedValueOnce(mockUser);

    const userId = await verifyUserByIdentityAndPassword(phoneIdentifier);

    expect(findUserByPhoneMock).toBeCalledWith(phoneIdentifier.phone);
    expect(verifyUserPasswordMock).toBeCalledWith(mockUser, phoneIdentifier.password);
    expect(userId).toEqual(mockUser.id);
  });
});

describe('verifyUserByVerifiedPasscodeIdentity', () => {
  const findUserByEmailMock = findUserByEmail as jest.Mock;
  const findUserByPhoneMock = findUserByPhone as jest.Mock;
  const mockUser = { id: 'mock_user', isSuspended: false };

  const emailIdentifier = {
    email: 'email',
  };

  const phoneIdentifier = {
    phone: 'phone',
  };

  it('verified email', async () => {
    findUserByEmailMock.mockResolvedValueOnce(mockUser);

    const userId = await verifyUserByVerifiedPasscodeIdentity(emailIdentifier);

    expect(findUserByEmailMock).toBeCalledWith(emailIdentifier.email);
    expect(userId).toEqual(mockUser.id);
  });

  it('verified phone', async () => {
    findUserByPhoneMock.mockResolvedValueOnce(mockUser);

    const userId = await verifyUserByVerifiedPasscodeIdentity(phoneIdentifier);

    expect(findUserByPhoneMock).toBeCalledWith(phoneIdentifier.phone);
    expect(userId).toEqual(mockUser.id);
  });
});
