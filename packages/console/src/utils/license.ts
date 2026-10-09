import { ossDefaultQuota } from '@logto/schemas';

import { type License } from '@/types/license';

/** Key expiry and refresh refusals do not remove entitlements until the offline grace ends. */
export const getEffectiveLicenseQuota = (license?: License, now = Date.now()) =>
  license && Date.parse(license.graceEndsAt) > now ? license.quota : ossDefaultQuota;
