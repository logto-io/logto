import { type HookEvent, InteractionHookEvent } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';
import ky from 'ky';

const { jest } = import.meta;

const { mockEsm, mockEsmWithActual } = createMockUtils(jest);

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
  it('should call got.post with correct values', async () => {
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

    expect(post).toBeCalledWith(mockUrl, {
      headers: {
        'user-agent': 'Logto (https://logto.io/)',
        foo: 'bar',
        'logto-signature-sha-256': mockSignature,
      },
      json: testPayload,
      retry: { limit: 3 },
      timeout: 10_000,
    });
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
