import { Component, CoreEvent, getEventName } from '@logto/app-insights/custom-event';
import { appInsights } from '@logto/app-insights/node';
import type { User, UserOnboardingData } from '@logto/schemas';
import {
  AdminTenantRole,
  InteractionEvent,
  MfaFactor,
  OrganizationInvitationStatus,
  SignInMode,
  TenantRole,
  adminConsoleApplicationId,
  adminTenantId,
  defaultManagementApiAdminName,
  defaultTenantId,
  getTenantOrganizationId,
  getTenantRole,
  userMfaDataKey,
  userOnboardingDataKey,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { conditional, conditionalArray, trySafe } from '@silverhand/essentials';

import { EnvSet } from '#src/env-set/index.js';
import { assignInteractionResults } from '#src/libraries/session.js';
import { encryptUserPassword } from '#src/libraries/user.utils.js';
import type { LogEntry, WithLogContext } from '#src/middleware/koa-audit-log.js';
import type { WithInteractionDetailsContext } from '#src/middleware/koa-interaction-details.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';
import { buildAppInsightsTelemetry } from '#src/utils/request.js';
import { getTenantId } from '#src/utils/tenant.js';

import { type WithInteractionHooksContext } from '../middleware/koa-interaction-hooks.js';
import type {
  VerifiedInteractionResult,
  VerifiedRegisterInteractionResult,
  VerifiedSignInInteractionResult,
} from '../types/index.js';
import { clearInteractionStorage } from '../utils/interaction.js';

import { hasUpdatedProfile, parseUserProfile, postAffiliateLogs } from './helpers.js';

const parseBindMfas = ({
  bindMfas,
}:
  | VerifiedSignInInteractionResult
  | VerifiedRegisterInteractionResult): User['mfaVerifications'] => {
  if (!bindMfas) {
    return [];
  }

  return bindMfas.map((bindMfa) => {
    if (bindMfa.type === MfaFactor.TOTP) {
      return {
        type: MfaFactor.TOTP,
        key: bindMfa.secret,
        id: generateStandardId(),
        createdAt: new Date().toISOString(),
      };
    }

    if (bindMfa.type === MfaFactor.WebAuthn) {
      return {
        ...bindMfa,
        id: generateStandardId(),
        createdAt: new Date().toISOString(),
      };
    }

    // MfaFactor.PhoneVerificationCode
    return {
      id: generateStandardId(),
      createdAt: new Date().toISOString(),
      type: MfaFactor.BackupCode,
      codes: bindMfa.codes.map((code) => ({ code })),
    };
  });
};

const getInitialUserRoles = (
  isInAdminTenant: boolean,
  isCreatingFirstAdminUser: boolean,
  isCloud: boolean
) =>
  conditionalArray<string>(
    isInAdminTenant && AdminTenantRole.User,
    isCreatingFirstAdminUser && !isCloud && defaultManagementApiAdminName // OSS uses the legacy Management API user role
  );

// eslint-disable-next-line complexity -- @simeng refactor me
async function handleSubmitRegister(
  interaction: VerifiedRegisterInteractionResult,
  ctx: WithLogContext & WithInteractionDetailsContext & WithInteractionHooksContext,
  tenantContext: TenantContext,
  log?: LogEntry
) {
  const { provider, libraries, queries, cloudConnection, id: tenantId } = tenantContext;
  const {
    users: { hasActiveUsers },
    signInExperiences: { updateDefaultSignInExperience },
    organizations,
  } = queries;

  const {
    users: { generateUserId, insertUser },
  } = libraries;

  const { pendingAccountId, mfaSkipped } = interaction;
  const id = pendingAccountId ?? (await generateUserId());
  const userProfile = await parseUserProfile(tenantContext, interaction);
  const mfaVerifications = parseBindMfas(interaction);

  const { client_id } = ctx.interactionDetails.params;

  const { isCloud, isIntegrationTest } = EnvSet.values;
  const [currentTenantId] = await getTenantId(ctx.URL);
  const isInAdminTenant = currentTenantId === adminTenantId;
  /**
   * Only allow creating the first admin user when it's in OSS or integration tests to avoid
   * security issues.
   */
  const isCreatingFirstAdminUser =
    (!isCloud || isIntegrationTest) &&
    isInAdminTenant &&
    String(client_id) === adminConsoleApplicationId &&
    !(await hasActiveUsers());

  // If it's Logto Cloud, Check if the new user has any pending invitations, if yes, skip onboarding flow.
  const invitations =
    isCloud && userProfile.primaryEmail
      ? await organizations.invitations.findEntities({
          invitee: userProfile.primaryEmail,
        })
      : [];
  const hasPendingInvitations = invitations.some(
    (invitation) => invitation.status === OrganizationInvitationStatus.Pending
  );

  const [user] = await insertUser(
    {
      id,
      ...userProfile,
      ...conditional(
        mfaVerifications.length > 0 && {
          mfaVerifications,
        }
      ),
      ...conditional(
        // Skip onboarding flow if the new user has pending Cloud invitations
        hasPendingInvitations && {
          customData: {
            [userOnboardingDataKey]: {
              isOnboardingDone: true,
            } satisfies UserOnboardingData,
          },
        }
      ),
      ...conditional(
        mfaSkipped && {
          logtoConfig: {
            [userMfaDataKey]: {
              skipped: true,
            },
          },
        }
      ),
    },
    getInitialUserRoles(isInAdminTenant, isCreatingFirstAdminUser, isCloud)
  );

  if (isCreatingFirstAdminUser) {
    // In OSS, we need to limit sign-in experience to "sign-in only" once
    // the first admin has been create since we don't want other unexpected registrations
    await updateDefaultSignInExperience({
      signInMode: isCloud ? SignInMode.SignInAndRegister : SignInMode.SignIn,
    });

    // Create tenant organization and assign the admin user to it.
    // This is only for Cloud integration tests and data alignment, OSS still uses the legacy Management API user role.
    const organizationId = getTenantOrganizationId(defaultTenantId);
    await organizations.relations.users.insert({ organizationId, userId: id });
    await organizations.relations.usersRoles.insert({
      organizationId,
      organizationRoleId: getTenantRole(TenantRole.Admin).id,
      userId: id,
    });
  }

  await assignInteractionResults(ctx, provider, { login: { accountId: id } });

  ctx.assignInteractionHookResult({ userId: id });
  ctx.appendDataHookContext('User.Created', { user });

  // JIT provisioning for email domain
  if (user.primaryEmail) {
    const provisionedOrganizations = await libraries.users.provisionOrganizations({
      userId: id,
      email: user.primaryEmail,
    });

    for (const { organizationId } of provisionedOrganizations) {
      ctx.appendDataHookContext('Organization.Membership.Updated', {
        organizationId,
      });
    }
  }

  log?.append({ userId: id });
  appInsights.client?.trackEvent({
    name: getEventName(Component.Core, CoreEvent.Register),
  });

  void trySafe(postAffiliateLogs(ctx, cloudConnection, id, tenantId), (error) => {
    getConsoleLogFromContext(ctx).warn('Failed to post affiliate logs', error);
    void appInsights.trackException(error, buildAppInsightsTelemetry(ctx));
  });
}

async function handleSubmitSignIn(
  interaction: VerifiedSignInInteractionResult,
  ctx: WithLogContext & WithInteractionDetailsContext & WithInteractionHooksContext,
  tenantContext: TenantContext,
  log?: LogEntry
) {
  const { provider, queries } = tenantContext;
  const { findUserById, updateUserById } = queries.users;

  const { accountId } = interaction;
  log?.append({ userId: accountId });

  const user = await findUserById(accountId);
  const updateUserProfile = await parseUserProfile(tenantContext, interaction, user);
  const mfaVerifications = parseBindMfas(interaction);
  const { mfaSkipped } = interaction;

  const updatedUser = await updateUserById(accountId, {
    ...updateUserProfile,
    ...conditional(
      mfaVerifications.length > 0 && {
        mfaVerifications: [...user.mfaVerifications, ...mfaVerifications],
      }
    ),
    ...conditional(
      mfaSkipped && {
        logtoConfig: {
          ...user.logtoConfig,
          [userMfaDataKey]: {
            skipped: true,
          },
        },
      }
    ),
  });

  await assignInteractionResults(ctx, provider, { login: { accountId } });

  ctx.assignInteractionHookResult({ userId: accountId });
  // Trigger user.updated data hook event if the user profile or mfa data is updated
  if (hasUpdatedProfile(updateUserProfile) || mfaVerifications.length > 0) {
    ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });
  }

  appInsights.client?.trackEvent({
    name: getEventName(Component.Core, CoreEvent.SignIn),
  });
}

export default async function submitInteraction(
  interaction: VerifiedInteractionResult,
  ctx: WithLogContext & WithInteractionDetailsContext & WithInteractionHooksContext,
  tenantContext: TenantContext,
  log?: LogEntry
) {
  const { provider, queries } = tenantContext;
  const { updateUserById } = queries.users;
  const { event, profile } = interaction;

  if (event === InteractionEvent.Register) {
    return handleSubmitRegister(interaction, ctx, tenantContext, log);
  }

  const { accountId } = interaction;
  log?.append({ userId: accountId });

  if (event === InteractionEvent.SignIn) {
    return handleSubmitSignIn(interaction, ctx, tenantContext, log);
  }

  // Forgot Password
  const { passwordEncrypted, passwordEncryptionMethod } = await encryptUserPassword(
    profile.password
  );

  const user = await updateUserById(accountId, {
    passwordEncrypted,
    passwordEncryptionMethod,
  });
  ctx.assignInteractionHookResult({ userId: accountId });
  ctx.appendDataHookContext('User.Data.Updated', { user });

  await clearInteractionStorage(ctx, provider);
  ctx.status = 204;
}
