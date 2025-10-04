import { EventGroup, tenantEventDistinctId, type ProductEvent } from '@logto/schemas';
import { PostHog } from 'posthog-node';

import { EnvSet } from '../env-set/index.js';

/**
 * PostHog client instance for server-side event tracking.
 * If public key is not set, this will be `undefined`.
 *
 * @see {@link @logto/shared#GlobalValues} for global environment variable details.
 *
 * @remarks Don't export this instance directly if possible to avoid unnecessary actions.
 */
const postHog = EnvSet.values.posthogPublicKey
  ? new PostHog(EnvSet.values.posthogPublicKey, {
      host: EnvSet.values.posthogPublicHost,
    })
  : undefined;

export const shutdownPostHog = async () => postHog?.shutdown();

/**
 * Capture developer-related events in the admin tenant.
 */
export const captureDeveloperEvent = (
  userId: string,
  event: ProductEvent.DeveloperCreated | ProductEvent.DeveloperDeleted,
  properties?: Record<string, unknown>
) =>
  postHog?.capture({
    distinctId: userId,
    event,
    properties,
  });

/**
 * Capture tenant-specific events. These events will not be associated with a specific user.
 */
export const captureEvent = (
  tenantId: string,
  event: ProductEvent,
  properties?: Record<string, unknown>
) =>
  postHog?.capture({
    distinctId: tenantEventDistinctId,
    event,
    groups: {
      [EventGroup.Tenant]: tenantId,
    },
    properties,
  });
