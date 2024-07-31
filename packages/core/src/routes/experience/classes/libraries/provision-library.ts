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
  userOnboardingDataKey,
  type User,
  type UserOnboardingData,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { conditional, conditionalArray, trySafe } from '@silverhand/essentials';

import { EnvSet } from '#src/env-set/index.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';
import { buildAppInsightsTelemetry } from '#src/utils/request.js';
import { getTenantId } from '#src/utils/tenant.js';

import { type InteractionProfile, type WithHooksAndLogsContext } from '../../types.js';
import { postAffiliateLogs } from '../helpers.js';
import { toUserSocialIdentityData } from '../utils.js';

type OrganizationProvisionPayload =
  | {
      userId: string;
      email: string;
    }
  | {
      userId: string;
      ssoConnectorId: string;
    };

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
  async createUser(profile: InteractionProfile) {
    const {
      libraries: {
        users: { generateUserId, insertUser },
      },
      queries: { userSsoIdentities: userSsoIdentitiesQueries },
    } = this.tenantContext;

    const { socialIdentity, enterpriseSsoIdentity, ...rest } = profile;

    const { isCreatingFirstAdminUser, initialUserRoles, customData } =
      await this.getUserProvisionContext(profile);

    const [user] = await insertUser(
      {
        id: await generateUserId(),
        ...rest,
        ...conditional(socialIdentity && { identities: toUserSocialIdentityData(socialIdentity) }),
        ...conditional(customData && { customData }),
      },
      initialUserRoles
    );

    if (enterpriseSsoIdentity) {
      await userSsoIdentitiesQueries.insert({
        id: generateStandardId(),
        userId: user.id,
        ...enterpriseSsoIdentity,
      });
    }

    if (isCreatingFirstAdminUser) {
      await this.provisionForFirstAdminUser(user);
    }

    await this.provisionNewUserJitOrganizations(user.id, profile);

    this.ctx.appendDataHookContext('User.Created', { user });
    // TODO: log

    this.triggerAnalyticReports(user);

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
   * This method is used to get the provision context for a new user registration.
   * It will return the provision context based on the current tenant and the request context.
   */
  private async getUserProvisionContext(profile: InteractionProfile): Promise<{
    /** Admin user provisioning flag */
    isCreatingFirstAdminUser: boolean;
    /** Initial user roles for admin tenant users */
    initialUserRoles: string[];
    /** Skip onboarding flow if the new user has pending Cloud invitations */
    customData?: { [userOnboardingDataKey]: UserOnboardingData };
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
    { primaryEmail, enterpriseSsoIdentity }: InteractionProfile
  ) {
    if (enterpriseSsoIdentity) {
      return this.provisionJitOrganization({
        userId,
        ssoConnectorId: enterpriseSsoIdentity.ssoConnectorId,
      });
    }
    if (primaryEmail) {
      return this.provisionJitOrganization({
        userId,
        email: primaryEmail,
      });
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

  private async provisionJitOrganization(payload: OrganizationProvisionPayload) {
    const {
      libraries: { users: usersLibraries },
    } = this.tenantContext;

    const provisionedOrganizations = await usersLibraries.provisionOrganizations(payload);

    for (const { organizationId } of provisionedOrganizations) {
      this.ctx.appendDataHookContext('Organization.Membership.Updated', {
        organizationId,
      });
    }

    return provisionedOrganizations;
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

    const { cloudConnection, id: tenantId } = this.tenantContext;

    void trySafe(postAffiliateLogs(this.ctx, cloudConnection, id, tenantId), (error) => {
      getConsoleLogFromContext(this.ctx).warn('Failed to post affiliate logs', error);
      void appInsights.trackException(error, buildAppInsightsTelemetry(this.ctx));
    });
  };
}
