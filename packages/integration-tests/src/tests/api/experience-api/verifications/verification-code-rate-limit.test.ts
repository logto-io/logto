import { ConnectorType } from '@logto/connector-kit';
import { defaultMessageRateLimitPolicy, InteractionEvent, SignInIdentifier } from '@logto/schemas';

import { initExperienceClient } from '#src/helpers/client.js';
import { clearConnectorsByTypes, setEmailConnector } from '#src/helpers/connector.js';
import { successfullySendVerificationCode } from '#src/helpers/experience/verification-code.js';
import { expectRejects } from '#src/helpers/index.js';
import { generateEmail } from '#src/utils.js';

const { maxSendsPerRecipient } = defaultMessageRateLimitPolicy;

describe('Verification code send rate limit', () => {
  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email]);
    await setEmailConnector();
  });

  it('rejects with 429 once the per-recipient send cap within the window is exceeded', async () => {
    // Use a fresh recipient so the count is not polluted by other tests sharing the activity store.
    const identifier = { type: SignInIdentifier.Email, value: generateEmail() } as const;
    const client = await initExperienceClient();

    // Sends up to the cap all succeed. The guard counts by recipient, independent of session.
    for (const _ of Array.from({ length: maxSendsPerRecipient })) {
      // eslint-disable-next-line no-await-in-loop
      await successfullySendVerificationCode(client, {
        interactionEvent: InteractionEvent.SignIn,
        identifier,
      });
    }

    // The next send to the same recipient exceeds the cap and is rejected.
    await expectRejects(
      client.sendVerificationCode({
        interactionEvent: InteractionEvent.SignIn,
        identifier,
      }),
      { code: 'request.message_rate_limited', status: 429 }
    );
  });

  it('counts the cap per recipient so a different recipient is unaffected', async () => {
    const cappedIdentifier = { type: SignInIdentifier.Email, value: generateEmail() } as const;
    const client = await initExperienceClient();

    for (const _ of Array.from({ length: maxSendsPerRecipient })) {
      // eslint-disable-next-line no-await-in-loop
      await successfullySendVerificationCode(client, {
        interactionEvent: InteractionEvent.SignIn,
        identifier: cappedIdentifier,
      });
    }

    await expectRejects(
      client.sendVerificationCode({
        interactionEvent: InteractionEvent.SignIn,
        identifier: cappedIdentifier,
      }),
      { code: 'request.message_rate_limited', status: 429 }
    );

    // The same session sending to a different recipient still succeeds: the bucket is keyed by
    // recipient, not by session.
    await successfullySendVerificationCode(client, {
      interactionEvent: InteractionEvent.SignIn,
      identifier: { type: SignInIdentifier.Email, value: generateEmail() },
    });
  });
});
