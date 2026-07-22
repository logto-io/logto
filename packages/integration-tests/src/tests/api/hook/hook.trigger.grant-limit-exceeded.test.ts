import { deleteApplication, updateApplication } from '#src/api/application.js';
import { WebHookApiTest } from '#src/helpers/hook.js';
import { createAppAndSignInWithPassword } from '#src/helpers/session.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';

import WebhookMockServer from './WebhookMockServer.js';
import { assertHookLogResult } from './utils.js';

const webHookMockServer = new WebhookMockServer(9998);
const webHookApi = new WebHookApiTest();
const hookName = 'grantLimitExceededHookEventListener';

describe('trigger `Grant.LimitExceeded` exception hook', () => {
  beforeAll(async () => {
    await webHookMockServer.listen();
    await enableAllPasswordSignInMethods();
    await webHookApi.create({
      name: hookName,
      events: ['Grant.LimitExceeded'],
      config: { url: webHookMockServer.endpoint },
    });
  });

  afterAll(async () => {
    await Promise.all([webHookApi.cleanUp(), webHookMockServer.close()]);
  });

  it('logs the `Grant.LimitExceeded` hook when maxAllowedGrants is exceeded', async () => {
    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const userApi = new UserApiTest();
    const user = await userApi.create({ username, password });
    const { app, signIn } = await createAppAndSignInWithPassword({ username, password });

    try {
      await updateApplication(app.id, {
        customClientMetadata: {
          alwaysIssueRefreshToken: true,
          maxAllowedGrants: 1,
        },
      });

      // Grant `iat` is second-level precision. Ensure the next sign-in creates
      // a strictly newer grant so oldest-grant selection stays deterministic.
      await new Promise((resolve) => {
        setTimeout(resolve, 1100);
      });

      await signIn();

      await assertHookLogResult(webHookApi.hooks.get(hookName)!, 'Grant.LimitExceeded', {
        hookPayload: {
          event: 'Grant.LimitExceeded',
          userId: user.id,
          applicationId: app.id,
          maxAllowedGrants: 1,
          // Exactly 2: createAppAndSignInWithPassword mints the first grant,
          // then signIn() mints the second, exceeding maxAllowedGrants: 1.
          preRevocationActiveGrantCount: 2,
        },
      });
    } finally {
      await deleteApplication(app.id);
      await userApi.cleanUp();
    }
  });
});
