import { pickDefault } from '@logto/shared/esm';

import { MockTenant } from '#src/test-utils/tenant.js';

const { jest } = import.meta;

const queries = {
  findUserByEmail: jest.fn(),
  findUserByUsername: jest.fn(),
  findUserByPhone: jest.fn(),
  findUserByIdentity: jest.fn(),
};

const getLogtoConnectorById = jest.fn().mockResolvedValue({ metadata: { target: 'logto' } });

const tenantContext = new MockTenant(
  undefined,
  {
    users: queries,
  },
  { connectors: { getLogtoConnectorById } }
);

const findUserByIdentifier = await pickDefault(import('./find-user-by-identifier.js'));

describe('findUserByIdentifier', () => {
  it('username', async () => {
    await findUserByIdentifier(tenantContext, { username: 'foo' });
    expect(queries.findUserByUsername).toBeCalledWith('foo');
  });

  it('email', async () => {
    await findUserByIdentifier(tenantContext, { email: 'foo@logto.io' });
    expect(queries.findUserByEmail).toBeCalledWith('foo@logto.io');
  });

  it('phone', async () => {
    await findUserByIdentifier(tenantContext, { phone: '123456' });
    expect(queries.findUserByPhone).toBeCalledWith('123456');
  });

  it('social', async () => {
    await findUserByIdentifier(tenantContext, {
      connectorId: 'connector',
      userInfo: { id: 'foo' },
    });
    expect(getLogtoConnectorById).toBeCalledWith('connector');
    expect(queries.findUserByIdentity).toBeCalledWith('logto', 'foo');
  });
});
