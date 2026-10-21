import { createHash } from 'node:crypto';

import { appInsights } from '@logto/app-insights/node';
import { InteractionEvent, type TrustedDevice as TrustedDeviceModel } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { conditional, trySafe } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';
import { type EffectiveTrustedDevicePolicy } from '#src/libraries/trusted-device-policy.js';
import { getTrustedDeviceEventData } from '#src/libraries/trusted-device.js';
import { type TrustedDeviceMetadata } from '#src/queries/trusted-device.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';
import { buildAppInsightsTelemetry } from '#src/utils/request.js';

import { type InteractionStorage, type WithHooksAndLogsContext } from '../types.js';

type TrustedDeviceData = Pick<InteractionStorage, 'trustedDeviceOptIn'>;
type OptInDecisionContext = {
  interactionEvent: InteractionEvent;
  userId: string;
};

type AssertOptInDecisionOptions = OptInDecisionContext & {
  getHasEligibleMfaProof: () => Promise<boolean>;
};

type OptInDecisionOptions = OptInDecisionContext & {
  hasEligibleMfaProof: boolean;
};

const buildTrustedDeviceUsageLogId = (tenantId: string, interactionId: string) =>
  createHash('sha256')
    .update(`TrustedDevice.Used:${tenantId}:${interactionId}`)
    .digest('base64url')
    .slice(0, 21);

type FinalizeOptions = {
  optInDecision?: InteractionStorage['trustedDeviceOptIn'];
  interactionEvent: InteractionEvent;
  userId: string;
  hasEligibleMfaProof: boolean;
  signInContext?: {
    ip?: string;
    userAgent?: string;
  };
  location?: {
    country?: string;
    city?: string;
  };
};

/**
 * Coordinates the persisted opt-in decision and request-local trusted-device credential lifecycle.
 */
