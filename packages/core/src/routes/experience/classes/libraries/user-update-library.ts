import { type JsonObject } from '@logto/schemas';
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
    const customDataForUpdate = this.resolveCustomDataForUpdate(customData);
    const jsonbMode =
      customDataForUpdate === undefined || shouldMergeCustomData ? 'merge' : 'replace';
    const profileForUpdate = await this.resolveProfileForUpdate(userId, profile, jsonbMode);
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

    const user = await queries.users.updateUserById(userId, updatePayload, jsonbMode);

    this.ctx.appendDataHookContext('User.Data.Updated', { user });

    return user;
  }

  private async resolveProfileForUpdate(
    userId: string,
    profile: InteractionUserProvisioningProfile['profile'],
    jsonbMode: 'replace' | 'merge'
  ) {
    const profilePatch =
      profile !== undefined && Object.keys(profile).length > 0 ? profile : undefined;

    if (profilePatch === undefined || jsonbMode === 'merge') {
      return profilePatch;
    }

    const user = await this.tenantContext.queries.users.findUserById(userId);

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

  private resolveCustomDataForUpdate(customData: JsonObject | undefined) {
    if (customData === undefined) {
      return;
    }

    return Object.keys(customData).length > 0 ? customData : undefined;
  }
}
