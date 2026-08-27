import { createHash } from 'node:crypto';

import { appInsights } from '@logto/app-insights/node';
import {
  InteractionEvent,
  type OrganizationWithRoles,
  type TrustedDevice as TrustedDeviceModel,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { conditional, trySafe } from '@silverhand/essentials';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { type EffectiveTrustedDevicePolicy } from '#src/libraries/trusted-device-policy.js';
import { getTrustedDeviceEventData } from '#src/libraries/trusted-device.js';
import { type TrustedDeviceMetadata } from '#src/queries/trusted-device.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';
import { buildAppInsightsTelemetry } from '#src/utils/request.js';

import {
  type InteractionStorage,
  type TrustedDeviceAvailability,
  type WithHooksAndLogsContext,
} from '../types.js';

type TrustedDeviceData = Pick<InteractionStorage, 'trustedDeviceCreation'>;

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
 * Coordinates persisted creation intent and the request-local trusted-device credential lifecycle.
 */
export class TrustedDevice {
  #creation?: InteractionStorage['trustedDeviceCreation'];
  #validatedDeviceId?: string;
  #effectivePolicy?: {
    userId: string;
    includesOrganizations: boolean;
    promise: Promise<EffectiveTrustedDevicePolicy>;
  };

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

  async requestCreation(userId: string, hasEligibleMfaProof: boolean) {
    assertThat(
      hasEligibleMfaProof,
      new RequestError({ code: 'session.mfa.require_mfa_verification', status: 403 })
    );

    const { enabled } = await this.#getEffectivePolicy(userId);

    if (!enabled) {
      return;
    }

    this.#creation ||= { deviceId: generateStandardId() };
  }

  consumeCreationRequest() {
    const creation = this.#creation;

    this.#creation = undefined;

    return creation;
  }

  async getCreationAvailability(
    userId?: string,
    organizations?: Readonly<OrganizationWithRoles[]>
  ): Promise<TrustedDeviceAvailability | undefined> {
    // Trusted-device opt-in is under development and must remain isolated from released flows.
    if (!EnvSet.values.isDevFeaturesEnabled || !userId) {
      return;
    }

    return trySafe(
      async () => {
        const { enabled, durationDays } = await this.#getEffectivePolicy(userId, organizations);

        return {
          canCreate: enabled,
          ...conditional(enabled && { durationDays }),
        };
      },
      (error) => {
        void appInsights.trackException(error, buildAppInsightsTelemetry(this.ctx));
      }
    );
  }

  /**
   * Tries to verify the current MFA requirement with a trusted-device credential.
   *
   * @remarks Clears previously validated request-local state. On success, retains the device ID for
   * post-submit usage finalization.
   */
  async tryVerifyMfa(userId: string): Promise<boolean> {
    // Trusted-device MFA verification is under development and must remain isolated from released flows.
    if (!EnvSet.values.isDevFeaturesEnabled) {
      return false;
    }

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

        const validatedDeviceId = this.#validatedDeviceId;

        if (validatedDeviceId) {
          await this.#finalizeUsage(validatedDeviceId, interactionEvent, userId, metadata);
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

  async #getEffectivePolicy(userId: string, organizations?: Readonly<OrganizationWithRoles[]>) {
    const cachedPolicy = this.#effectivePolicy;

    if (
      cachedPolicy?.userId === userId &&
      (cachedPolicy.includesOrganizations || organizations === undefined)
    ) {
      return cachedPolicy.promise;
    }

    const promise = this.tenant.libraries.trustedDevicePolicy.getEffectivePolicy(
      userId,
      organizations
    );
    const policyEntry = {
      userId,
      includesOrganizations: organizations !== undefined,
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
