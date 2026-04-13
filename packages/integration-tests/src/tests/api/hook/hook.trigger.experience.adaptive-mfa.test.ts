import {
  InteractionEvent,
  InteractionHookEvent,
  MfaFactor,
  MfaPolicy,
  SignInIdentifier,
} from '@logto/schemas';
import { authenticator } from 'otplib';

import { createUserMfaVerification } from '#src/api/admin-user.js';
import { getWebhookRecentLogs } from '#src/api/logs.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import { resetPasswordlessConnectors } from '#src/helpers/connector.js';
import { identifyUserWithUsernamePassword } from '#src/helpers/experience/index.js';
import { successfullyVerifyTotp } from '#src/helpers/experience/totp-verification.js';
import { WebHookApiTest } from '#src/helpers/hook.js';
import { expectRejects } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';
import { devFeatureTest, waitFor } from '#src/utils.js';

import WebhookMockServer from './WebhookMockServer.js';
import { assertHookLogResult } from './utils.js';

const webHookMockServer = new WebhookMockServer(9999);
const webHookApi = new WebHookApiTest();
const userApi = new UserApiTest();

const getHookLogs = async (hookId: string, event: InteractionHookEvent) => {
  await waitFor(100);

  return getWebhookRecentLogs(
    hookId,
    new URLSearchParams({ logKey: `TriggerHook.${event}`, page_size: '10' })
  );
};

devFeatureTest.describe('adaptive MFA experience hook trigger', () => {
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

  it('triggers adaptive MFA once per sign-in flow and keeps PostSignIn success-only', async () => {
    try {
      await updateSignInExperience({
        mfa: {
          factors: [MfaFactor.TOTP],
          policy: MfaPolicy.PromptAtSignInAndSignUpMandatory,
        },
        adaptiveMfa: { enabled: true },
      });

      await Promise.all([
        webHookApi.create({
          name: 'adaptiveMfaFailedSubmitHookEventListener',
          events: [InteractionHookEvent.PostSignInAdaptiveMfaTriggered],
          config: { url: webHookMockServer.endpoint },
        }),
        webHookApi.create({
          name: 'postSignInHookEventListener',
          events: [InteractionHookEvent.PostSignIn],
          config: { url: webHookMockServer.endpoint },
        }),
      ]);

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

      await expectRejects(client.submitInteraction(), {
        code: 'session.mfa.require_mfa_verification',
        status: 403,
        expectData: (data: { availableFactors: string[] }) => {
          expect(data.availableFactors).toEqual([MfaFactor.TOTP]);
        },
      });

      const adaptiveHook = webHookApi.hooks.get('adaptiveMfaFailedSubmitHookEventListener')!;
      const postSignInHook = webHookApi.hooks.get('postSignInHookEventListener')!;

      await assertHookLogResult(adaptiveHook, InteractionHookEvent.PostSignInAdaptiveMfaTriggered, {
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
      });

      expect(await getHookLogs(postSignInHook.id, InteractionHookEvent.PostSignIn)).toHaveLength(0);
      expect(
        await getHookLogs(adaptiveHook.id, InteractionHookEvent.PostSignInAdaptiveMfaTriggered)
      ).toHaveLength(1);

      await successfullyVerifyTotp(client, {
        code: authenticator.generate(totpVerification.secret),
      });

      const { redirectTo } = await client.submitInteraction();
      await processSession(client, redirectTo);
      await logoutClient(client);

      expect(
        await getHookLogs(adaptiveHook.id, InteractionHookEvent.PostSignInAdaptiveMfaTriggered)
      ).toHaveLength(1);
      expect(await getHookLogs(postSignInHook.id, InteractionHookEvent.PostSignIn)).toHaveLength(1);

      await assertHookLogResult(postSignInHook, InteractionHookEvent.PostSignIn, {
        hookPayload: {
          event: InteractionHookEvent.PostSignIn,
          interactionEvent: InteractionEvent.SignIn,
          sessionId: expect.any(String),
          user: expect.objectContaining({ id: user.id, username }),
        },
      });
    } finally {
      await updateSignInExperience({
        mfa: {
          factors: [],
          policy: MfaPolicy.PromptAtSignInAndSignUp,
        },
        adaptiveMfa: { enabled: false },
      });
    }
  });
});
