import { pickDefault, createMockUtils } from '@logto/shared/esm';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

const queries = {
  findUserByEmail: jest.fn(),
  findUserByUsername: jest.fn(),
  findUserByPhone: jest.fn(),
  findUserByIdentity: jest.fn(),
};

mockEsm('#src/queries/user.js', () => queries);

const { getLogtoConnectorById } = mockEsm('#src/libraries/connector.js', () => ({
  getLogtoConnectorById: jest.fn().mockResolvedValue({ metadata: { target: 'logto' } }),
}));

const findUserByIdentifier = await pickDefault(import('./find-user-by-identifier.js'));

describe('findUserByIdentifier', () => {
  it('username', async () => {
    await findUserByIdentifier({ username: 'foo' });
    expect(queries.findUserByUsername).toBeCalledWith('foo');
  });

  it('email', async () => {
    await findUserByIdentifier({ email: 'foo@logto.io' });
    expect(queries.findUserByEmail).toBeCalledWith('foo@logto.io');
  });

  it('phone', async () => {
    await findUserByIdentifier({ phone: '123456' });
    expect(queries.findUserByPhone).toBeCalledWith('123456');
  });

  it('social', async () => {
    await findUserByIdentifier({ connectorId: 'connector', userInfo: { id: 'foo' } });
    expect(getLogtoConnectorById).toBeCalledWith('connector');
    expect(queries.findUserByIdentity).toBeCalledWith('logto', 'foo');
  });
});
