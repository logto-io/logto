import { defaultMessageRateLimitPolicy } from '@logto/schemas';

import { authedAdminApi } from '#src/api/api.js';
import { setEmailConnector } from '#src/helpers/connector.js';
import { expectRejects } from '#src/helpers/index.js';
import { OrganizationApiTest, OrganizationInvitationApiTest } from '#src/helpers/organization.js';
import { generateEmail } from '#src/utils.js';

const { maxSendsPerRecipient } = defaultMessageRateLimitPolicy;

const resendPayload = { link: 'https://example.com' };

describe('organization invitation send rate limit', () => {
  const invitationApi = new OrganizationInvitationApiTest();
  const organizationApi = new OrganizationApiTest();

  afterEach(async () => {
    await Promise.all([organizationApi.cleanUp(), invitationApi.cleanUp()]);
  });

  it('rejects with 429 once the per-recipient send cap within the window is exceeded', async () => {
    await setEmailConnector();
    const organization = await organizationApi.create({ name: 'test' });
    // Create a pending invitation without sending, then drive the sends through resend so they all
    // target the same recipient. A fresh recipient keeps the count isolated from other tests.
    const invitation = await invitationApi.create({
      organizationId: organization.id,
      invitee: generateEmail(),
      expiresAt: Date.now() + 1_000_000,
    });
    // Use the raw endpoint so the success status is observable; the typed helper discards it.
    const resend = async () =>
      authedAdminApi.post(`organization-invitations/${invitation.id}/message`, {
        json: resendPayload,
      });

    for (const _ of Array.from({ length: maxSendsPerRecipient })) {
      // eslint-disable-next-line no-await-in-loop -- sequential sends required to reach the cap deterministically
      const response = await resend();
      expect(response.status).toBe(204);
    }

    await expectRejects(resend(), { code: 'request.message_rate_limited', status: 429 });
  });
});
