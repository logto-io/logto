import { Users, userProfileGuard } from '@logto/schemas';
import { type z } from 'zod';

import { encryptUserPassword } from '#src/libraries/user.utils.js';

import { type ActionProvisioningProfile } from '../../types.js';

const actionProvisioningProfileGuard = Users.createGuard
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
  .strict() satisfies z.ZodType<ActionProvisioningProfile>;

export const toActionProvisioningProfile = (user: unknown): ActionProvisioningProfile =>
  actionProvisioningProfileGuard.parse(user);

type ActionPasswordPayload = Awaited<ReturnType<typeof encryptUserPassword>>;

/**
 * Appends Logto-generated Argon2i password fields to an Action provisioning profile.
 * Script-supplied password hash fields are rejected by {@link toActionProvisioningProfile};
 * only this helper may introduce them for create/update provisioning.
 */
export const appendPasswordPayloadToActionProvisioningProfile = async (
  provisioningProfile: ActionProvisioningProfile,
  password: string
): Promise<ActionProvisioningProfile & ActionPasswordPayload> => ({
  ...provisioningProfile,
  ...(await encryptUserPassword(password)),
});
