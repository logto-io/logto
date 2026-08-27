import { appInsights } from '@logto/app-insights/node';
import {
  InteractionEvent,
  type OrganizationWithRoles,
  type TrustedDevice as TrustedDeviceModel,
} from '@logto/schemas';

import { createMockTrustedDevice } from '#src/__mocks__/trusted-device.js';
import { EnvSet } from '#src/env-set/index.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import { type WithHooksAndLogsContext } from '../types.js';

import { TrustedDevice } from './trusted-device.js';

const { jest } = import.meta;

const userId = 'user-id';
const trustedDeviceId = 'trusteddeviceid';
const trustedDevice: TrustedDeviceModel = createMockTrustedDevice({
  tenantId: 'tenant-id',
  id: trustedDeviceId,
  userId,
  userAgent: 'private user agent',
  ip: '192.0.2.1',
  country: 'US',
  city: 'Portland',
});

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
  const hasCredential = jest.fn().mockReturnValue(true);
  const getEffectivePolicy = jest.fn().mockResolvedValue({ enabled: true, durationDays: 30 });
  const tenant = new MockTenant(undefined, undefined, undefined, {
    trustedDevicePolicy: { getEffectivePolicy },
    trustedDevices: { createCredential, hasCredential, updateMetadata, validateCredential },
  });

  return {
    ...context,
    createCredential,
    getEffectivePolicy,
    hasCredential,
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

  it('memoizes effective policy across availability and creation finalization', async () => {
    const creation = createSubject({ data: {}, createResult: trustedDevice });

    await expect(creation.subject.getCreationAvailability(userId)).resolves.toEqual({
      canCreate: true,
      durationDays: 30,
    });
    await creation.subject.finalize({
      creation: { deviceId: trustedDeviceId },
      interactionEvent: InteractionEvent.SignIn,
      userId,
      hasEligibleMfaProof: true,
    });

    expect(creation.getEffectivePolicy).toHaveBeenCalledTimes(1);
    expect(creation.createCredential).toHaveBeenCalledWith(
      expect.objectContaining({
        effectivePolicy: { enabled: true, durationDays: 30 },
      })
    );
  });

  it('ignores creation intent when the current server policy disallows it', async () => {
    const creation = createSubject({ data: {} });
    creation.getEffectivePolicy.mockResolvedValueOnce({ enabled: false, durationDays: 30 });

    await expect(creation.subject.requestCreation(userId, true)).resolves.toBeUndefined();

    expect(creation.subject.data).toEqual({});
  });

  it('retries effective policy resolution after a failed availability lookup', async () => {
    const error = new Error('policy lookup failed');
    const trackException = jest.spyOn(appInsights, 'trackException').mockResolvedValue();
    const creation = createSubject({ data: {} });
    creation.getEffectivePolicy
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce({ enabled: true, durationDays: 30 });

    await expect(creation.subject.getCreationAvailability(userId)).resolves.toBeUndefined();
    await expect(creation.subject.requestCreation(userId, true)).resolves.toBeUndefined();

    expect(creation.getEffectivePolicy).toHaveBeenCalledTimes(2);
    expect(creation.subject.data.trustedDeviceCreation?.deviceId).toEqual(expect.any(String));
    expect(trackException).toHaveBeenCalledWith(error, expect.any(Object));
  });

  it('refreshes an unscoped policy memo when loaded organizations are supplied', async () => {
    const organizations = [{ isTrustedDeviceAllowed: true }] as unknown as Readonly<
      OrganizationWithRoles[]
    >;
    const creation = createSubject({ data: {} });

    await creation.subject.getCreationAvailability(userId);
    await creation.subject.getCreationAvailability(userId, organizations);

    expect(creation.getEffectivePolicy).toHaveBeenCalledTimes(2);
    expect(creation.getEffectivePolicy).toHaveBeenNthCalledWith(2, userId, organizations);
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
      data: {},
      updateResult: trustedDevice,
      validateResult: trustedDevice,
    });
    const inactive = createSubject({
      data: {},
      validateResult: trustedDevice,
    });
    const options = {
      interactionEvent: InteractionEvent.SignIn,
      userId,
      hasEligibleMfaProof: false,
    };

    await Promise.all([
      success.subject.tryVerifyMfa(userId),
      inactive.subject.tryVerifyMfa(userId),
    ]);
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

  it('uses distinct audit-log keys for different interactions', async () => {
    const first = createSubject({
      data: {},
      updateResult: trustedDevice,
      validateResult: trustedDevice,
      interactionId: 'first-interaction-id',
    });
    const second = createSubject({
      data: {},
      updateResult: trustedDevice,
      validateResult: trustedDevice,
      interactionId: 'second-interaction-id',
    });
    const options = {
      interactionEvent: InteractionEvent.SignIn,
      userId,
      hasEligibleMfaProof: false,
    };

    await Promise.all([first.subject.tryVerifyMfa(userId), second.subject.tryVerifyMfa(userId)]);
    await Promise.all([first.subject.finalize(options), second.subject.finalize(options)]);

    const firstIdempotencyKey = first.createLog.mock.calls[0]?.[1]?.idempotencyKey;
    const secondIdempotencyKey = second.createLog.mock.calls[0]?.[1]?.idempotencyKey;
    expect(firstIdempotencyKey).toHaveLength(21);
    expect(secondIdempotencyKey).toHaveLength(21);
    expect(firstIdempotencyKey).not.toBe(secondIdempotencyKey);
  });

  it('clears the request-local device when revalidation fails', async () => {
    const usage = createSubject({
      data: {},
      updateResult: trustedDevice,
    });
    usage.validateCredential.mockResolvedValueOnce(trustedDevice).mockResolvedValueOnce(null);

    await expect(usage.subject.tryVerifyMfa(userId)).resolves.toBe(true);
    await expect(usage.subject.tryVerifyMfa(userId)).resolves.toBe(false);
    await usage.subject.finalize({
      interactionEvent: InteractionEvent.SignIn,
      userId,
      hasEligibleMfaProof: false,
    });

    expect(usage.updateMetadata).not.toHaveBeenCalled();
    expect(usage.createLog).not.toHaveBeenCalled();
  });

  it('skips policy and credential validation when no trusted-device cookie is present', async () => {
    const usage = createSubject({ data: {} });
    usage.hasCredential.mockReturnValueOnce(false);

    await expect(usage.subject.tryVerifyMfa(userId)).resolves.toBe(false);

    expect(usage.hasCredential).toHaveBeenCalledWith(usage.ctx, userId);
    expect(usage.getEffectivePolicy).not.toHaveBeenCalled();
    expect(usage.validateCredential).not.toHaveBeenCalled();
  });

  it('uses one audit-log key across concurrent requests for the same interaction', async () => {
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
      Promise.all([first.subject.tryVerifyMfa(userId), second.subject.tryVerifyMfa(userId)])
    ).resolves.toEqual([true, true]);

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

  it('reuses one audit-log idempotency key for concurrent or sequential verification retries', async () => {
    const usage = createSubject({
      data: {},
      updateResult: trustedDevice,
      validateResult: trustedDevice,
    });
    const options = {
      interactionEvent: InteractionEvent.SignIn,
      userId,
      hasEligibleMfaProof: false,
    };

    await usage.subject.tryVerifyMfa(userId);
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
      data: {},
      validateResult: trustedDevice,
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
    await usage.subject.tryVerifyMfa(userId);
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
