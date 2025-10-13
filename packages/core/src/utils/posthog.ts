import { type IncomingMessage } from 'node:http';

import {
  cloudUserIdHeader,
  EventGroup,
  tenantEventDistinctId,
  type ProductEvent,
} from '@logto/schemas';
import { type Optional } from '@silverhand/essentials';
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
 * Capture tenant-specific events. If the request header contains the cloud user ID, it will be
 * used as the distinct ID of the event.
 */
export const captureEvent = (
  { tenantId, request }: { tenantId: string; request: Optional<IncomingMessage> },
  event: ProductEvent,
  properties?: Record<string, unknown>
) =>
  postHog?.capture({
    distinctId: request?.headersDistinct[cloudUserIdHeader]?.[0] ?? tenantEventDistinctId,
    event,
    groups: {
      [EventGroup.Tenant]: tenantId,
    },
    properties,
  });