export class TrustedDevice {
  #optIn?: InteractionStorage['trustedDeviceOptIn'];
  #validatedDeviceId?: string;
  #effectivePolicy?: {
    userId: string;
    promise: Promise<EffectiveTrustedDevicePolicy>;
  };

  constructor(
    private readonly ctx: WithHooksAndLogsContext,
    private readonly tenant: TenantContext,
    data: TrustedDeviceData
  ) {
    this.#optIn = data.trustedDeviceOptIn;
  }

  get data(): TrustedDeviceData {
    return {
      ...conditional(this.#optIn && { trustedDeviceOptIn: this.#optIn }),
    };
  }

  async assertOptInDecision({
    interactionEvent,
    userId,
    getHasEligibleMfaProof,
  }: AssertOptInDecisionOptions) {
    if (interactionEvent === InteractionEvent.ForgotPassword || this.#optIn) {
      return;
    }

    if (this.tenant.libraries.trustedDevices.hasOptOut(this.ctx, userId)) {
      return;
    }

    if (!(await getHasEligibleMfaProof())) {
      return;
    }

    const policy = await trySafe(
      async () => this.#getEffectivePolicy(userId),
      (error) => {
        void appInsights.trackException(error, buildAppInsightsTelemetry(this.ctx));
      }
    );

    if (!policy?.enabled) {
      return;
    }

    throw new RequestError(
      { code: 'session.trusted_device_suggest_opt_in', status: 422 },
      { durationDays: policy.durationDays }
    );
  }

  async setOptInDecision({
    trusted,
    interactionEvent,
    userId,
    hasEligibleMfaProof,
  }: OptInDecisionOptions & { trusted: boolean }) {
    assertThat(
      interactionEvent !== InteractionEvent.ForgotPassword,
      new RequestError({ code: 'session.not_supported_for_forgot_password', status: 400 })
    );

    if (!trusted) {
      this.#optIn = { trusted: false };

      await trySafe(
        async () => {
          const policy = await this.#getEffectivePolicy(userId);

          if (policy.enabled) {
            this.tenant.libraries.trustedDevices.writeOptOut(this.ctx, userId, policy.durationDays);
          }
        },
        (error) => {
          void appInsights.trackException(error, buildAppInsightsTelemetry(this.ctx));
        }
      );
      return;
    }

    assertThat(
      hasEligibleMfaProof,
      new RequestError({ code: 'session.mfa.require_mfa_verification', status: 403 })
    );

    const { enabled } = await this.#getEffectivePolicy(userId);

    if (!enabled) {
      return;
    }

    this.#optIn = {
      trusted: true,
      deviceId: this.#optIn?.trusted ? this.#optIn.deviceId : generateStandardId(),
    };
  }

  consumeOptInDecision() {
    const decision = this.#optIn;

    this.#optIn = undefined;

    return decision;
  }

  /**
   * Tries to verify the current MFA requirement with a trusted-device credential.
   *
   * @remarks Clears previously validated request-local state. On success, retains the device ID for
   * post-submit usage finalization.
   */
  async tryVerifyMfa(userId: string): Promise<boolean> {
    this.#validatedDeviceId = undefined;

    const { trustedDevices } = this.tenant.libraries;

    if (!trustedDevices.hasCredential(this.ctx, userId)) {
      return false;
    }

    const { enabled } = await this.#getEffectivePolicy(userId);

    if (!enabled) {
      return false;
    }

    const trustedDevice = await trustedDevices.validateCredential(this.ctx, userId);

    if (!trustedDevice) {
      return false;
    }

    this.#validatedDeviceId = trustedDevice.id;

    return true;
  }

  async finalize({
    optInDecision,
    interactionEvent,
    userId,
    hasEligibleMfaProof,
    signInContext,
    location,
  }: FinalizeOptions) {
    await trySafe(
      async () => {
        const { ip, userAgent } = signInContext ?? {};
        const { country, city } = location ?? {};
        const metadata = {
          ...conditional(userAgent && { userAgent }),
          ...conditional(ip && { ip }),
          ...conditional(country && { country }),
          ...conditional(city && { city }),
        };

        const validatedDeviceId = this.#validatedDeviceId;

        if (validatedDeviceId) {
          await this.#finalizeUsage(validatedDeviceId, interactionEvent, userId, metadata);
          return;
        }

        await this.#finalizeCreation(optInDecision, hasEligibleMfaProof, userId, metadata);
      },
      (error) => {
        void appInsights.trackException(error, buildAppInsightsTelemetry(this.ctx));
      }
    );
  }

  async #finalizeUsage(
    validatedDeviceId: string,
    interactionEvent: InteractionEvent,
    userId: string,
    metadata: TrustedDeviceMetadata
  ) {
    if (interactionEvent !== InteractionEvent.SignIn) {
      return;
    }

    const trustedDevice = await this.tenant.libraries.trustedDevices.updateMetadata(
      validatedDeviceId,
      userId,
      metadata
    );

    if (trustedDevice) {
      this.#appendAuditLog(
        'TrustedDevice.Used',
        trustedDevice,
        buildTrustedDeviceUsageLogId(this.tenant.id, this.ctx.interactionDetails.jti)
      );
    }
  }

  async #finalizeCreation(
    optInDecision: InteractionStorage['trustedDeviceOptIn'] | undefined,
    hasEligibleMfaProof: boolean,
    userId: string,
    metadata: TrustedDeviceMetadata
  ) {
    if (!optInDecision?.trusted || !hasEligibleMfaProof) {
      return;
    }

    const trustedDevice = await this.tenant.libraries.trustedDevices.createCredential({
      ctx: this.ctx,
      deviceId: optInDecision.deviceId,
      effectivePolicy: await this.#getEffectivePolicy(userId),
      userId,
      ...metadata,
    });

    if (!trustedDevice) {
      return;
    }

    const data = getTrustedDeviceEventData(trustedDevice);

    this.#appendAuditLog('TrustedDevice.Created', trustedDevice);
    this.ctx.appendDataHookContext('TrustedDevice.Created', {
      data,
      // Trusted-device lifecycle payloads intentionally exclude the request IP.
      includeRequestIp: false,
    });
  }

  #appendAuditLog(
    key: 'TrustedDevice.Created' | 'TrustedDevice.Used',
    trustedDevice: TrustedDeviceModel,
    idempotencyKey?: string
  ) {
    const data = getTrustedDeviceEventData(trustedDevice);
    const log = this.ctx.createLog(key, {
      includeRequestIp: false,
      ...conditional(idempotencyKey && { idempotencyKey }),
    });

    log.append({ userId: data.userId, data });
  }

  async #getEffectivePolicy(userId: string) {
    const cachedPolicy = this.#effectivePolicy;

    if (cachedPolicy?.userId === userId) {
      return cachedPolicy.promise;
    }

    const promise = this.tenant.libraries.trustedDevicePolicy.getEffectivePolicy(userId);
    const policyEntry = {
      userId,
      promise,
    };
    this.#effectivePolicy = policyEntry;

    try {
      return await promise;
    } catch (error: unknown) {
      if (this.#effectivePolicy === policyEntry) {
        this.#effectivePolicy = undefined;
      }

      throw error;
    }
  }
}
