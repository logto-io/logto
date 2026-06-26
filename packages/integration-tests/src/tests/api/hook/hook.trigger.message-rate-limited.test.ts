import {
  defaultMessageRateLimitPolicy,
  InteractionEvent,
  SentinelActivityAction,
  SignInIdentifier,
} from '@logto/schemas';

import { initExperienceClient } from '#src/helpers/client.js';
import { resetPasswordlessConnectors } from '#src/helpers/connector.js';
import { successfullySendVerificationCode } from '#src/helpers/experience/verification-code.js';
import { WebHookApiTest } from '#src/helpers/hook.js';
import { expectRejects } from '#src/helpers/index.js';
import { enableAllVerificationCodeSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateEmail } from '#src/utils.js';

import WebhookMockServer from './WebhookMockServer.js';
import { assertHookLogResult } from './utils.js';

const { maxSendsPerRecipient } = defaultMessageRateLimitPolicy;

const webHookMockServer = new WebhookMockServer(9999);
const webHookApi = new WebHookApiTest();
const hookName = 'messageRateLimitedHookEventListener';

describe('trigger `Message.RateLimited` exception hook', () => {
  beforeAll(async () => {
    // Provision the mock email connector (so codes can be sent and read) and allow email
    // verification-code sign-in, then register a listener for the exception hook event.
    await webHookMockServer.listen();
    await resetPasswordlessConnectors();
    await enableAllVerificationCodeSignInMethods();
    await webHookApi.create({
      name: hookName,
      events: ['Message.RateLimited'],
      config: { url: webHookMockServer.endpoint },
    });
  });

  afterAll(async () => {
    await Promise.all([webHookApi.cleanUp(), webHookMockServer.close()]);
  });

  it('logs the `Message.RateLimited` hook once the recipient send cap is exceeded', async () => {
    const identifier = { type: SignInIdentifier.Email, value: generateEmail() } as const;
    const client = await initExperienceClient();

    // Sends up to the cap all succeed; the guard counts by recipient.
    for (const _ of Array.from({ length: maxSendsPerRecipient })) {
      // eslint-disable-next-line no-await-in-loop -- sequential sends required to reach the cap deterministically
      await successfullySendVerificationCode(client, {
        interactionEvent: InteractionEvent.SignIn,
        identifier,
      });
    }

    // The next send exceeds the cap: it is rejected with the dedicated code, which fires the hook.
    await expectRejects(
      client.sendVerificationCode({ interactionEvent: InteractionEvent.SignIn, identifier }),
      { code: 'request.message_rate_limited', status: 429 }
    );

    await assertHookLogResult(webHookApi.hooks.get(hookName)!, 'Message.RateLimited', {
      hookPayload: {
        event: 'Message.RateLimited',
        action: SentinelActivityAction.VerificationCodeSend,
        recipient: identifier.value,
      },
    });
  });
});
