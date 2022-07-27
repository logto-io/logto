import { LogDto } from '@logto/schemas';
import { assert } from '@silverhand/essentials';

import { authedAdminApi } from '@/api';
import { registerUserAndSignIn } from '@/helpers';

describe('admin console logs', () => {
  it('should get logs and visit log details successfully', async () => {
    await registerUserAndSignIn();

    const logs = await authedAdminApi.get('logs').json<LogDto[]>();

    expect(logs.length).toBeGreaterThan(0);

    const log = logs[0];
    assert(log, new Error('Log is not valid'));

    const logDetails = await authedAdminApi.get(`logs/${log.id}`).json<LogDto>();

    expect(logDetails.id).toBe(log.id);
  });
});
