import { type HookEvent, InteractionHookEvent } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';
import ky from 'ky';

import { ssrfProtectedFetch } from '#src/utils/outbound-request.js';

const { jest } = import.meta;

const { mockEsm } = createMockUtils(jest);

const post = jest
  .spyOn(ky, 'post')
  // @ts-expect-error
  .mockImplementation(jest.fn(async () => ({ statusCode: 200, body: '{"message":"ok"}' })));

const mockSignature = 'mockSignature';
mockEsm('#src/utils/sign.js', () => ({
  sign: () => mockSignature,
}));

const {
  generateHookTestPayload,
  sendWebhookRequest,
  truncateMembershipDelta,
  MEMBERSHIP_DELTA_CAP,
} = await import('./utils.js');

describe('sendWebhookRequest', () => {
  it('sends a signed webhook request with the default retry limit', async () => {
    const mockHookId = 'mockHookId';
    const mockEvent: HookEvent = InteractionHookEvent.PostSignIn;
    const testPayload = generateHookTestPayload(mockHookId, mockEvent);

    const mockUrl = 'https://logto.gg';
    const mockSigningKey = 'mockSigningKey';

    await sendWebhookRequest({
      hookConfig: {
        url: mockUrl,
        headers: { foo: 'bar' },
      },
      payload: testPayload,
      signingKey: mockSigningKey,
    });

    expect(post.mock.calls[0]?.[0]).toBe(mockUrl);
    expect(post.mock.calls[0]?.[1]).toMatchObject({
      headers: {
        'user-agent': 'Logto (https://logto.io/)',
        foo: 'bar',
        'logto-signature-sha-256': mockSignature,
      },
      json: testPayload,
      retry: {
        limit: 3,
        methods: ['post'],
      },
      timeout: 10_000,
    });
    expect(post.mock.calls[0]?.[1]).toEqual(
      expect.objectContaining({
        hooks: {
          afterResponse: [expect.any(Function)],
          beforeRetry: [expect.any(Function)],
        },
      })
    );
  });

  it('passes hook config retries through to ky', async () => {
    const mockHookId = 'mockHookId';
    const mockEvent: HookEvent = InteractionHookEvent.PostSignIn;
    const testPayload = generateHookTestPayload(mockHookId, mockEvent);

    await sendWebhookRequest({
      hookConfig: {
        url: 'https://logto.gg',
        retries: 1,
      },
      payload: testPayload,
      signingKey: 'mockSigningKey',
    });

    expect(post.mock.lastCall?.[0]).toBe('https://logto.gg');
    expect(post.mock.lastCall?.[1]).toMatchObject({
      fetch: ssrfProtectedFetch,
      headers: {
        'user-agent': 'Logto (https://logto.io/)',
        'logto-signature-sha-256': mockSignature,
      },
      json: testPayload,
      retry: {
        limit: 1,
        methods: ['post'],
      },
      timeout: 10_000,
    });
    expect(post.mock.lastCall?.[1]).toEqual(
      expect.objectContaining({
        hooks: {
          afterResponse: [expect.any(Function)],
          beforeRetry: [expect.any(Function)],
        },
      })
    );
  });
});

describe('truncateMembershipDelta', () => {
  it('passes non-empty arrays at or below cap through unchanged', () => {
    const out = truncateMembershipDelta({ addedUserIds: ['u1', 'u2'] });
    expect(out).toEqual({ addedUserIds: ['u1', 'u2'] });
  });

  it('omits empty and absent fields so empty-delta operations carry no marker', () => {
    expect(truncateMembershipDelta({ addedUserIds: ['u1'], removedUserIds: [] })).toEqual({
      addedUserIds: ['u1'],
    });
    expect(truncateMembershipDelta({ addedUserIds: [], removedUserIds: [] })).toEqual({});
    expect(truncateMembershipDelta({})).toEqual({});
  });

  it('caps each oversized array independently across all four fields', () => {
    const oversized = Array.from({ length: MEMBERSHIP_DELTA_CAP + 100 }, (_, index) => `u${index}`);
    const out = truncateMembershipDelta({
      addedUserIds: oversized,
      removedUserIds: ['u1'],
      addedApplicationIds: oversized,
      removedApplicationIds: oversized,
    });
    expect(out.addedUserIds).toHaveLength(MEMBERSHIP_DELTA_CAP);
    expect(out.addedApplicationIds).toHaveLength(MEMBERSHIP_DELTA_CAP);
    expect(out.removedApplicationIds).toHaveLength(MEMBERSHIP_DELTA_CAP);
    expect(out.removedUserIds).toEqual(['u1']);
  });
});
