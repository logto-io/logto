import { hookProvisioningProfileGuard, type HookProvisioningProfile } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

import { encryptUserPassword } from '#src/libraries/user.utils.js';

import { type InteractionProfile } from '../../types.js';

export const toHookProvisioningProfile = (user: unknown): HookProvisioningProfile =>
  hookProvisioningProfileGuard.parse(user);

type InlineHookPasswordPayload = Awaited<ReturnType<typeof encryptUserPassword>>;

type InlineHookProvisioningProfileWithPassword = HookProvisioningProfile &
  InlineHookPasswordPayload;

export type InlineHookProvisioningProfile = HookProvisioningProfile &
  (
    | InlineHookPasswordPayload
    | {
        passwordEncrypted?: never;
        passwordEncryptionMethod?: never;
      }
  );

export const appendPasswordPayloadToInlineHookProvisioningProfile = async (
  provisioningProfile: HookProvisioningProfile,
  password: string
): Promise<InlineHookProvisioningProfileWithPassword> => ({
  ...provisioningProfile,
  ...(await encryptUserPassword(password)),
});

export const getProfileIdentifierCollisionPayload = ({
  socialIdentity,
  username,
  primaryEmail,
  primaryPhone,
}: InteractionProfile) => ({
  username,
  primaryEmail,
  primaryPhone,
  ...conditional(
    socialIdentity && {
      identity: {
        target: socialIdentity.target,
        id: socialIdentity.userInfo.id,
      },
    }
  ),
});
