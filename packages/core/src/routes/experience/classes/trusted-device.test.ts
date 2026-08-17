import { appInsights } from '@logto/app-insights/node';
import { InteractionEvent, type TrustedDevice as TrustedDeviceModel } from '@logto/schemas';

import { EnvSet } from '#src/env-set/index.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import { type WithHooksAndLogsContext } from '../types.js';

import { TrustedDevice } from './trusted-device.js';

const { jest } = import.meta;

const userId = 'user-id';
const trustedDeviceId = 'trusteddeviceid';
const trustedDevice: TrustedDeviceModel = {
  tenantId: 'tenant-id',
  id: trustedDeviceId,
  userId,
  secretHash: Buffer.alloc(32, 1),
  userAgent: 'private user agent',
  ip: '192.0.2.1',
  country: 'US',
  city: 'Portland',
  createdAt: 1,
  lastUsedAt: 1,
  expiresAt: 2,
};

const createContext = (interactionId = 'interaction-id') => {
  const { mockAppend, ...logContext } = createMockLogContext();
  const appendDataHookContext = jest.fn();
  const ctx = {
    ...createContextWithRouteParameters(),
    ...logContext,
    appendDataHookContext,
    appendExceptionHookContext: jest.fn(),
    assignReleaseOnSuccessInteractionHookResult: jest.fn(),
    assignReleaseAnywayInteractionHookResult: jest.fn(),
    interactionDetails: { jti: interactionId },
  } as unknown as WithHooksAndLogsContext;

  return { ctx, appendDataHookContext, createLog: jest.mocked(logContext.createLog), mockAppend };
};

const createSubject = ({
  data,
  createResult,
  updateResult,
  validateResult,
  interactionId,
}: {
  data: ConstructorParameters<typeof TrustedDevice>[2];
  createResult?: TrustedDeviceModel;
  updateResult?: TrustedDeviceModel;
  validateResult?: TrustedDeviceModel;
  interactionId?: string;
}) => {
  const context = createContext(interactionId);
  const createCredential = jest.fn().mockResolvedValue(createResult);
  const updateMetadata = jest.fn().mockResolvedValue(updateResult);
  const validateCredential = jest.fn().mockResolvedValue(validateResult);
  const tenant = new MockTenant(undefined, undefined, undefined, {
    trustedDevicePolicy: {
      getEffectivePolicy: jest.fn().mockResolvedValue({ enabled: true, durationDays: 30 }),
    },
    trustedDevices: { createCredential, updateMetadata, validateCredential },
  });

  return {
    ...context,
    createCredential,
    updateMetadata,
    validateCredential,
    subject: new TrustedDevice(context.ctx, tenant, data),
  };
};

