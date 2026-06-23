/**
 * Comprehensive e2e tests for the Email Security Enhancements — send-time abuse protection
 * (LOG-13688 bug bash). Covers:
 *
 * A. Per-recipient send rate limit
 * B. Throttle observability (Message.RateLimited webhook)
 * C. Registration-disabled delivery suppression
 * D. Internal per-tenant override (ops-only, DB-level)
 */
import { ConnectorType } from '@logto/connector-kit';
import {
  defaultMessageRateLimitPolicy,
  InteractionEvent,
  SignInIdentifier,
  SignInMode,
  SentinelActivityAction,
} from '@logto/schemas';
import { assert } from '@silverhand/essentials';

import { deleteUser } from '#src/api/admin-user.js';
import { authedAdminApi } from '#src/api/api.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { initExperienceClient } from '#src/helpers/client.js';
import {
  clearConnectorsByTypes,
  setEmailConnector,
  setSmsConnector,
} from '#src/helpers/connector.js';
import { successfullySendVerificationCode } from '#src/helpers/experience/verification-code.js';
import { WebHookApiTest } from '#src/helpers/hook.js';
import {
  createUserByAdmin,
  expectRejects,
  readConnectorMessage,
  removeConnectorMessage,
} from '#src/helpers/index.js';
import {
  defaultSignInSignUpConfigs,
  enableAllVerificationCodeSignInMethods,
} from '#src/helpers/sign-in-experience.js';
import { devFeatureTest, generateEmail, generatePhone } from '#src/utils.js';

import WebhookMockServer from '../../hook/WebhookMockServer.js';
import { assertHookLogResult } from '../../hook/utils.js';

const { maxSendsPerRecipient } = defaultMessageRateLimitPolicy;

// ─── Section A: Per-recipient send rate limit ─────────────────────────────────

