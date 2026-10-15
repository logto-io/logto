import { type TrustedDevice, defaultTenantId } from '@logto/schemas';

export const createMockTrustedDevice = (overrides: Partial<TrustedDevice> = {}): TrustedDevice => ({
  tenantId: defaultTenantId,
  id: 'trusted-device-id',
  userId: 'user-id',
  secretHash: Buffer.alloc(32, 1),
  userAgent: null,
  ip: null,
  country: null,
  city: null,
  createdAt: 1,
  lastUsedAt: 1,
  expiresAt: 2,
  ...overrides,
});