describe('Experience trusted-device lifecycle events', () => {
  const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;

  beforeEach(() => {
    jest.clearAllMocks();
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Exercise the guarded feature in isolation.
    (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled = true;
  });

  afterEach(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Restore the process-wide test environment.
    (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled =
      originalIsDevFeaturesEnabled;
    jest.restoreAllMocks();
  });

  it('emits Created audit and webhook events only for the successful insert winner', async () => {
    const winner = createSubject({
      data: {},
      createResult: trustedDevice,
    });
    const loser = createSubject({ data: {} });
    const options = {
      creation: { deviceId: trustedDeviceId },
      interactionEvent: InteractionEvent.SignIn,
      userId,
      hasEligibleMfaProof: true,
      signInContext: { ip: '198.51.100.2', userAgent: 'request user agent' },
    };

    await winner.subject.finalize(options);
    await loser.subject.finalize(options);

    expect(winner.createLog).toHaveBeenCalledWith('TrustedDevice.Created', {
      includeRequestIp: false,
    });
    expect(winner.mockAppend).toHaveBeenCalledWith({
      userId,
      data: { id: trustedDeviceId, userId, expiresAt: trustedDevice.expiresAt },
    });
    expect(winner.appendDataHookContext).toHaveBeenCalledWith('TrustedDevice.Created', {
      data: { id: trustedDeviceId, userId, expiresAt: trustedDevice.expiresAt },
      includeRequestIp: false,
    });
    expect(loser.createLog).not.toHaveBeenCalled();
    expect(loser.appendDataHookContext).not.toHaveBeenCalled();

    const emittedPayload = JSON.stringify([
      winner.mockAppend.mock.calls,
      winner.appendDataHookContext.mock.calls,
    ]);
    expect(emittedPayload).not.toContain('192.0.2.1');
    expect(emittedPayload).not.toContain('198.51.100.2');
    expect(emittedPayload).not.toContain('private user agent');
    expect(emittedPayload).not.toContain('secretHash');
  });

  it('writes Used audit only after a successful active-device metadata update', async () => {
    const success = createSubject({
      data: {
        trustedDeviceFulfillment: {
          userId,
          trustedDeviceId,
          fulfilledAt: 1,
        },
      },
      updateResult: trustedDevice,
    });
    const inactive = createSubject({
      data: {
        trustedDeviceFulfillment: {
          userId,
          trustedDeviceId,
          fulfilledAt: 1,
        },
      },
    });
    const options = {
      interactionEvent: InteractionEvent.SignIn,
      userId,
      hasEligibleMfaProof: false,
    };

    await Promise.all([success.subject.finalize(options), inactive.subject.finalize(options)]);

    expect(success.updateMetadata).toHaveBeenCalledWith(trustedDeviceId, userId, {});
    expect(success.createLog).toHaveBeenCalledTimes(1);
    expect(success.createLog.mock.calls[0]?.[0]).toBe('TrustedDevice.Used');
    expect(success.createLog.mock.calls[0]?.[1]).toMatchObject({ includeRequestIp: false });
    expect(success.createLog.mock.calls[0]?.[1]?.idempotencyKey).toHaveLength(21);
    expect(success.mockAppend).toHaveBeenCalledWith({
      userId,
      data: { id: trustedDeviceId, userId, expiresAt: trustedDevice.expiresAt },
    });
    expect(success.appendDataHookContext).not.toHaveBeenCalled();
    expect(inactive.createLog).not.toHaveBeenCalled();
  });

  it('keeps distinct same-millisecond fulfillments observable when they finish out of order', async () => {
    const earlier = createSubject({
      data: {
        trustedDeviceFulfillment: {
          userId,
          trustedDeviceId,
          fulfilledAt: 123_000,
        },
      },
      updateResult: trustedDevice,
      interactionId: 'earlier-interaction-id',
    });
    const later = createSubject({
      data: {
        trustedDeviceFulfillment: {
          userId,
          trustedDeviceId,
          fulfilledAt: 123_000,
        },
      },
      updateResult: trustedDevice,
      interactionId: 'later-interaction-id',
    });
    const options = {
      interactionEvent: InteractionEvent.SignIn,
      userId,
      hasEligibleMfaProof: false,
    };

    await later.subject.finalize(options);
    await earlier.subject.finalize(options);

    const laterIdempotencyKey = later.createLog.mock.calls[0]?.[1]?.idempotencyKey;
    const earlierIdempotencyKey = earlier.createLog.mock.calls[0]?.[1]?.idempotencyKey;
    expect(laterIdempotencyKey).toHaveLength(21);
    expect(earlierIdempotencyKey).toHaveLength(21);
    expect(earlierIdempotencyKey).not.toBe(laterIdempotencyKey);
  });

  it('uses one audit-log key across requests racing before fulfillment is stored', async () => {
    const first = createSubject({
      data: {},
      updateResult: trustedDevice,
      validateResult: trustedDevice,
      interactionId: 'shared-interaction-id',
    });
    const second = createSubject({
      data: {},
      updateResult: trustedDevice,
      validateResult: trustedDevice,
      interactionId: 'shared-interaction-id',
    });

    await expect(
      Promise.all([first.subject.tryFulfillMfa(userId), second.subject.tryFulfillMfa(userId)])
    ).resolves.toEqual(['validated', 'validated']);

    const options = {
      interactionEvent: InteractionEvent.SignIn,
      userId,
      hasEligibleMfaProof: false,
    };
    await Promise.all([first.subject.finalize(options), second.subject.finalize(options)]);

    const firstIdempotencyKey = first.createLog.mock.calls[0]?.[1]?.idempotencyKey;
    const secondIdempotencyKey = second.createLog.mock.calls[0]?.[1]?.idempotencyKey;
    expect(first.validateCredential).toHaveBeenCalledTimes(1);
    expect(second.validateCredential).toHaveBeenCalledTimes(1);
    expect(firstIdempotencyKey).toHaveLength(21);
    expect(secondIdempotencyKey).toBe(firstIdempotencyKey);
  });

  it('reuses one audit-log idempotency key for concurrent or sequential fulfillment retries', async () => {
    const fulfillment = {
      userId,
      trustedDeviceId,
      fulfilledAt: 123_000,
    };
    const usage = createSubject({
      data: { trustedDeviceFulfillment: fulfillment },
      updateResult: trustedDevice,
    });
    const options = {
      interactionEvent: InteractionEvent.SignIn,
      userId,
      hasEligibleMfaProof: false,
    };

    await Promise.all([usage.subject.finalize(options), usage.subject.finalize(options)]);
    await usage.subject.finalize(options);

    expect(usage.updateMetadata).toHaveBeenCalledTimes(3);
    expect(usage.createLog).toHaveBeenCalledTimes(3);
    const idempotencyKeys = usage.createLog.mock.calls.map(
      ([, options]) => options?.idempotencyKey
    );
    expect(idempotencyKeys[0]).toHaveLength(21);
    expect(new Set(idempotencyKeys)).toHaveProperty('size', 1);
  });

  it('keeps post-submit failures non-blocking and emits no lifecycle event', async () => {
    const error = new Error('trusted-device write failed');
    const trackException = jest.spyOn(appInsights, 'trackException').mockResolvedValue();
    const creation = createSubject({ data: {} });
    creation.createCredential.mockRejectedValueOnce(error);
    const usage = createSubject({
      data: {
        trustedDeviceFulfillment: {
          userId,
          trustedDeviceId,
          fulfilledAt: 1,
        },
      },
    });
    usage.updateMetadata.mockRejectedValueOnce(error);

    await expect(
      creation.subject.finalize({
        creation: { deviceId: trustedDeviceId },
        interactionEvent: InteractionEvent.SignIn,
        userId,
        hasEligibleMfaProof: true,
      })
    ).resolves.toBeUndefined();
    await expect(
      usage.subject.finalize({
        interactionEvent: InteractionEvent.SignIn,
        userId,
        hasEligibleMfaProof: false,
      })
    ).resolves.toBeUndefined();

    expect(creation.createLog).not.toHaveBeenCalled();
    expect(creation.appendDataHookContext).not.toHaveBeenCalled();
    expect(usage.createLog).not.toHaveBeenCalled();
    expect(usage.appendDataHookContext).not.toHaveBeenCalled();
    expect(trackException).toHaveBeenCalledTimes(2);
    expect(trackException).toHaveBeenCalledWith(error, expect.any(Object));
  });
});