devFeatureTest.describe('A. Per-recipient send rate limit', () => {
  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
    await setEmailConnector();
    await setSmsConnector();
    await enableAllVerificationCodeSignInMethods();
  });

  afterAll(async () => {
    await updateSignInExperience(defaultSignInSignUpConfigs);
  });

  // A3: Shared pool across interaction types — SignIn + Register share VerificationCodeSend bucket.
  // Note: ForgotPassword to unregistered emails gets delivery-suppressed and bypasses the rate
  // guard, so we test with SignIn + Register which both go through the guard.
  it('A3 — shared VerificationCodeSend pool across interaction event types', async () => {
    const email = generateEmail();
    const identifier = { type: SignInIdentifier.Email, value: email } as const;

    // Send 5 as SignIn
    for (const _ of Array.from({ length: 5 })) {
      // eslint-disable-next-line no-await-in-loop
      const client = await initExperienceClient({ interactionEvent: InteractionEvent.SignIn });
      // eslint-disable-next-line no-await-in-loop
      await successfullySendVerificationCode(client, {
        interactionEvent: InteractionEvent.SignIn,
        identifier,
      });
    }

    // Send 5 as Register (same VerificationCodeSend pool)
    for (const _ of Array.from({ length: 5 })) {
      // eslint-disable-next-line no-await-in-loop
      const client = await initExperienceClient({
        interactionEvent: InteractionEvent.Register,
      });
      // eslint-disable-next-line no-await-in-loop
      await successfullySendVerificationCode(client, {
        interactionEvent: InteractionEvent.Register,
        identifier,
      });
    }

    // 11th send (any type) should be rejected
    const client = await initExperienceClient({ interactionEvent: InteractionEvent.SignIn });
    await expectRejects(
      client.sendVerificationCode({ interactionEvent: InteractionEvent.SignIn, identifier }),
      { code: 'request.message_rate_limited', status: 429 }
    );
  });

  // A4: Normalization — case variants share the same bucket
  it('A4 — email case normalization prevents cap bypass', async () => {
    const domain = 'rate-limit-test.io';
    const localPart = generateEmail(domain).split('@')[0]!;
    const lowerEmail = `${localPart}@${domain}`;
    const upperEmail = `${localPart.toUpperCase()}@${domain.toUpperCase()}`;

    // Send 5 codes to lowercase variant
    for (const _ of Array.from({ length: 5 })) {
      // eslint-disable-next-line no-await-in-loop
      const client = await initExperienceClient({ interactionEvent: InteractionEvent.SignIn });
      // eslint-disable-next-line no-await-in-loop
      await successfullySendVerificationCode(client, {
        interactionEvent: InteractionEvent.SignIn,
        identifier: { type: SignInIdentifier.Email, value: lowerEmail },
      });
    }

    // Send 5 codes to UPPERCASE variant
    for (const _ of Array.from({ length: 5 })) {
      // eslint-disable-next-line no-await-in-loop
      const client = await initExperienceClient({ interactionEvent: InteractionEvent.SignIn });
      // eslint-disable-next-line no-await-in-loop
      await successfullySendVerificationCode(client, {
        interactionEvent: InteractionEvent.SignIn,
        identifier: { type: SignInIdentifier.Email, value: upperEmail },
      });
    }

    // 11th to either casing should be rejected
    const client = await initExperienceClient({ interactionEvent: InteractionEvent.SignIn });
    await expectRejects(
      client.sendVerificationCode({
        interactionEvent: InteractionEvent.SignIn,
        identifier: { type: SignInIdentifier.Email, value: lowerEmail },
      }),
      { code: 'request.message_rate_limited', status: 429 }
    );
  });

  // A5: SMS path is throttled
  it('A5 — SMS sends are throttled identically', async () => {
    const phone = generatePhone();
    const identifier = { type: SignInIdentifier.Phone, value: phone } as const;

    for (const _ of Array.from({ length: maxSendsPerRecipient })) {
      // eslint-disable-next-line no-await-in-loop
      const client = await initExperienceClient({ interactionEvent: InteractionEvent.SignIn });
      // eslint-disable-next-line no-await-in-loop
      await successfullySendVerificationCode(client, {
        interactionEvent: InteractionEvent.SignIn,
        identifier,
      });
    }

    const client = await initExperienceClient({ interactionEvent: InteractionEvent.SignIn });
    await expectRejects(
      client.sendVerificationCode({ interactionEvent: InteractionEvent.SignIn, identifier }),
      { code: 'request.message_rate_limited', status: 429 }
    );
  });

  // A7 (part 2): Organization invitations use a SEPARATE pool from verification codes
  it('A7 — org invitation pool is separate from verification code pool', async () => {
    const email = generateEmail();
    const identifier = { type: SignInIdentifier.Email, value: email } as const;

    // Exhaust the VerificationCodeSend pool for this recipient
    for (const _ of Array.from({ length: maxSendsPerRecipient })) {
      // eslint-disable-next-line no-await-in-loop
      const client = await initExperienceClient({ interactionEvent: InteractionEvent.SignIn });
      // eslint-disable-next-line no-await-in-loop
      await successfullySendVerificationCode(client, {
        interactionEvent: InteractionEvent.SignIn,
        identifier,
      });
    }

    // Verify verification code sends are indeed capped
    const client = await initExperienceClient({ interactionEvent: InteractionEvent.SignIn });
    await expectRejects(
      client.sendVerificationCode({ interactionEvent: InteractionEvent.SignIn, identifier }),
      { code: 'request.message_rate_limited', status: 429 }
    );

    // Organization invitation to the SAME email should still succeed (separate MessageSend pool)
    const orgResponse = await authedAdminApi.post('organizations', {
      json: { name: 'rate-limit-test-org' },
    });
    const org = await orgResponse.json<{ id: string }>();

    try {
      const invitationResponse = await authedAdminApi.post('organization-invitations', {
        json: {
          organizationId: org.id,
          invitee: email,
          expiresAt: Date.now() + 1_000_000,
        },
      });
      const invitation = await invitationResponse.json<{ id: string }>();

      // Resend invitation message — this uses the MessageSend pool
      const resendResponse = await authedAdminApi.post(
        `organization-invitations/${invitation.id}/message`,
        { json: { link: 'https://example.com' } }
      );
      expect(resendResponse.status).toBe(204);
    } finally {
      await authedAdminApi.delete(`organizations/${org.id}`);
    }
  });
});

// ─── Section B: Throttle observability ────────────────────────────────────────

