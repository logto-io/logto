import { InteractionEvent, MfaFactor, MfaPolicy } from '@logto/schemas';

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
          availableFactors: mfaVerifications.map(({ type }) => type),
        }
      )
    );
  }

  return interaction;
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

  if (policy !== MfaPolicy.Mandatory) {
    return interaction;
  }

  const hasFactorInBind = Boolean(
    bindMfas &&
      availableFactors.some((factor) => bindMfas.some((bindMfa) => bindMfa.type === factor))
  );

  if (event === InteractionEvent.Register) {
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
    const { accountId } = interaction;
    const { mfaVerifications } = await tenant.queries.users.findUserById(accountId);
    const hasFactorInUser = factors.some((factor) =>
      mfaVerifications.some(({ type }) => type === factor)
    );
    assertThat(
      hasFactorInBind || hasFactorInUser,
      new RequestError(
        {
          code: 'user.missing_mfa',
          status: 422,
        },
        { availableFactors }
      )
    );
  }

  return interaction;
};
