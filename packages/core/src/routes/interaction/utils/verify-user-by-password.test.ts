import { verifyUserPassword } from '#src/lib/user.js';

import verifyUserByPassword from './verify-user-by-password.js';

jest.mock('#src/lib/user.js', () => ({
  verifyUserPassword: jest.fn(),
}));

describe('verifyUserByPassword', () => {
  const findUser = jest.fn();
  const verifyUserPasswordMock = verifyUserPassword as jest.Mock;
  const mockUser = { id: 'mock_user', isSuspended: false };

  it('should return userId', async () => {
    findUser.mockResolvedValueOnce(mockUser);
    verifyUserPasswordMock.mockResolvedValueOnce(mockUser);

    const userId = await verifyUserByPassword('foo', 'password', findUser);

    expect(findUser).toBeCalledWith('foo');
    expect(verifyUserPasswordMock).toBeCalledWith(mockUser, 'password');
    expect(userId).toEqual(mockUser.id);
  });

  it('should reject if user is suspended', async () => {
    findUser.mockResolvedValueOnce(mockUser);
    verifyUserPasswordMock.mockResolvedValueOnce({
      ...mockUser,
      isSuspended: true,
    });

    await expect(verifyUserByPassword('foo', 'password', findUser)).rejects.toThrow();

    expect(findUser).toBeCalledWith('foo');
    expect(verifyUserPasswordMock).toBeCalledWith(mockUser, 'password');
  });
});
