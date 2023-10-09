import { Component, CoreEvent, getEventName } from '@logto/app-insights/custom-event';
import { appInsights } from '@logto/app-insights/node';
import type { User } from '@logto/schemas';
import {
  AdminTenantRole,
  SignInMode,
  getManagementApiAdminName,
  defaultTenantId,
  adminTenantId,
  InteractionEvent,
  adminConsoleApplicationId,
  MfaFactor,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { conditional, conditionalArray, trySafe } from '@silverhand/essentials';

import { EnvSet } from '#src/env-set/index.js';
import { assignInteractionResults } from '#src/libraries/session.js';
import { encryptUserPassword } from '#src/libraries/user.js';
import type { LogEntry, WithLogContext } from '#src/middleware/koa-audit-log.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import { consoleLog } from '#src/utils/console.js';
import { getTenantId } from '#src/utils/tenant.js';

import type { WithInteractionDetailsContext } from '../middleware/koa-interaction-details.js';
import { type WithInteractionHooksContext } from '../middleware/koa-interaction-hooks.js';
import type {
  VerifiedInteractionResult,
  VerifiedSignInInteractionResult,
  VerifiedRegisterInteractionResult,
} from '../types/index.js';
import { clearInteractionStorage } from '../utils/interaction.js';

import { postAffiliateLogs, parseUserProfile } from './helpers.js';

const parseBindMfa = ({
  bindMfa,
}: VerifiedSignInInteractionResult | VerifiedRegisterInteractionResult):
  | User['mfaVerifications'][number]
  | undefined => {
  if (!bindMfa) {
    return;
  }

  if (bindMfa.type === MfaFactor.TOTP) {
    return {
      type: MfaFactor.TOTP,
      key: bindMfa.secret,
      id: generateStandardId(),
      createdAt: new Date().toISOString(),
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (bindMfa.type === MfaFactor.WebAuthn) {
    return {
      type: MfaFactor.WebAuthn,
      credentialId: bindMfa.credentialId,
      publicKey: bindMfa.publicKey,
      counter: bindMfa.counter,
      agent: bindMfa.agent,
      transports: bindMfa.transports,
      id: generateStandardId(),
      createdAt: new Date().toISOString(),
    };
  }
};

const getInitialUserRoles = (
  isInAdminTenant: boolean,
  isCreatingFirstAdminUser: boolean,
  isCloud: boolean
) =>
  conditionalArray<string>(
    isInAdminTenant && AdminTenantRole.User,
    isCreatingFirstAdminUser && getManagementApiAdminName(defaultTenantId),
    isCreatingFirstAdminUser && isCloud && getManagementApiAdminName(adminTenantId)
  );

export default async function submitInteraction(
  interaction: VerifiedInteractionResult,
  ctx: WithLogContext & WithInteractionDetailsContext & WithInteractionHooksContext,
  tenantContext: TenantContext,
  log?: LogEntry
) {
  const { provider, libraries, queries, cloudConnection, id: tenantId } = tenantContext;
  const { hasActiveUsers, findUserById, updateUserById } = queries.users;
  const { updateDefaultSignInExperience } = queries.signInExperiences;

  const {
    users: { generateUserId, insertUser },
  } = libraries;
  const { event, profile } = interaction;

  if (event === InteractionEvent.Register) {
    const { pendingAccountId } = interaction;
    const id = pendingAccountId ?? (await generateUserId());
    const userProfile = await parseUserProfile(tenantContext, interaction);
    const mfaVerification = parseBindMfa(interaction);

    const { client_id } = ctx.interactionDetails.params;

    const { isCloud } = EnvSet.values;
    const isInAdminTenant = (await getTenantId(ctx.URL)) === adminTenantId;
    const isCreatingFirstAdminUser =
      isInAdminTenant &&
      String(client_id) === adminConsoleApplicationId &&
      !(await hasActiveUsers());

    await insertUser(
      {
        id,
        ...userProfile,
        ...conditional(mfaVerification && { mfaVerifications: [mfaVerification] }),
      },
      getInitialUserRoles(isInAdminTenant, isCreatingFirstAdminUser, isCloud)
    );

    // In OSS, we need to limit sign-in experience to "sign-in only" once
    // the first admin has been create since we don't want other unexpected registrations
    if (isCreatingFirstAdminUser) {
      await updateDefaultSignInExperience({
        signInMode: isCloud ? SignInMode.SignInAndRegister : SignInMode.SignIn,
      });
    }

    await assignInteractionResults(ctx, provider, { login: { accountId: id } });
    ctx.assignInteractionHookResult({ userId: id });

    log?.append({ userId: id });
    appInsights.client?.trackEvent({ name: getEventName(Component.Core, CoreEvent.Register) });
    void trySafe(postAffiliateLogs(ctx, cloudConnection, id, tenantId), (error) => {
      consoleLog.warn('Failed to post affiliate logs', error);
      void appInsights.trackException(error);
    });

    return;
  }

  const { accountId } = interaction;
  log?.append({ userId: accountId });

  if (event === InteractionEvent.SignIn) {
    const user = await findUserById(accountId);
    const updateUserProfile = await parseUserProfile(tenantContext, interaction, user);
    const mfaVerification = parseBindMfa(interaction);

    await updateUserById(accountId, {
      ...updateUserProfile,
      ...conditional(
        mfaVerification && { mfaVerifications: [...user.mfaVerifications, mfaVerification] }
      ),
    });
    await assignInteractionResults(ctx, provider, { login: { accountId } });
    ctx.assignInteractionHookResult({ userId: accountId });

    appInsights.client?.trackEvent({ name: getEventName(Component.Core, CoreEvent.SignIn) });

    return;
  }

  // Forgot Password
  const { passwordEncrypted, passwordEncryptionMethod } = await encryptUserPassword(
    profile.password
  );

  await updateUserById(accountId, { passwordEncrypted, passwordEncryptionMethod });
  ctx.assignInteractionHookResult({ userId: accountId });
  await clearInteractionStorage(ctx, provider);
  ctx.status = 204;
}
