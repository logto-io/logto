import { assert } from '@silverhand/essentials';

import { getLogs, getLog } from '#src/api/index.js';
import { signUpIdentifiers } from '#src/constants.js';
import { registerNewUser, setSignUpIdentifier } from '#src/helpers.js';
import { generateUsername, generatePassword } from '#src/utils.js';

/** @deprecated This will be removed soon. */
describe('admin console logs (legacy)', () => {
  const username = generateUsername();
  const password = generatePassword();

  beforeAll(async () => {
    await setSignUpIdentifier(signUpIdentifiers.username);
  });

  it('should get logs and visit log details successfully', async () => {
    await registerNewUser(username, password);

    const logs = await getLogs();

    const registerLog = logs.filter(
      ({ type, payload }) => type === 'RegisterUsernamePassword' && payload.username === username
    );

    expect(registerLog.length).toBeGreaterThan(0);

    assert(registerLog[0], new Error('Log is not valid'));

    const logDetails = await getLog(registerLog[0].id);

    expect(logDetails).toMatchObject(registerLog[0]);
  });
});
