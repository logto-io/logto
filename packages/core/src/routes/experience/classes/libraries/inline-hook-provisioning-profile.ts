import { Users, userProfileGuard } from '@logto/schemas';
import { type z } from 'zod';

import { encryptUserPassword } from '#src/libraries/user.utils.js';

import { type HookProvisioningProfile } from '../../types.js';

const hookProvisioningProfileGuard = Users.createGuard
  .pick({
    name: true,
    avatar: true,
    username: true,
    primaryEmail: true,
    primaryPhone: true,
    profile: true,
    customData: true,
  })
  .extend({
    profile: userProfileGuard.optional(),
  })
  .partial()
  .strict() satisfies z.ZodType<HookProvisioningProfile>;

export const toHookProvisioningProfile = (user: unknown): HookProvisioningProfile =>
  hookProvisioningProfileGuard.parse(user);

type InlineHookPasswordPayload = Awaited<ReturnType<typeof encryptUserPassword>>;

/**
 * Appends Logto-generated Argon2i password fields to a hook provisioning profile.
 * Script-supplied password hash fields are rejected by {@link toHookProvisioningProfile};
 * only this helper may introduce them for create/update provisioning.
 */
export const appendPasswordPayloadToInlineHookProvisioningProfile = async (
  provisioningProfile: HookProvisioningProfile,
  password: string
): Promise<HookProvisioningProfile & InlineHookPasswordPayload> => ({
  ...provisioningProfile,
  ...(await encryptUserPassword(password)),
});
