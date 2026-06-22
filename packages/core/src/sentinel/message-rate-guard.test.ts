import {
  SentinelActionResult,
  SentinelActivityAction,
  SentinelActivityTargetType,
  SentinelDecision,
  defaultMessageRateLimitPolicy,
  type MessageRateLimitPolicy,
} from '@logto/schemas';

const { jest } = import.meta;

const { MessageRateGuard, withMessageRateGuard, buildMessageRateGuard } = await import(
  './message-rate-guard.js'
);

const policy: MessageRateLimitPolicy = { sendWindow: 60, maxSendsPerRecipient: 3 };
const action = SentinelActivityAction.VerificationCodeSend;
const recipient = 'recipient@example.com';

const countActivities = jest.fn();
const insertActivity = jest.fn();
const getMessageRateLimitOverride = jest.fn();

const buildGuard = () => new MessageRateGuard({ countActivities, insertActivity }, policy);

const buildFactoryQueries = () => ({
  sentinelActivities: { countActivities, insertActivity },
  logtoConfigs: { getMessageRateLimitOverride },
});

beforeEach(() => {
  countActivities.mockReset();
  insertActivity.mockReset();
  getMessageRateLimitOverride.mockReset();
});

describe('MessageRateGuard', () => {
  it('allows a send below the per-recipient cap', async () => {
    countActivities.mockResolvedValueOnce(2);

    await expect(buildGuard().guard(action, recipient)).resolves.toBeUndefined();
    expect(countActivities).toHaveBeenCalledWith(
      expect.objectContaining({
        targetType: SentinelActivityTargetType.User,
        action,
        windowSeconds: 60,
      })
    );
  });

  it('rejects with 429 when the recipient is at the cap', async () => {
    countActivities.mockResolvedValueOnce(3);

    await expect(buildGuard().guard(action, recipient)).rejects.toMatchObject({
      code: 'request.message_rate_limited',
      status: 429,
    });
  });

  it('records a successful send', async () => {
    await buildGuard().record(action, recipient);

    expect(insertActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        targetType: SentinelActivityTargetType.User,
        action,
        actionResult: SentinelActionResult.Success,
        decision: SentinelDecision.Allowed,
        payload: {},
      })
    );
  });

  it('fails open (does not throw) when the count query fails', async () => {
    countActivities.mockRejectedValueOnce(new Error('db unavailable'));

    await expect(buildGuard().guard(action, recipient)).resolves.toBeUndefined();
  });

  it('buckets email casing/whitespace variants together', async () => {
    countActivities.mockResolvedValue(0);
    const guard = buildGuard();

    await guard.guard(action, '  Foo@Example.com ');
    await guard.guard(action, 'foo@example.com');

    expect(countActivities.mock.calls[0]?.[0].targetHash).toBe(
      countActivities.mock.calls[1]?.[0].targetHash
    );
  });

  it('buckets phone formatting variants together', async () => {
    countActivities.mockResolvedValue(0);
    const guard = buildGuard();

    await guard.guard(action, '+1 (650) 253-0000');
    await guard.guard(action, '16502530000');

    expect(countActivities.mock.calls[0]?.[0].targetHash).toBe(
      countActivities.mock.calls[1]?.[0].targetHash
    );
  });

  it('hashes the normalized recipient on both guard and record', async () => {
    countActivities.mockResolvedValue(0);
    const guard = buildGuard();

    await guard.guard(action, 'Foo@Example.com');
    await guard.record(action, 'foo@example.com');

    expect(insertActivity.mock.calls[0]?.[0].targetHash).toBe(
      countActivities.mock.calls[0]?.[0].targetHash
    );
  });

  it('does not throw when recording the send fails', async () => {
    insertActivity.mockRejectedValueOnce(new Error('db unavailable'));

    await expect(buildGuard().record(action, recipient)).resolves.toBeUndefined();
  });
});

