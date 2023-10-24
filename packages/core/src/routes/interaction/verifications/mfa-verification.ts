import { InteractionEvent, MfaFactor, MfaPolicy, type JsonObject } from '@logto/schemas';
import { deduplicate } from '@silverhand/essentials';
import { type Context } from 'koa';
import type Provider from 'oidc-provider';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import { type WithInteractionDetailsContext } from '../middleware/koa-interaction-details.js';
import { type WithInteractionSieContext } from '../middleware/koa-interaction-sie.js';
import {
  type VerifiedSignInInteractionResult,
  type VerifiedInteractionResult,
  type VerifiedRegisterInteractionResult,
  type AccountVerifiedInteractionResult,
} from '../types/index.js';
import { generateBackupCodes } from '../utils/backup-code-validation.js';
import { storeInteractionResult } from '../utils/interaction.js';

export const verifyBindMfa = async (
  tenant: TenantContext,
  interaction: VerifiedSignInInteractionResult | VerifiedRegisterInteractionResult
): Promise<VerifiedInteractionResult> => {
  const { bindMfas = [], event } = interaction;

  if (bindMfas.length === 0 || event !== InteractionEvent.SignIn) {
    return interaction;
  }

  const totp = bindMfas.find(({ type }) => type === MfaFactor.TOTP);

  if (totp) {
    const { accountId } = interaction;
    const { mfaVerifications } = await tenant.queries.users.findUserById(accountId);

    // A user can only bind one TOTP factor
    assertThat(
      mfaVerifications.every(({ type }) => type !== MfaFactor.TOTP),
      new RequestError({
        code: 'user.totp_already_in_use',
        status: 422,
      })
    );
  }

  return interaction;
};

export const verifyMfa = async (
  tenant: TenantContext,
  interaction: AccountVerifiedInteractionResult
): Promise<AccountVerifiedInteractionResult> => {
  const { accountId, verifiedMfa } = interaction;

  const { mfaVerifications } = await tenant.queries.users.findUserById(accountId);

  if (mfaVerifications.length > 0) {
    assertThat(
      verifiedMfa,
      new RequestError(
        {
          code: 'session.mfa.require_mfa_verification',
          status: 403,
        },
        {
          availableFactors: deduplicate(mfaVerifications.map(({ type }) => type)),
        }
      )
    );
  }

  return interaction;
};

const userMfaDataKey = 'mfa';
/**
 * Check if the user has skipped MFA binding
 */
const isMfaSkipped = (customData: JsonObject): boolean => {
  const userMfaDataGuard = z.object({
    skipped: z.boolean().optional(),
  });

  const parsed = z.object({ [userMfaDataKey]: userMfaDataGuard }).safeParse(customData);

  return parsed.success ? parsed.data[userMfaDataKey].skipped === true : false;
};

const validateMandatoryBindMfaForSignIn = async (
  tenant: TenantContext,
  ctx: WithInteractionSieContext & WithInteractionDetailsContext,
  interaction: VerifiedSignInInteractionResult
): Promise<VerifiedInteractionResult> => {
  const {
    mfa: { policy, factors },
  } = ctx.signInExperience;
  const { bindMfas } = interaction;
  const availableFactors = factors.filter((factor) => factor !== MfaFactor.BackupCode);

  // No available MFA, skip check
  if (availableFactors.length === 0) {
    return interaction;
  }

  // If the user has linked new MFA in current interaction
  const hasFactorInBindMfas = Boolean(
    bindMfas &&
      availableFactors.some((factor) => bindMfas.some((bindMfa) => bindMfa.type === factor))
  );

  const { accountId } = interaction;
  const { mfaVerifications, customData } = await tenant.queries.users.findUserById(accountId);

  // If the user has linked MFA before
  const hasFactorInUser = factors.some((factor) =>
    mfaVerifications.some(({ type }) => type === factor)
  );

  // MFA is bound in current interaction or MFA is bound before, skip check
  if (hasFactorInBindMfas || hasFactorInUser) {
    return interaction;
  }

  // Mandatory, can not skip, throw error
  if (policy === MfaPolicy.Mandatory) {
    throw new RequestError(
      {
        code: 'user.missing_mfa',
        status: 422,
      },
      { availableFactors }
    );
  }

  if (isMfaSkipped(customData)) {
    return interaction;
  }

  if (!isMfaSkipped(customData)) {
    // Update user custom data to skip MFA binding
    // that means that this prompt is only shown once
    await tenant.queries.users.updateUserById(accountId, {
      customData: {
        ...customData,
        [userMfaDataKey]: {
          skipped: true,
        },
      },
    });
  }

  throw new RequestError(
    {
      code: 'user.missing_mfa',
      status: 422,
    },
    { availableFactors, skippable: true }
  );
};

export const validateMandatoryBindMfa = async (
  tenant: TenantContext,
  ctx: WithInteractionSieContext & WithInteractionDetailsContext,
  interaction: VerifiedSignInInteractionResult | VerifiedRegisterInteractionResult
): Promise<VerifiedInteractionResult> => {
  const {
    mfa: { policy, factors },
  } = ctx.signInExperience;
  const { event, bindMfas } = interaction;
  const availableFactors = factors.filter((factor) => factor !== MfaFactor.BackupCode);

  // No available MFA, skip check
  if (availableFactors.length === 0) {
    return interaction;
  }

  const hasFactorInBind = Boolean(
    bindMfas &&
      availableFactors.some((factor) => bindMfas.some((bindMfa) => bindMfa.type === factor))
  );

  if (event === InteractionEvent.Register) {
    if (policy !== MfaPolicy.Mandatory) {
      return interaction;
    }

    assertThat(
      hasFactorInBind,
      new RequestError(
        {
          code: 'user.missing_mfa',
          status: 422,
        },
        { availableFactors }
      )
    );
  }

  if (event === InteractionEvent.SignIn) {
    return validateMandatoryBindMfaForSignIn(tenant, ctx, interaction);
  }

  return interaction;
};

/**
 * Check if backup code is configured, if backup code is enabled in sign-in experience,
 * and at least one MFA is configured, then backup code is required.
 */
export const validateBindMfaBackupCode = async (
  tenant: TenantContext,
  ctx: Context & WithInteractionSieContext & WithInteractionDetailsContext,
  interaction: VerifiedSignInInteractionResult | VerifiedRegisterInteractionResult,
  provider: Provider
): Promise<VerifiedInteractionResult> => {
  const {
    mfa: { factors },
  } = ctx.signInExperience;
  const { bindMfas = [], event } = interaction;

  if (
    !factors.includes(MfaFactor.BackupCode) ||
    bindMfas.length === 0 ||
    bindMfas.some(({ type }) => type === MfaFactor.BackupCode)
  ) {
    return interaction;
  }

  if (event === InteractionEvent.SignIn) {
    const { accountId } = interaction;
    const { mfaVerifications } = await tenant.queries.users.findUserById(accountId);

    if (
      mfaVerifications.some((verification) => {
        return (
          verification.type === MfaFactor.BackupCode &&
          verification.codes.some((code) => !code.usedAt)
        );
      })
    ) {
      // Skip check if there is a backup code that is not used
      return interaction;
    }
  }

  const codes = generateBackupCodes();

  await storeInteractionResult(
    {
      pendingMfa: { type: MfaFactor.BackupCode, codes },
    },
    ctx,
    provider,
    true
  );

  throw new RequestError(
    {
      code: 'session.mfa.backup_code_required',
    },
    // Send backup codes to client, so that user can download them
    { codes }
  );
};
