import { getLogtoConnectorById } from '#src/connectors/index.js';
import {
  findUserByEmail,
  findUserByUsername,
  findUserByPhone,
  findUserByIdentity,
} from '#src/queries/user.js';

import findUserByIdentifier from './find-user-by-identifier.js';

jest.mock('#src/queries/user.js', () => ({
  findUserByEmail: jest.fn(),
  findUserByUsername: jest.fn(),
  findUserByPhone: jest.fn(),
  findUserByIdentity: jest.fn(),
}));

jest.mock('#src/connectors/index.js', () => ({
  getLogtoConnectorById: jest.fn().mockResolvedValue({ metadata: { target: 'logto' } }),
}));

describe('findUserByIdentifier', () => {
  it('username', async () => {
    await findUserByIdentifier({ username: 'foo' });
    expect(findUserByUsername).toBeCalledWith('foo');
  });

  it('email', async () => {
    await findUserByIdentifier({ email: 'foo@logto.io' });
    expect(findUserByEmail).toBeCalledWith('foo@logto.io');
  });

  it('phone', async () => {
    await findUserByIdentifier({ phone: '123456' });
    expect(findUserByPhone).toBeCalledWith('123456');
  });

  it('social', async () => {
    await findUserByIdentifier({ connectorId: 'connector', userInfo: { id: 'foo' } });
    expect(getLogtoConnectorById).toBeCalledWith('connector');
    expect(findUserByIdentity).toBeCalledWith('logto', 'foo');
  });
});
