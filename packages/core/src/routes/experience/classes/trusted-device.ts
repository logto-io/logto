import { createHash } from 'node:crypto';

import { appInsights } from '@logto/app-insights/node';
import { InteractionEvent, type TrustedDevice as TrustedDeviceModel } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { conditional, trySafe } from '@silverhand/essentials';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { getTrustedDeviceEventData } from '#src/libraries/trusted-device.js';
import { type TrustedDeviceMetadata } from '#src/queries/trusted-device.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';
import { buildAppInsightsTelemetry } from '#src/utils/request.js';

import { type InteractionStorage, type WithHooksAndLogsContext } from '../types.js';

type TrustedDeviceData = Pick<InteractionStorage, 'trustedDeviceCreation'>;

type ValidatedTrustedDevice = Pick<TrustedDeviceModel, 'id' | 'userId'>;

const buildTrustedDeviceUsageLogId = (tenantId: string, interactionId: string) =>
  createHash('sha256')
    .update(`TrustedDevice.Used:${tenantId}:${interactionId}`)
    .digest('base64url')
    .slice(0, 21);

type FinalizeOptions = {
  creation?: InteractionStorage['trustedDeviceCreation'];
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
 * Owns trusted-device interaction state and coordinates credential fulfillment and creation.
 */
export class TrustedDevice {
  #creation?: InteractionStorage['trustedDeviceCreation'];
  #validatedDevice?: ValidatedTrustedDevice;

  constructor(
    private readonly ctx: WithHooksAndLogsContext,
    private readonly tenant: TenantContext,
    data: TrustedDeviceData
  ) {
    this.#creation = data.trustedDeviceCreation;
  }

  get data(): TrustedDeviceData {
    return {
      ...conditional(this.#creation && { trustedDeviceCreation: this.#creation }),
    };
  }

  requestCreation(hasEligibleMfaProof: boolean) {
    assertThat(
      hasEligibleMfaProof,
      new RequestError({ code: 'session.mfa.require_mfa_verification', status: 403 })
    );

    this.#creation ||= { deviceId: generateStandardId() };
  }

  consumeCreationRequest() {
    const creation = this.#creation;

    this.#creation = undefined;

    return creation;
  }

  async getCreationAvailability(userId?: string) {
    // Trusted-device opt-in is under development and must remain isolated from released flows.
    if (!EnvSet.values.isDevFeaturesEnabled || !userId) {
      return;
    }

    const { enabled, durationDays } =
      await this.tenant.libraries.trustedDevicePolicy.getEffectivePolicy(userId);

    return {
      canCreate: enabled,
      ...conditional(enabled && { durationDays }),
    };
  }

  async tryFulfillMfa(userId: string): Promise<boolean> {
    // Trusted-device MFA fulfillment is under development and must remain isolated from released flows.
    if (!EnvSet.values.isDevFeaturesEnabled) {
      return false;
    }

    this.#validatedDevice = undefined;

    const {
      libraries: { trustedDevicePolicy, trustedDevices },
    } = this.tenant;
    const { enabled } = await trustedDevicePolicy.getEffectivePolicy(userId);

    if (!enabled) {
      return false;
    }

    const trustedDevice = await trustedDevices.validateCredential(this.ctx, userId);

    if (!trustedDevice) {
      return false;
    }

    this.#validatedDevice = { id: trustedDevice.id, userId };

    return true;
  }

  async finalize({
    creation,
    interactionEvent,
    userId,
    hasEligibleMfaProof,
    signInContext,
    location,
  }: FinalizeOptions) {
    if (!EnvSet.values.isDevFeaturesEnabled) {
      return;
    }

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

        const validatedDevice = this.#validatedDevice;

        if (validatedDevice?.userId === userId) {
          await this.#finalizeUsage(validatedDevice, interactionEvent, userId, metadata);
          return;
        }

        await this.#finalizeCreation(creation, hasEligibleMfaProof, userId, metadata);
      },
      (error) => {
        void appInsights.trackException(error, buildAppInsightsTelemetry(this.ctx));
      }
    );
  }

  async #finalizeUsage(
    validatedDevice: ValidatedTrustedDevice,
    interactionEvent: InteractionEvent,
    userId: string,
    metadata: TrustedDeviceMetadata
  ) {
    if (interactionEvent !== InteractionEvent.SignIn) {
      return;
    }

    const trustedDevice = await this.tenant.libraries.trustedDevices.updateMetadata(
      validatedDevice.id,
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
    creation: InteractionStorage['trustedDeviceCreation'],
    hasEligibleMfaProof: boolean,
    userId: string,
    metadata: TrustedDeviceMetadata
  ) {
    if (!creation || !hasEligibleMfaProof) {
      return;
    }

    const trustedDevice = await this.tenant.libraries.trustedDevices.createCredential({
      ctx: this.ctx,
      deviceId: creation.deviceId,
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
}