devFeatureTest.describe('B. Throttle observability', () => {
  const webHookMockServer = new WebhookMockServer(9998);
  const webHookApi = new WebHookApiTest();
  const hookName = 'bugBashMessageRateLimitedListener';

  beforeAll(async () => {
    await webHookMockServer.listen();
    await clearConnectorsByTypes([ConnectorType.Email]);
    await setEmailConnector();
    await enableAllVerificationCodeSignInMethods();
    await webHookApi.create({
      name: hookName,
      events: ['Message.RateLimited'],
      config: { url: webHookMockServer.endpoint },
    });
  });

  afterAll(async () => {
    await Promise.all([webHookApi.cleanUp(), webHookMockServer.close()]);
    await updateSignInExperience(defaultSignInSignUpConfigs);
  });

  // B2: No false-positive events for under-cap sends
  it('B2 — no Message.RateLimited event for under-cap sends', async () => {
    const identifier = { type: SignInIdentifier.Email, value: generateEmail() } as const;
    const client = await initExperienceClient({ interactionEvent: InteractionEvent.SignIn });

    // Send 3 codes (well under cap)
    for (const _ of Array.from({ length: 3 })) {
      // eslint-disable-next-line no-await-in-loop
      await successfullySendVerificationCode(client, {
        interactionEvent: InteractionEvent.SignIn,
        identifier,
      });
    }

    // Assert no hook log was generated for this hook
    await assertHookLogResult(webHookApi.hooks.get(hookName)!, 'Message.RateLimited', {
      toBeUndefined: true,
    });
  });

  // B1: Webhook fires on throttle
  it('B1 — Message.RateLimited webhook fires when cap is exceeded', async () => {
    const identifier = { type: SignInIdentifier.Email, value: generateEmail() } as const;

    // Exhaust the cap
    for (const _ of Array.from({ length: maxSendsPerRecipient })) {
      // eslint-disable-next-line no-await-in-loop
      const client = await initExperienceClient({ interactionEvent: InteractionEvent.SignIn });
      // eslint-disable-next-line no-await-in-loop
      await successfullySendVerificationCode(client, {
        interactionEvent: InteractionEvent.SignIn,
        identifier,
      });
    }

    // Trigger throttle
    const client = await initExperienceClient({ interactionEvent: InteractionEvent.SignIn });
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

// ─── Section C: Registration-disabled delivery suppression ────────────────────

devFeatureTest.describe('C. Registration-disabled delivery suppression', () => {
  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
    await setEmailConnector();
    await setSmsConnector();
  });

  afterAll(async () => {
    await updateSignInExperience(defaultSignInSignUpConfigs);
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
  });

  // C3: Registration enabled → no suppression
  it('C3 — delivers to unregistered email when registration is enabled', async () => {
    await updateSignInExperience({
      signInMode: SignInMode.SignInAndRegister,
      signUp: {
        identifiers: [SignInIdentifier.Email],
        password: false,
        verify: true,
      },
      signIn: {
        methods: [
          {
            identifier: SignInIdentifier.Email,
            password: false,
            verificationCode: true,
            isPasswordPrimary: false,
          },
        ],
      },
    });

    const email = generateEmail();
    const client = await initExperienceClient({ interactionEvent: InteractionEvent.SignIn });
    await removeConnectorMessage('Email');

    const { verificationId } = await client.sendVerificationCode({
      interactionEvent: InteractionEvent.SignIn,
      identifier: { type: SignInIdentifier.Email, value: email },
    });

    expect(verificationId).toBeTruthy();
    // Email IS delivered when registration is enabled
    const emailMessage = await readConnectorMessage('Email');
    expect(emailMessage.address).toBe(email);
    expect(emailMessage.code).toBeTruthy();
  });

  // C4: Forgot-password suppression for unregistered email (pre-existing, regression check)
  it('C4 — forgot-password code not delivered to unregistered email', async () => {
    await updateSignInExperience({
      signInMode: SignInMode.SignInAndRegister,
      signUp: {
        identifiers: [SignInIdentifier.Username],
        password: true,
        verify: false,
      },
      signIn: {
        methods: [
          {
            identifier: SignInIdentifier.Email,
            password: true,
            verificationCode: true,
            isPasswordPrimary: false,
          },
        ],
      },
    });

    const email = generateEmail();
    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.ForgotPassword,
    });
    await removeConnectorMessage('Email');

    const { verificationId } = await client.sendVerificationCode({
      interactionEvent: InteractionEvent.ForgotPassword,
      identifier: { type: SignInIdentifier.Email, value: email },
    });

    // API returns 200 with a verificationId (anti-enumeration)
    expect(verificationId).toBeTruthy();
    // But no email is delivered
    await expect(readConnectorMessage('Email')).rejects.toThrow();

    // Verifying returns code_mismatch, not user-not-found
    await expectRejects(
      client.verifyVerificationCode({
        identifier: { type: SignInIdentifier.Email, value: email },
        verificationId,
        code: 'invalid_code',
      }),
      { code: 'verification_code.code_mismatch', status: 400 }
    );
  });

  // C5: Identified session suppression bypass — verification code delivers even to unregistered
  // email when the session is identified (the `!identifiedUserId` guard ensures suppression only
  // applies to anonymous sessions).
  it('C5 — identified session delivers verification code to unregistered email (registration disabled)', async () => {
    await updateSignInExperience({
      signInMode: SignInMode.SignIn,
      signUp: {
        identifiers: [SignInIdentifier.Username],
        password: true,
        verify: false,
      },
      signIn: {
        methods: [
          {
            identifier: SignInIdentifier.Username,
            password: true,
            verificationCode: false,
            isPasswordPrimary: true,
          },
          {
            identifier: SignInIdentifier.Email,
            password: false,
            verificationCode: true,
            isPasswordPrimary: false,
          },
        ],
      },
    });

    // Create a user and sign in with password to get an identified session
    const password = 'test_Password123!';
    const { id: userId, username } = await createUserByAdmin({ password });
    assert(username, new Error('Expected createUserByAdmin to return a username'));

    try {
      const client = await initExperienceClient({ interactionEvent: InteractionEvent.SignIn });
      const { verificationId: pwVerificationId } = await client.verifyPassword({
        identifier: { type: SignInIdentifier.Username, value: username },
        password,
      });
      await client.identifyUser({ verificationId: pwVerificationId });

      // Send a verification code to a NEW email no user owns — from an identified session
      const newEmail = generateEmail();
      await removeConnectorMessage('Email');

      const { verificationId } = await client.sendVerificationCode({
        interactionEvent: InteractionEvent.SignIn,
        identifier: { type: SignInIdentifier.Email, value: newEmail },
      });

      // The code MUST be delivered because the session is identified — suppression never applies
      expect(verificationId).toBeTruthy();
      const emailMessage = await readConnectorMessage('Email');
      expect(emailMessage.address).toBe(newEmail);
      expect(emailMessage.code).toBeTruthy();
    } finally {
      await deleteUser(userId);
    }
  });

  // C6: Account Center /api/verifications/verification-code path delivers to an unowned email.
  // This path never goes through the experience interaction suppression logic.
  it('C6 — account verification-code API delivers to a new email (never suppresses)', async () => {
    await updateSignInExperience({
      signInMode: SignInMode.SignIn,
      signUp: {
        identifiers: [SignInIdentifier.Username],
        password: true,
        verify: false,
      },
      signIn: {
        methods: [
          {
            identifier: SignInIdentifier.Username,
            password: true,
            verificationCode: false,
            isPasswordPrimary: true,
          },
        ],
      },
    });

    // The management API verification-code endpoint doesn't do suppression.
    // Use it to send a code to an unregistered email — it must always deliver.
    const email = generateEmail();
    await removeConnectorMessage('Email');

    const response = await authedAdminApi.post('verification-codes', { json: { email } });
    expect(response.status).toBe(204);

    const emailMessage = await readConnectorMessage('Email');
    expect(emailMessage.address).toBe(email);
    expect(emailMessage.code).toBeTruthy();
  });
});

// ─── Section D: Internal per-tenant override ──────────────────────────────────

devFeatureTest.describe('D. Internal per-tenant override (ops-only, DB-level)', () => {
  // D2: Override is not API/UI-exposed (negative test)
  it('D2 — no management API endpoint exposes messageRateLimitOverride', async () => {
    // The logto_configs key `messageRateLimitOverride` should NOT be accessible via any API.
    // Try to read it through known management API paths:
    const response = await authedAdminApi.get('configs/messageRateLimitOverride', {
      throwHttpErrors: false,
    });
    // Either 400 (invalid key) or 404 (route not found) — never 200
    expect(response.status).toBeGreaterThanOrEqual(400);
  });
});
