import { type JsonObject, type User } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

import { buildUserPasswordPayload } from '#src/libraries/user.utils.js';
import type TenantContext from '#src/tenants/TenantContext.js';

import {
  type InteractionUserProvisioningProfile,
  type WithHooksAndLogsContext,
} from '../../types.js';

import { getProfileIdentifierCollisionPayload } from './provisioning-profile.js';

type UpdateUserOptions = {
  mergeCustomData?: boolean;
};

const mergeUpdateUserCustomData = (
  existingCustomData: JsonObject | undefined,
  customData: JsonObject | undefined
): JsonObject | undefined =>
  customData && Object.keys(customData).length > 0
    ? {
        ...existingCustomData,
        ...customData,
      }
    : undefined;

export class UserUpdateLibrary {
  constructor(
    private readonly tenantContext: TenantContext,
    private readonly ctx: WithHooksAndLogsContext
  ) {}

  async updateUser(
    userId: string,
    provisioningProfile: InteractionUserProvisioningProfile,
    { mergeCustomData: shouldMergeCustomData = false }: UpdateUserOptions = {}
  ) {
    const { queries, libraries } = this.tenantContext;

    await libraries.users.checkIdentifierCollision(
      getProfileIdentifierCollisionPayload(provisioningProfile),
      userId
    );

    const { passwordEncrypted, passwordEncryptionMethod, customData, profile, ...updateProfile } =
      provisioningProfile;
    const { customDataForUpdate, existingUser } = await this.resolveCustomDataForUpdate(
      userId,
      customData,
      shouldMergeCustomData
    );
    const profileForUpdate = await this.resolveProfileForUpdate(
      userId,
      profile,
      customDataForUpdate,
      existingUser
    );
    const updatePayload = this.buildUpdateUserPayload({
      updateProfile,
      profileForUpdate,
      customDataForUpdate,
      passwordEncrypted,
      passwordEncryptionMethod,
    });

    if (Object.keys(updatePayload).length === 0) {
      return queries.users.findUserById(userId);
    }

    const user = await queries.users.updateUserById(
      userId,
      updatePayload,
      customDataForUpdate === undefined ? 'merge' : 'replace'
    );

    this.ctx.appendDataHookContext('User.Data.Updated', { user });

    return user;
  }

  private async resolveProfileForUpdate(
    userId: string,
    profile: InteractionUserProvisioningProfile['profile'],
    customDataForUpdate: JsonObject | undefined,
    existingUser?: User
  ) {
    const profilePatch =
      profile !== undefined && Object.keys(profile).length > 0 ? profile : undefined;

    if (profilePatch === undefined || customDataForUpdate === undefined) {
      return profilePatch;
    }

    const user = existingUser ?? (await this.tenantContext.queries.users.findUserById(userId));

    return {
      ...user.profile,
      ...profilePatch,
    };
  }

  private buildUpdateUserPayload({
    updateProfile,
    profileForUpdate,
    customDataForUpdate,
    passwordEncrypted,
    passwordEncryptionMethod,
  }: {
    updateProfile: Omit<
      InteractionUserProvisioningProfile,
      'passwordEncrypted' | 'passwordEncryptionMethod' | 'customData' | 'profile'
    >;
    profileForUpdate: InteractionUserProvisioningProfile['profile'];
    customDataForUpdate: JsonObject | undefined;
    passwordEncrypted: InteractionUserProvisioningProfile['passwordEncrypted'];
    passwordEncryptionMethod: InteractionUserProvisioningProfile['passwordEncryptionMethod'];
  }) {
    return {
      ...updateProfile,
      ...conditional(profileForUpdate !== undefined && { profile: profileForUpdate }),
      ...conditional(customDataForUpdate !== undefined && { customData: customDataForUpdate }),
      ...conditional(
        passwordEncrypted &&
          passwordEncryptionMethod &&
          buildUserPasswordPayload({
            passwordEncrypted,
            passwordEncryptionMethod,
          })
      ),
    };
  }

  private async resolveCustomDataForUpdate(
    userId: string,
    customData: JsonObject | undefined,
    shouldMergeCustomData: boolean
  ): Promise<{ customDataForUpdate: JsonObject | undefined; existingUser?: User }> {
    if (customData === undefined) {
      return { customDataForUpdate: undefined };
    }

    if (!shouldMergeCustomData) {
      return {
        customDataForUpdate: Object.keys(customData).length > 0 ? customData : undefined,
      };
    }

    if (Object.keys(customData).length === 0) {
      return { customDataForUpdate: undefined };
    }

    const existingUser = await this.tenantContext.queries.users.findUserById(userId);

    return {
      customDataForUpdate: mergeUpdateUserCustomData(existingUser.customData, customData),
      existingUser,
    };
  }
}
