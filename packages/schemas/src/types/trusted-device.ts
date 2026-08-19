import { z } from 'zod';

import { TrustedDevices } from '../db-entries/index.js';

/** Public trusted-device metadata returned by user management APIs. */
export const trustedDeviceResponseGuard = TrustedDevices.guard.pick({
  id: true,
  userAgent: true,
  country: true,
  city: true,
  createdAt: true,
  lastUsedAt: true,
  expiresAt: true,
});

export type TrustedDeviceResponse = z.infer<typeof trustedDeviceResponseGuard>;

/** Account API trusted-device metadata with current-browser state. */
export const accountTrustedDeviceResponseGuard = trustedDeviceResponseGuard.extend({
  isCurrent: z.boolean(),
});

export type AccountTrustedDeviceResponse = z.infer<typeof accountTrustedDeviceResponseGuard>;
