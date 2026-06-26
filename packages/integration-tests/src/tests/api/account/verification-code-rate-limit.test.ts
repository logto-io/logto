import { UserScope } from '@logto/core-kit';
import { defaultMessageRateLimitPolicy, SignInIdentifier } from '@logto/schemas';
import { type KyInstance } from 'ky';

import { enableAllAccountCenterFields } from '#src/api/account-center.js';
import { authedAdminApi } from '#src/api/api.js';
import { setEmailConnector } from '#src/helpers/connector.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  createDefaultTenantUserWithPassword,
  deleteDefaultTenantUser,
  signInAndGetUserApi,
} from '#src/helpers/profile.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateEmail } from '#src/utils.js';

const { maxSendsPerRecipient } = defaultMessageRateLimitPolicy;

const sendAccountVerificationCode = async (api: KyInstance, email: string) =>
  api.post('api/verifications/verification-code', {
    json: { identifier: { type: SignInIdentifier.Email, value: email } },
  });

describe('Account verification code send rate limit', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await setEmailConnector(authedAdminApi);
    await enableAllAccountCenterFields(authedAdminApi);
  });

  it('rejects with 429 once the per-recipient send cap within the window is exceeded', async () => {
    const { user, username, password } = await createDefaultTenantUserWithPassword();
    const api = await signInAndGetUserApi(username, password, {
      scopes: [UserScope.Profile, UserScope.Email],
    });
    // Use a fresh recipient so the count is not polluted by other tests sharing the activity store.
    const email = generateEmail();

    try {
      for (const _ of Array.from({ length: maxSendsPerRecipient })) {
        // eslint-disable-next-line no-await-in-loop -- sequential sends required to reach the cap deterministically
        const response = await sendAccountVerificationCode(api, email);
        expect(response.status).toBe(201);
      }

      await expectRejects(sendAccountVerificationCode(api, email), {
        code: 'request.message_rate_limited',
        status: 429,
      });
    } finally {
      await deleteDefaultTenantUser(user.id);
    }
  });
});
