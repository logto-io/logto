import {
  InteractionEvent,
  InteractionHookEvent,
  MfaFactor,
  MfaPolicy,
  SignInIdentifier,
} from '@logto/schemas';
import { authenticator } from 'otplib';

import { createUserMfaVerification } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { isDevFeaturesEnabled } from '#src/constants.js';
import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import { resetPasswordlessConnectors } from '#src/helpers/connector.js';
import { identifyUserWithUsernamePassword } from '#src/helpers/experience/index.js';
import { successfullyVerifyTotp } from '#src/helpers/experience/totp-verification.js';
import { WebHookApiTest } from '#src/helpers/hook.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';

import WebhookMockServer from './WebhookMockServer.js';
import { assertHookLogResult } from './utils.js';

const webHookMockServer = new WebhookMockServer(9999);
const webHookApi = new WebHookApiTest();
const userApi = new UserApiTest();

beforeAll(async () => {
  await Promise.all([
    resetPasswordlessConnectors(),
    enableAllPasswordSignInMethods({
      identifiers: [SignInIdentifier.Username],
      password: true,
      verify: false,
    }),
    webHookMockServer.listen(),
  ]);
});

afterAll(async () => {
  await Promise.all([webHookApi.cleanUp(), userApi.cleanUp(), webHookMockServer.close()]);
});

describe('adaptive MFA experience hook trigger', () => {
  (isDevFeaturesEnabled ? it : it.skip)(
    'triggers adaptive MFA interaction hook when adaptive MFA is required',
    async () => {
      try {
        await updateSignInExperience({
          mfa: {
            factors: [MfaFactor.TOTP],
            policy: MfaPolicy.PromptAtSignInAndSignUp,
          },
          adaptiveMfa: { enabled: true },
        });

        await webHookApi.create({
          name: 'adaptiveMfaInteractionHookEventListener',
          events: [InteractionHookEvent.PostSignInAdaptiveMfaTriggered],
          config: { url: webHookMockServer.endpoint },
        });

        const { username, password } = generateNewUserProfile({ username: true, password: true });
        const user = await userApi.create({ username, password });
        const totpVerification = await createUserMfaVerification(user.id, MfaFactor.TOTP);

        if (totpVerification.type !== MfaFactor.TOTP) {
          throw new Error('unexpected mfa type');
        }

        const client = await initExperienceClient({
          extraHeaders: { 'x-logto-cf-bot-score': '10' },
        });
        await identifyUserWithUsernamePassword(client, username, password);
        await successfullyVerifyTotp(client, {
          code: authenticator.generate(totpVerification.secret),
        });

        const { redirectTo } = await client.submitInteraction();
        await processSession(client, redirectTo);
        await logoutClient(client);

        const adaptiveHook = webHookApi.hooks.get('adaptiveMfaInteractionHookEventListener')!;

        await assertHookLogResult(
          adaptiveHook,
          InteractionHookEvent.PostSignInAdaptiveMfaTriggered,
          {
            hookPayload: {
              event: InteractionHookEvent.PostSignInAdaptiveMfaTriggered,
              interactionEvent: InteractionEvent.SignIn,
              sessionId: expect.any(String),
              adaptiveMfaResult: expect.objectContaining({
                requiresMfa: true,
                triggeredRules: expect.arrayContaining([
                  expect.objectContaining({ rule: 'untrusted_ip' }),
                ]) as unknown,
              }),
              user: expect.objectContaining({ id: user.id, username }),
            },
          }
        );
      } finally {
        await updateSignInExperience({
          mfa: {
            factors: [],
            policy: MfaPolicy.PromptAtSignInAndSignUp,
          },
          adaptiveMfa: { enabled: false },
        });
      }
    }
  );
});
