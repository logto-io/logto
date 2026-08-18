import { type z } from 'zod';

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
