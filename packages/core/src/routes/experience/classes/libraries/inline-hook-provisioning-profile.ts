import { hookProvisioningProfileGuard, type HookProvisioningProfile } from '@logto/schemas';

export const toHookProvisioningProfile = (user: unknown): HookProvisioningProfile =>
  hookProvisioningProfileGuard.parse(user);
