import { type JsonObject } from '@logto/schemas';
import { conditional, removeUndefinedKeys } from '@silverhand/essentials';

import { buildUserPasswordPayload } from '#src/libraries/user.utils.js';
import { createUserQueries } from '#src/queries/user.js';
import type TenantContext from '#src/tenants/TenantContext.js';

import {
  type InteractionUserProvisioningProfile,
  type WithHooksAndLogsContext,
} from '../../types.js';

import { getProfileIdentifierCollisionPayload } from './provisioning-profile.js';

type UpdateUserOptions = {
  /**
   * When true, shallow-merge `customData` at the SQL layer (Postgres `jsonb ||`).
   * Nested objects are replaced wholesale, not deep-merged.
   * When false (default), replace the entire `customData` object.
   * An empty `customData` object (`{}`) is ignored and does not clear stored data.
   */
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
    const profileForUpdate = this.resolveProfileForUpdate(profile);
    const shouldReplaceCustomData = customDataForUpdate !== undefined && !shouldMergeCustomData;
    const updatePayload = this.buildUpdateUserPayload({
      updateProfile,
      profileForUpdate,
      // Keep customData out of the merge payload when it must be replaced atomically.
      customDataForUpdate: shouldReplaceCustomData ? undefined : customDataForUpdate,
      passwordEncrypted,
      passwordEncryptionMethod,
    });

    if (!shouldReplaceCustomData) {
      if (Object.keys(updatePayload).length === 0) {
        return queries.users.findUserById(userId);
      }

      const user = await queries.users.updateUserById(userId, updatePayload, 'merge');

      this.ctx.appendDataHookContext('User.Data.Updated', { user });

      return user;
    }

    // Profile (and other fields) use SQL-layer jsonb merge so concurrent profile
    // patches are not clobbered; customData is replaced in a separate update.
    // Run both statements in one transaction so a failed replace cannot leave a
    // partial merge committed.
    const user =
      Object.keys(updatePayload).length === 0
        ? await queries.users.updateUserById(userId, { customData: customDataForUpdate }, 'replace')
        : await queries.pool.transaction(async (connection) => {
            const userQueries = createUserQueries(connection);

            await userQueries.updateUserById(userId, updatePayload, 'merge');

            return userQueries.updateUserById(
              userId,
              { customData: customDataForUpdate },
              'replace'
            );
          });

    this.ctx.appendDataHookContext('User.Data.Updated', { user });

    return user;
  }

  private resolveProfileForUpdate(profile: InteractionUserProvisioningProfile['profile']) {
    if (profile === undefined || Object.keys(profile).length === 0) {
      return;
    }

    return profile;
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
    return removeUndefinedKeys({
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
    });
  }

  private resolveCustomDataForUpdate(customData: JsonObject | undefined) {
    if (customData === undefined) {
      return;
    }

    return Object.keys(customData).length > 0 ? customData : undefined;
  }
}
