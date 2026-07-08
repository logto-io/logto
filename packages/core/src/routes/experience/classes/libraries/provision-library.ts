/* eslint-disable max-lines */
import { Component, CoreEvent, getEventName } from '@logto/app-insights/custom-event';
import { appInsights } from '@logto/app-insights/node';
import {
  adminConsoleApplicationId,
  adminTenantId,
  AdminTenantRole,
  defaultManagementApiAdminName,
  defaultTenantId,
  getTenantOrganizationId,
  getTenantRole,
  OrganizationInvitationStatus,
  SignInMode,
  TenantRole,
  type JsonObject,
  userMfaDataKey,
  userOnboardingDataKey,
  type User,
  type UserOnboardingData,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { condArray, conditional, conditionalArray, trySafe } from '@silverhand/essentials';

import { EnvSet } from '#src/env-set/index.js';
import { truncateMembershipDelta } from '#src/libraries/hook/utils.js';
import { buildUserPasswordPayload } from '#src/libraries/user.utils.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import { buildAppInsightsTelemetry } from '#src/utils/request.js';
import { getTenantId } from '#src/utils/tenant.js';

import {
  type InteractionProfile,
  type InteractionUserProvisioningProfile,
  type WithHooksAndLogsContext,
} from '../../types.js';
import { toUserSocialIdentityData } from '../utils.js';

import {
  assertEnterpriseSsoIdentityAvailable,
  getProfileIdentifierCollisionPayload,
} from './provisioning-profile.js';

type OrganizationProvisionPayload =
  | {
      userId: string;
      email: string;
    }
  | {
      userId: string;
      ssoConnectorId: string;
    }
  | {
      userId: string;
      organizationIds: string[];
    };

type ProvisioningCustomDataOptions = {
  mergeCustomData?: boolean;
};

type CreateUserOptions = {
  checkIdentifierCollision?: boolean;
} & ProvisioningCustomDataOptions;

type UpdateUserOptions = ProvisioningCustomDataOptions;

const mergeCreateUserCustomData = (
  existingCustomData: JsonObject | undefined,
  customData: JsonObject | undefined
): JsonObject | undefined => {
  const mergedCustomData =
    customData && Object.keys(customData).length > 0
      ? {
          ...customData,
          ...existingCustomData,
        }
      : existingCustomData;

  return mergedCustomData && Object.keys(mergedCustomData).length > 0
    ? mergedCustomData
    : undefined;
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

export class ProvisionLibrary {
  constructor(
    private readonly tenantContext: TenantContext,
    private readonly ctx: WithHooksAndLogsContext
  ) {}

  /**
   * Insert a new user into the Logto database using the provided profile.
   *
   * - Provision all JIT organizations for the user if necessary.
   * - Assign the first user to the admin role and the default tenant organization membership. [OSS only]
   */
  async createUser(
    profile: InteractionProfile,
    {
      checkIdentifierCollision: shouldCheckIdentifierCollision = false,
      mergeCustomData: shouldMergeCustomData = false,
    }: CreateUserOptions = {}
  ) {
    const {
      libraries: {
        users: { checkIdentifierCollision, generateUserId, insertUser },
        socials: { upsertSocialTokenSetSecret },
        ssoConnectors: { upsertEnterpriseSsoTokenSetSecret },
      },
    } = this.tenantContext;

    const {
      socialIdentity,
      enterpriseSsoIdentity,
      syncedEnterpriseSsoIdentity,
      jitOrganizationIds,
      socialConnectorTokenSetSecret,
      enterpriseSsoConnectorTokenSetSecret,
      passwordEncrypted,
      passwordEncryptionMethod,
      ...rest
    } = profile;

    if (shouldCheckIdentifierCollision) {
      await checkIdentifierCollision(getProfileIdentifierCollisionPayload(profile));
      await assertEnterpriseSsoIdentityAvailable(
        this.tenantContext.queries.userSsoIdentities,
        enterpriseSsoIdentity
      );
    }

    const { isCreatingFirstAdminUser, initialUserRoles, customData } =
      await this.getUserProvisionContext(profile);
    const customDataForInsert = shouldMergeCustomData
      ? mergeCreateUserCustomData(customData, profile.customData)
      : customData;

    const [user] = await insertUser(
      {
        id: await generateUserId(),
        ...rest,
        ...conditional(
          passwordEncrypted &&
            passwordEncryptionMethod &&
            buildUserPasswordPayload({
              passwordEncrypted,
              passwordEncryptionMethod,
            })
        ),
        ...conditional(socialIdentity && { identities: toUserSocialIdentityData(socialIdentity) }),
        ...conditional(customDataForInsert && { customData: customDataForInsert }),
        logtoConfig: {
          [userMfaDataKey]: { enabled: false },
        },
      },
      { roleNames: initialUserRoles, isInteractive: true }
    );

    if (enterpriseSsoIdentity) {
      await this.addSsoIdentityToUser(user.id, enterpriseSsoIdentity);
    }

    if (isCreatingFirstAdminUser) {
      await this.provisionForFirstAdminUser(user);
    }

    if (socialConnectorTokenSetSecret) {
      // Upsert token set secret should not break the normal social authentication and link flow
      await trySafe(
        async () => upsertSocialTokenSetSecret(user.id, socialConnectorTokenSetSecret),
        (error) => {
          void appInsights.trackException(error, buildAppInsightsTelemetry(this.ctx));
        }
      );
    }

    if (enterpriseSsoConnectorTokenSetSecret) {
      await upsertEnterpriseSsoTokenSetSecret(
        user.id,
        enterpriseSsoConnectorTokenSetSecret,
        this.ctx
      );
    }

    await this.provisionNewUserJitOrganizations(user.id, profile);

    this.ctx.appendDataHookContext('User.Created', { user });

    this.triggerAnalyticReports(user);

    return user;
  }

  async updateUser(
    userId: string,
    profile: InteractionUserProvisioningProfile,
    { mergeCustomData: shouldMergeCustomData = false }: UpdateUserOptions = {}
  ) {
    const { queries, libraries } = this.tenantContext;

    await libraries.users.checkIdentifierCollision(
      getProfileIdentifierCollisionPayload(profile),
      userId
    );

    const { passwordEncrypted, passwordEncryptionMethod, customData, ...updateProfile } = profile;
    const customDataForUpdate = await this.resolveCustomDataForUpdate(
      userId,
      customData,
      shouldMergeCustomData
    );
    const updatePayload = {
      ...updateProfile,
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

    if (Object.keys(updatePayload).length === 0) {
      return queries.users.findUserById(userId);
    }

    const user = await queries.users.updateUserById(userId, updatePayload);

    this.ctx.appendDataHookContext('User.Data.Updated', { user });

    return user;
  }

  async addSsoIdentityToUser(
    userId: string,
    enterpriseSsoIdentity: Required<InteractionProfile>['enterpriseSsoIdentity']
  ) {
    const {
      queries: { userSsoIdentities: userSsoIdentitiesQueries },
    } = this.tenantContext;

    await userSsoIdentitiesQueries.insert({
      id: generateStandardId(),
      userId,
      ...enterpriseSsoIdentity,
    });

    await this.provisionNewUserJitOrganizations(userId, { enterpriseSsoIdentity });
  }

  /**
   * Add the user to the specified organizations. This function is called when an existing
   * user is invited to organization(s) by admin through one-time token (e.g. Magic link).
   */
  async provisionJitOrganization(payload: OrganizationProvisionPayload) {
    const {
      libraries: { users: usersLibraries },
    } = this.tenantContext;

    const provisionedOrganizations = await usersLibraries.provisionOrganizations(payload);

    for (const { organizationId } of provisionedOrganizations) {
      this.ctx.appendDataHookContext('Organization.Membership.Updated', {
        organizationId,
        ...truncateMembershipDelta({ addedUserIds: [payload.userId] }),
      });
    }

    return provisionedOrganizations;
  }

  /**
   * This method is used to get the provision context for a new user registration.
   * It will return the provision context based on the current tenant and the request context.
   */
  private async resolveCustomDataForUpdate(
    userId: string,
    customData: JsonObject | undefined,
    shouldMergeCustomData: boolean
  ): Promise<JsonObject | undefined> {
    if (customData === undefined) {
      return undefined;
    }

    if (!shouldMergeCustomData) {
      return customData;
    }

    if (Object.keys(customData).length === 0) {
      return undefined;
    }

    const existingUser = await this.tenantContext.queries.users.findUserById(userId);

    return mergeUpdateUserCustomData(existingUser.customData, customData);
  }

  private async getUserProvisionContext(profile: InteractionProfile): Promise<{
    /** Admin user provisioning flag */
    isCreatingFirstAdminUser: boolean;
    /** Initial user roles for admin tenant users */
    initialUserRoles: string[];
    /** Skip onboarding flow if the new user has pending Cloud invitations */
    customData?: JsonObject;
  }> {
    const {
      provider,
      queries: {
        users: { hasActiveUsers },
        organizations: organizationsQueries,
      },
    } = this.tenantContext;

    const { req, res, URL } = this.ctx;

    const [interactionDetails, [currentTenantId]] = await Promise.all([
      provider.interactionDetails(req, res),
      getTenantId(URL),
    ]);

    const {
      params: { client_id },
    } = interactionDetails;

    const isAdminTenant = currentTenantId === adminTenantId;
    const isAdminConsoleApp = String(client_id) === adminConsoleApplicationId;

    const { isCloud, isIntegrationTest } = EnvSet.values;

    /**
     * Only allow creating the first admin user when
     *
     * - it's in OSS or integration tests
     * - it's in the admin tenant
     * - the client_id is the admin console application
     * - there are no active users in the tenant
     */
    const isCreatingFirstAdminUser =
      (!isCloud || isIntegrationTest) &&
      isAdminTenant &&
      isAdminConsoleApp &&
      !(await hasActiveUsers());

    const invitations =
      isCloud && profile.primaryEmail
        ? await organizationsQueries.invitations.findEntities({
            invitee: profile.primaryEmail,
          })
        : [];

    const hasPendingInvitations = invitations.some(
      (invitation) => invitation.status === OrganizationInvitationStatus.Pending
    );

    const initialUserRoles = this.getInitialUserRoles(
      isAdminTenant,
      isCreatingFirstAdminUser,
      isCloud
    );

    // Skip onboarding flow if the new user has pending Cloud invitations
    const customData = hasPendingInvitations
      ? {
          [userOnboardingDataKey]: {
            isOnboardingDone: true,
          } satisfies UserOnboardingData,
        }
      : undefined;

    return {
      isCreatingFirstAdminUser,
      initialUserRoles,
      customData,
    };
  }

  /**
   * Provision the organization for a new user
   *
   * - If the user has an enterprise SSO identity, provision the organization based on the SSO connector
   * - Otherwise, provision the organization based on the primary email
   */
  private async provisionNewUserJitOrganizations(
    userId: string,
    { primaryEmail, enterpriseSsoIdentity, jitOrganizationIds }: InteractionProfile
  ) {
    const extraJitOrganizations = condArray(
      jitOrganizationIds &&
        (await this.provisionJitOrganization({
          userId,
          organizationIds: jitOrganizationIds,
        }))
    );
    if (enterpriseSsoIdentity) {
      return [
        ...extraJitOrganizations,
        ...(await this.provisionJitOrganization({
          userId,
          ssoConnectorId: enterpriseSsoIdentity.ssoConnectorId,
        })),
      ];
    }
    if (primaryEmail) {
      return [
        ...extraJitOrganizations,
        ...(await this.provisionJitOrganization({
          userId,
          email: primaryEmail,
        })),
      ];
    }
  }

  /**
   * First admin user provision
   *
   * - For OSS, update the default sign-in experience to "sign-in only" once the first admin has been created.
   * - Add the user to the default organization and assign the admin role.
   */
  private async provisionForFirstAdminUser({ id }: User) {
    const { isCloud } = EnvSet.values;

    const {
      queries: { signInExperiences, organizations },
    } = this.tenantContext;

    // In OSS, we need to limit sign-in experience to "sign-in only" once
    // the first admin has been create since we don't want other unexpected registrations
    await signInExperiences.updateDefaultSignInExperience({
      signInMode: isCloud ? SignInMode.SignInAndRegister : SignInMode.SignIn,
    });

    const organizationId = getTenantOrganizationId(defaultTenantId);
    await organizations.relations.users.insert({ organizationId, userId: id });
    await organizations.relations.usersRoles.insert({
      organizationId,
      userId: id,
      organizationRoleId: getTenantRole(TenantRole.Admin).id,
    });
  }

  private readonly getInitialUserRoles = (
    isInAdminTenant: boolean,
    isCreatingFirstAdminUser: boolean,
    isCloud: boolean
  ) =>
    conditionalArray<string>(
      isInAdminTenant && AdminTenantRole.User,
      isCreatingFirstAdminUser && !isCloud && defaultManagementApiAdminName // OSS uses the legacy Management API user role
    );

  private readonly triggerAnalyticReports = ({ id }: User) => {
    appInsights.client?.trackEvent({
      name: getEventName(Component.Core, CoreEvent.Register),
    });
  };
}
/* eslint-enable max-lines */
