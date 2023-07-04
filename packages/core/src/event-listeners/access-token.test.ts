import { MockQueries } from '#src/test-utils/tenant.js';

import { accessTokenIssuedListener } from './access-token.js';

const { jest } = import.meta;
const insertActiveUser = jest.fn();
const queries = new MockQueries({
  dailyActiveUsers: { insertActiveUser },
});

describe('accessTokenIssuedListener()', () => {
  afterEach(() => {
    insertActiveUser.mockClear();
  });

  it('should call insertActiveUser if accountId exists', async () => {
    await accessTokenIssuedListener({ accountId: 'accountId' }, queries);
    expect(insertActiveUser).toHaveBeenCalled();
  });

  it('should not call insertActiveUser if no accountId', async () => {
    await accessTokenIssuedListener({ accountId: '' }, queries);
    expect(insertActiveUser).not.toHaveBeenCalled();
  });
});
