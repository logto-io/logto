import { ConnectorType } from '@logto/connector-kit';
import { defaultMessageRateLimitPolicy } from '@logto/schemas';
import ky from 'ky';

import { authedAdminTenantApi as api } from '#src/api/api.js';
import { logtoConsoleUrl } from '#src/constants.js';
import {
  createUserWithAllRolesAndSignInToClient,
  deleteUser,
  resourceMe,
} from '#src/helpers/admin-tenant.js';
import { clearConnectorsByTypes, setEmailConnector } from '#src/helpers/connector.js';
import { expectRejects } from '#src/helpers/index.js';
import { generateEmail } from '#src/utils.js';

const { maxSendsPerRecipient } = defaultMessageRateLimitPolicy;

describe('Account center (/me) verification code send rate limit', () => {
  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email], api);
    await setEmailConnector(api);
  });

  afterAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email], api);
  });

  it('rejects with 429 once the per-recipient send cap within the window is exceeded', async () => {
    const { id, client } = await createUserWithAllRolesAndSignInToClient();
    const headers = { authorization: `Bearer ${await client.getAccessToken(resourceMe)}` };
    // Use a fresh recipient so the count is not polluted by other tests sharing the activity store.
    const email = generateEmail();
    const sendCode = async () =>
      ky.post(logtoConsoleUrl + '/me/verification-codes', { headers, json: { email } });

    try {
      for (const _ of Array.from({ length: maxSendsPerRecipient })) {
        // eslint-disable-next-line no-await-in-loop -- sequential sends required to reach the cap deterministically
        const response = await sendCode();
        expect(response.status).toBe(204);
      }

      await expectRejects(sendCode(), { code: 'request.message_rate_limited', status: 429 });
    } finally {
      await deleteUser(id);
    }
  });
});
