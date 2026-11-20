import { type HookEvent, InteractionHookEvent } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';
import ky, { type KyResponse } from 'ky';

import { ssrfProtectedFetch } from '#src/utils/outbound-request.js';

const { jest } = import.meta;

const { mockEsm } = createMockUtils(jest);

const post = jest
  .spyOn(ky, 'post')
  // @ts-expect-error
  .mockImplementation(jest.fn(async () => ({ statusCode: 200, body: '{"message":"ok"}' })));

const mockSignature = 'mockSignature';
const sign = jest.fn(() => mockSignature);
mockEsm('#src/utils/sign.js', () => ({
  sign,
}));

const {
  generateHookTestPayload,
  parseResponse,
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

  it('sends and signs a pre-serialized body string with default content-type', async () => {
    const rawBody = '{"b":1,"a":2}';

    await sendWebhookRequest({
      hookConfig: {
        url: 'https://logto.gg',
        headers: { foo: 'bar' },
      },
      body: rawBody,
      signingKey: 'mockSigningKey',
    });

    expect(sign).toHaveBeenLastCalledWith('mockSigningKey', rawBody);
    expect(post.mock.lastCall?.[1]).toMatchObject({
      body: rawBody,
      headers: {
        'user-agent': 'Logto (https://logto.io/)',
        'content-type': 'application/json',
        foo: 'bar',
        'logto-signature-sha-256': mockSignature,
      },
    });
    expect(post.mock.lastCall?.[1]).not.toHaveProperty('json');
  });

  it('preserves a custom Content-Type header when sending a raw body string', async () => {
    const rawBody = '{"b":1,"a":2}';

    await sendWebhookRequest({
      hookConfig: {
        url: 'https://logto.gg',
        headers: { 'Content-Type': 'application/cloudevents+json' },
      },
      body: rawBody,
      signingKey: 'mockSigningKey',
    });

    const requestOptions = post.mock.lastCall?.[1] as { headers?: Record<string, string> };
    expect(requestOptions.headers).toEqual({
      'user-agent': 'Logto (https://logto.io/)',
      'Content-Type': 'application/cloudevents+json',
      'logto-signature-sha-256': mockSignature,
    });
    expect(requestOptions.headers).not.toHaveProperty('content-type');
  });

  it('forwards signal to ky when supplied and omits it otherwise', async () => {
    await sendWebhookRequest({
      hookConfig: { url: 'https://logto.gg' },
      body: '{"ok":true}',
      signingKey: 'mockSigningKey',
    });
    expect(post.mock.lastCall?.[1]).not.toHaveProperty('signal');

    const controller = new AbortController();
    await sendWebhookRequest({
      hookConfig: { url: 'https://logto.gg' },
      body: '{"ok":true}',
      signingKey: 'mockSigningKey',
      signal: controller.signal,
    });
    expect(post.mock.lastCall?.[1]).toMatchObject({ signal: controller.signal });
  });

  it('throws immediately without calling ky when signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort(new Error('deadline exceeded'));
    const callCountBefore = post.mock.calls.length;

    await expect(
      sendWebhookRequest({
        hookConfig: { url: 'https://logto.gg' },
        body: '{"ok":true}',
        signingKey: 'mockSigningKey',
        signal: controller.signal,
      })
    ).rejects.toThrow('deadline exceeded');
    expect(post).toHaveBeenCalledTimes(callCountBefore);
  });
});

describe('parseResponse', () => {
  it('parses JSON and plain text normally when signal is active', async () => {
    const controller = new AbortController();

    await expect(
      parseResponse(new Response('{"ok":true}', { status: 200 }) as KyResponse, controller.signal)
    ).resolves.toEqual({ statusCode: 200, body: { ok: true } });

    await expect(
      parseResponse(new Response('plain text', { status: 502 }) as KyResponse, controller.signal)
    ).resolves.toEqual({ statusCode: 502, body: 'plain text' });
  });

  it('cancels response body and rejects immediately when signal is already aborted', async () => {
    const cancel = jest.fn(async () => {
      await Promise.resolve();
    });
    const stream = new ReadableStream({
      cancel,
    });
    const controller = new AbortController();
    controller.abort(new Error('already aborted'));

    await expect(
      parseResponse(new Response(stream, { status: 200 }) as KyResponse, controller.signal)
    ).rejects.toThrow('already aborted');
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it('cancels response body and rejects when signal aborts while response.text() is pending', async () => {
    const cancel = jest.fn(async () => {
      await Promise.resolve();
    });
    const pendingResponse = {
      status: 200,
      body: { cancel },
      text: async () =>
        new Promise<string>((resolve) => {
          void resolve;
        }),
    } as unknown as KyResponse;
    const controller = new AbortController();

    const parsedPromise = parseResponse(pendingResponse, controller.signal);
    controller.abort(new Error('body read timed out'));

    await expect(parsedPromise).rejects.toThrow('body read timed out');
    expect(cancel).toHaveBeenCalledTimes(1);
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
