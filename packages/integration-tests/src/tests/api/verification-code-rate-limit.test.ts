import { ConnectorType } from '@logto/connector-kit';
import { defaultMessageRateLimitPolicy } from '@logto/schemas';

import { requestVerificationCode } from '#src/api/verification-code.js';
import {
  clearConnectorsByTypes,
  setEmailConnector,
  setSmsConnector,
} from '#src/helpers/connector.js';
import { expectRejects } from '#src/helpers/index.js';
import { generateEmail, generatePhone } from '#src/utils.js';

const { maxSendsPerRecipient } = defaultMessageRateLimitPolicy;

describe('Management verification code send rate limit', () => {
  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
    await setEmailConnector();
    await setSmsConnector();
  });

  it('rejects with 429 once the per-recipient email send cap within the window is exceeded', async () => {
    // Use a fresh recipient so the count is not polluted by other tests sharing the activity store.
    const email = generateEmail();

    for (const _ of Array.from({ length: maxSendsPerRecipient })) {
      // eslint-disable-next-line no-await-in-loop -- sequential sends required to reach the cap deterministically
      const response = await requestVerificationCode({ email });
      expect(response.status).toBe(204);
    }

    await expectRejects(requestVerificationCode({ email }), {
      code: 'request.message_rate_limited',
      status: 429,
    });
  });

  it('rejects with 429 once the per-recipient phone send cap within the window is exceeded', async () => {
    const phone = generatePhone();

    for (const _ of Array.from({ length: maxSendsPerRecipient })) {
      // eslint-disable-next-line no-await-in-loop -- sequential sends required to reach the cap deterministically
      const response = await requestVerificationCode({ phone });
      expect(response.status).toBe(204);
    }

    await expectRejects(requestVerificationCode({ phone }), {
      code: 'request.message_rate_limited',
      status: 429,
    });
  });
});
