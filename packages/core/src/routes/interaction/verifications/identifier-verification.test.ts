import { findUserByUsername, findUserByEmail, findUserByPhone } from '#src/queries/user.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import verifyUserByPassword from '../utils/verify-user-by-password.js';
import identifierVerification from './identifier-verification.js';

jest.mock('../utils/verify-user-by-password.js', () => ({
  default: jest.fn(),
}));

describe('identifier verification', () => {
  const baseCtx = createContextWithRouteParameters();
  const verifyUserByPasswordMock = verifyUserByPassword as jest.Mock;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('username password', async () => {
    verifyUserByPasswordMock.mockResolvedValueOnce('userId');

    const ctx = {
      ...baseCtx,
      interactionPayload: Object.freeze({
        event: 'sign-in',
        identifier: {
          username: 'username',
          password: 'password',
        },
      }),
    };

    const result = await identifierVerification(ctx);

    expect(verifyUserByPasswordMock).toBeCalledWith('username', 'password', findUserByUsername);
    expect(result).toEqual([{ key: 'accountId', value: 'userId' }]);
  });

  it('email password', async () => {
    verifyUserByPasswordMock.mockResolvedValueOnce('userId');

    const ctx = {
      ...baseCtx,
      interactionPayload: Object.freeze({
        event: 'sign-in',
        identifier: {
          email: 'email',
          password: 'password',
        },
      }),
    };

    const result = await identifierVerification(ctx);

    expect(verifyUserByPasswordMock).toBeCalledWith('email', 'password', findUserByEmail);
    expect(result).toEqual([{ key: 'accountId', value: 'userId' }]);
  });

  it('phone password', async () => {
    verifyUserByPasswordMock.mockResolvedValueOnce('userId');

    const ctx = {
      ...baseCtx,
      interactionPayload: Object.freeze({
        event: 'sign-in',
        identifier: {
          phone: '123456',
          password: 'password',
        },
      }),
    };

    const result = await identifierVerification(ctx);

    expect(verifyUserByPasswordMock).toBeCalledWith('123456', 'password', findUserByPhone);
    expect(result).toEqual([{ key: 'accountId', value: 'userId' }]);
  });
});
