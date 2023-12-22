import { MockQueries } from '#src/test-utils/tenant.js';

import { recordActiveUsers } from './record-active-users.js';

const { jest } = import.meta;
const insertActiveUser = jest.fn();
const queries = new MockQueries({
  dailyActiveUsers: { insertActiveUser },
});

describe('recordActiveUsers()', () => {
  afterEach(() => {
    insertActiveUser.mockClear();
  });

  it('should call insertActiveUser if accountId exists, should always call recordTokenUsage', async () => {
    await recordActiveUsers({ accountId: 'accountId' }, queries);
    expect(insertActiveUser).toHaveBeenCalled();
  });

  it('should not call insertActiveUser if no accountId, should always call recordTokenUsage', async () => {
    await recordActiveUsers({ accountId: '' }, queries);
    expect(insertActiveUser).not.toHaveBeenCalled();
  });
});