describe('withMessageRateGuard', () => {
  it('sends and records when under the cap', async () => {
    countActivities.mockResolvedValueOnce(0);
    const send = jest.fn().mockResolvedValueOnce('sent');

    await expect(withMessageRateGuard(buildGuard(), { action, recipient }, send)).resolves.toBe(
      'sent'
    );
    expect(send).toHaveBeenCalledTimes(1);
    expect(insertActivity).toHaveBeenCalledTimes(1);
  });

  it('does not send when over the cap', async () => {
    countActivities.mockResolvedValueOnce(3);
    const send = jest.fn();

    await expect(
      withMessageRateGuard(buildGuard(), { action, recipient }, send)
    ).rejects.toMatchObject({ status: 429 });
    expect(send).not.toHaveBeenCalled();
    expect(insertActivity).not.toHaveBeenCalled();
  });

  it('invokes onRateLimited then rethrows when over the cap', async () => {
    countActivities.mockResolvedValueOnce(3);
    const send = jest.fn();
    const onRateLimited = jest.fn();

    await expect(
      withMessageRateGuard(buildGuard(), { action, recipient, onRateLimited }, send)
    ).rejects.toMatchObject({ code: 'request.message_rate_limited', status: 429 });
    expect(onRateLimited).toHaveBeenCalledTimes(1);
    expect(send).not.toHaveBeenCalled();
  });

  it('does not invoke onRateLimited when under the cap', async () => {
    countActivities.mockResolvedValueOnce(0);
    const send = jest.fn().mockResolvedValueOnce('sent');
    const onRateLimited = jest.fn();

    await withMessageRateGuard(buildGuard(), { action, recipient, onRateLimited }, send);
    expect(onRateLimited).not.toHaveBeenCalled();
  });

  it('still sends when the rate-limit query fails (fails open)', async () => {
    countActivities.mockRejectedValueOnce(new Error('db unavailable'));
    const send = jest.fn().mockResolvedValueOnce('sent');

    await expect(withMessageRateGuard(buildGuard(), { action, recipient }, send)).resolves.toBe(
      'sent'
    );
    expect(send).toHaveBeenCalledTimes(1);
  });
});

describe('buildMessageRateGuard', () => {
  it('uses the system default policy when no override is set', async () => {
    getMessageRateLimitOverride.mockResolvedValueOnce(null);
    countActivities.mockResolvedValueOnce(0);

    const guard = await buildMessageRateGuard(buildFactoryQueries());
    await guard.guard(action, recipient);

    expect(countActivities).toHaveBeenCalledWith(
      expect.objectContaining({ windowSeconds: defaultMessageRateLimitPolicy.sendWindow })
    );
  });

  it('merges a partial override over the system default per field', async () => {
    // Override only the cap; the window is left to fall back to the system default.
    getMessageRateLimitOverride.mockResolvedValueOnce({ maxSendsPerRecipient: 100 });
    // A count that would block at the default cap (10) but is allowed under the overridden cap (100).
    countActivities.mockResolvedValueOnce(50);

    const guard = await buildMessageRateGuard(buildFactoryQueries());

    await expect(guard.guard(action, recipient)).resolves.toBeUndefined();
    expect(countActivities).toHaveBeenCalledWith(
      expect.objectContaining({ windowSeconds: defaultMessageRateLimitPolicy.sendWindow })
    );
  });

  it('applies an overridden window', async () => {
    getMessageRateLimitOverride.mockResolvedValueOnce({ sendWindow: 60 });
    countActivities.mockResolvedValueOnce(0);

    const guard = await buildMessageRateGuard(buildFactoryQueries());
    await guard.guard(action, recipient);

    expect(countActivities).toHaveBeenCalledWith(expect.objectContaining({ windowSeconds: 60 }));
  });

  it('falls back to the system default when the override read fails (fails open)', async () => {
    getMessageRateLimitOverride.mockRejectedValueOnce(new Error('cache unavailable'));
    countActivities.mockResolvedValueOnce(0);

    const guard = await buildMessageRateGuard(buildFactoryQueries());

    await expect(guard.guard(action, recipient)).resolves.toBeUndefined();
    expect(countActivities).toHaveBeenCalledWith(
      expect.objectContaining({ windowSeconds: defaultMessageRateLimitPolicy.sendWindow })
    );
  });
});
