import { appInsights } from '@logto/app-insights/node';
import { InteractionEvent } from '@logto/schemas';
import { conditional, trySafe } from '@silverhand/essentials';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';
import { buildAppInsightsTelemetry } from '#src/utils/request.js';

import { type InteractionStorage, type WithHooksAndLogsContext } from '../types.js';

type TrustedDeviceFulfillmentStatus =
  /** A matching trusted-device fulfillment was restored from interaction storage. */
  | 'stored'
  /** A trusted-device credential was validated and stored during the current request. */
  | 'validated';

type TrustedDeviceData = Pick<
  InteractionStorage,
  'createTrustedDevice' | 'trustedDeviceFulfillment'
>;

type FinalizeOptions = {
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
  #createTrustedDevice?: boolean;
  #fulfillment?: InteractionStorage['trustedDeviceFulfillment'];

  constructor(
    private readonly ctx: WithHooksAndLogsContext,
    private readonly tenant: TenantContext,
    data: TrustedDeviceData
  ) {
    this.#createTrustedDevice = data.createTrustedDevice;
    this.#fulfillment = data.trustedDeviceFulfillment;
  }

  get data(): TrustedDeviceData {
    return {
      ...conditional(this.#createTrustedDevice && { createTrustedDevice: true }),
      ...conditional(this.#fulfillment && { trustedDeviceFulfillment: this.#fulfillment }),
    };
  }

  get creationRequested() {
    return this.#createTrustedDevice === true;
  }

  requestCreation(hasEligibleMfaProof: boolean) {
    assertThat(
      hasEligibleMfaProof,
      new RequestError({ code: 'session.mfa.require_mfa_verification', status: 403 })
    );

    this.#createTrustedDevice = true;
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

  async tryFulfillMfa(userId: string): Promise<TrustedDeviceFulfillmentStatus | undefined> {
    // Trusted-device MFA fulfillment is under development and must remain isolated from released flows.
    if (!EnvSet.values.isDevFeaturesEnabled) {
      return;
    }

    if (this.#fulfillment?.userId === userId) {
      return 'stored';
    }

    const {
      libraries: { trustedDevicePolicy, trustedDevices },
    } = this.tenant;
    const { enabled } = await trustedDevicePolicy.getEffectivePolicy(userId);

    if (!enabled) {
      return;
    }

    const trustedDevice = await trustedDevices.validateCredential(this.ctx, userId);

    if (!trustedDevice) {
      return;
    }

    this.#fulfillment = {
      userId,
      trustedDeviceId: trustedDevice.id,
      fulfilledAt: Date.now(),
    };

    return 'validated';
  }

  async finalize({
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
        const {
          libraries: { trustedDevices },
        } = this.tenant;
        const { ip, userAgent } = signInContext ?? {};
        const { country, city } = location ?? {};
        const metadata = {
          ...conditional(userAgent && { userAgent }),
          ...conditional(ip && { ip }),
          ...conditional(country && { country }),
          ...conditional(city && { city }),
        };

        const fulfillment = this.#fulfillment;

        if (fulfillment?.userId === userId) {
          if (interactionEvent === InteractionEvent.SignIn) {
            void trySafe(
              async () =>
                trustedDevices.updateMetadata(fulfillment.trustedDeviceId, userId, metadata),
              (error) => {
                void appInsights.trackException(error, buildAppInsightsTelemetry(this.ctx));
              }
            );
          }
          return;
        }

        if (!this.#createTrustedDevice || !hasEligibleMfaProof) {
          return;
        }

        await trustedDevices.createCredential({ ctx: this.ctx, userId, ...metadata });
      },
      (error) => {
        void appInsights.trackException(error, buildAppInsightsTelemetry(this.ctx));
      }
    );
  }
}
