import { assert } from '@silverhand/essentials';

import { getLogs, getLog } from '@/api';
import { signUpIdentifiers } from '@/constants';
import { registerNewUser, setSignUpIdentifier } from '@/helpers';
import { generateUsername, generatePassword } from '@/utils';

describe('admin console logs', () => {
  const username = generateUsername();
  const password = generatePassword();

  beforeAll(async () => {
    await setSignUpIdentifier(signUpIdentifiers.username);
  });

  it('should get logs and visit log details successfully', async () => {
    await registerNewUser(username, password);

    const logs = await getLogs();

    const registerLog = logs.filter(
      ({ type, payload }) =>
        type === 'RegisterUsernamePassword' &&
        (payload as Record<string, unknown>).username === username
    );

    expect(registerLog.length).toBeGreaterThan(0);

    assert(registerLog[0], new Error('Log is not valid'));

    const logDetails = await getLog(registerLog[0].id);

    expect(logDetails).toMatchObject(registerLog[0]);
  });
});
