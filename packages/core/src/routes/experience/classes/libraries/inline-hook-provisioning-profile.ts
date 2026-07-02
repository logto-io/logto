import { Users, UsersPasswordEncryptionMethod, userProfileGuard } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { z } from 'zod';

import { type HookProvisioningProfile, type InteractionProfile } from '../../types.js';

const hookProvisioningProfileBaseGuard = Users.createGuard
  .pick({
    name: true,
    avatar: true,
    username: true,
    primaryEmail: true,
    primaryPhone: true,
    profile: true,
    customData: true,
    passwordEncrypted: true,
    passwordEncryptionMethod: true,
  })
  .extend({
    profile: userProfileGuard.optional(),
    passwordEncrypted: z.string().max(256).optional(),
    passwordEncryptionMethod: z.nativeEnum(UsersPasswordEncryptionMethod).optional(),
  })
  .partial()
  .strict();

export const hookProvisioningProfileGuard = hookProvisioningProfileBaseGuard.superRefine(
  ({ passwordEncrypted, passwordEncryptionMethod }, context) => {
    const hasPasswordEncrypted = passwordEncrypted !== undefined;
    const hasPasswordEncryptionMethod = passwordEncryptionMethod !== undefined;

    if (hasPasswordEncrypted === hasPasswordEncryptionMethod) {
      return;
    }

    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: '`passwordEncrypted` and `passwordEncryptionMethod` must be provided together.',
      path: hasPasswordEncrypted ? ['passwordEncryptionMethod'] : ['passwordEncrypted'],
    });
  }
) satisfies z.ZodType<HookProvisioningProfile>;

export const toHookProvisioningProfile = (user: unknown): HookProvisioningProfile =>
  hookProvisioningProfileGuard.parse(user);

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
