import {
  InteractionEvent,
  MfaFactor,
  MfaPolicy,
  type JsonObject,
  type MfaVerification,
} from '@logto/schemas';
import { type Context } from 'koa';
import type Provider from 'oidc-provider';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { type WithInteractionDetailsContext } from '#src/middleware/koa-interaction-details.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import { type WithInteractionSieContext } from '../middleware/koa-interaction-sie.js';
import {
  type AccountVerifiedInteractionResult,
  type VerifiedInteractionResult,
  type VerifiedRegisterInteractionResult,
  type VerifiedSignInInteractionResult,
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
  ctx: WithInteractionSieContext,
  tenant: TenantContext,
  interaction: AccountVerifiedInteractionResult
): Promise<AccountVerifiedInteractionResult> => {
  const {
    signInExperience: {
      mfa: { factors },
    },
  } = ctx;
  const { accountId, verifiedMfa } = interaction;

  const { mfaVerifications } = await tenant.queries.users.findUserById(accountId);
  const availableUserVerifications = mfaVerifications
    .filter((verification) => {
      // Only allow MFA that is configured in sign-in experience
      if (!factors.includes(verification.type)) {
        return false;
      }

      if (verification.type !== MfaFactor.BackupCode) {
        return true;
      }

      // Skip backup code if it is used
      return verification.codes.some((code) => !code.usedAt);
    })
    .reduce<MfaVerification[]>((factors, verification) => {
      // Ingnore duplicated verification
      if (factors.some(({ type }) => type === verification.type)) {
        return factors;
      }

      return [...factors, verification];
    }, [])
    .slice()
    .sort((factorA, factorB) => {
      // Sort by last used time, the latest used factor is the first one, backup code is always the last one
      if (factorA.type === MfaFactor.BackupCode) {
        return 1;
      }

      if (factorB.type === MfaFactor.BackupCode) {
        return -1;
      }

      return (
        new Date(factorB.lastUsedAt ?? 0).getTime() - new Date(factorA.lastUsedAt ?? 0).getTime()
      );
    });

  if (availableUserVerifications.length > 0) {
    assertThat(
      verifiedMfa,
      new RequestError(
        {
          code: 'session.mfa.require_mfa_verification',
          status: 403,
        },
        {
          availableFactors: availableUserVerifications.map(({ type }) => type),
        }
      )
    );
  }

  return interaction;
};

export const userMfaDataKey = 'mfa';
/**
 * Check if the user has skipped MFA binding
 */
const isMfaSkipped = (logtoConfig: JsonObject): boolean => {
  const userMfaDataGuard = z.object({
    skipped: z.boolean().optional(),
  });

  const parsed = z.object({ [userMfaDataKey]: userMfaDataGuard }).safeParse(logtoConfig);

  return parsed.success ? parsed.data[userMfaDataKey].skipped === true : false;
};

export const validateMandatoryBindMfa = async (
  tenant: TenantContext,
  ctx: Context & WithInteractionSieContext & WithInteractionDetailsContext,
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

  const { mfaSkipped } = interaction;
  if (policy === MfaPolicy.UserControlled && mfaSkipped) {
    return interaction;
  }

  const hasFactorInBind = Boolean(
    bindMfas &&
      availableFactors.some((factor) => bindMfas.some((bindMfa) => bindMfa.type === factor))
  );

  if (hasFactorInBind) {
    return interaction;
  }

  if (event === InteractionEvent.SignIn) {
    const { accountId } = interaction;
    const { mfaVerifications, logtoConfig } = await tenant.queries.users.findUserById(accountId);

    if (isMfaSkipped(logtoConfig)) {
      return interaction;
    }

    // If the user has linked currently available MFA before
    const hasFactorInUser = availableFactors.some((factor) =>
      mfaVerifications.some(({ type }) => type === factor)
    );

    // MFA is bound in current interaction or MFA is bound before, skip check
    if (hasFactorInUser) {
      return interaction;
    }
  }

  throw new RequestError(
    {
      code: 'user.missing_mfa',
      status: 422,
    },
    policy === MfaPolicy.Mandatory ? { availableFactors } : { availableFactors, skippable: true }
  );
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
    bindMfas.some(({ type }) => type === MfaFactor.BackupCode)
  ) {
    return interaction;
  }

  // Skip check if there is no other MFA
  if (
    event === InteractionEvent.Register &&
    !bindMfas.some(({ type }) => type !== MfaFactor.BackupCode)
  ) {
    return interaction;
  }

  if (event === InteractionEvent.SignIn) {
    const { accountId } = interaction;
    const { mfaVerifications } = await tenant.queries.users.findUserById(accountId);

    // Skip check if there is no new MFA and there is no existing MFA configured
    if (
      !bindMfas.some(({ type }) => type !== MfaFactor.BackupCode) &&
      !mfaVerifications.some(({ type }) => type !== MfaFactor.BackupCode)
    ) {
      return interaction;
    }

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
