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
} from '../types/index.js';

export const verifyBindMfa = async (
  tenant: TenantContext,
  interaction: VerifiedSignInInteractionResult | VerifiedRegisterInteractionResult
): Promise<VerifiedInteractionResult> => {
  const { bindMfa, event } = interaction;

  if (!bindMfa || event !== InteractionEvent.SignIn) {
    return interaction;
  }

  const { type } = bindMfa;

  // There will be more types later
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (type === MfaFactor.TOTP) {
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

export const validateMandatoryBindMfa = async (
  tenant: TenantContext,
  ctx: WithInteractionSieContext & WithInteractionDetailsContext,
  interaction: VerifiedSignInInteractionResult | VerifiedRegisterInteractionResult
): Promise<VerifiedInteractionResult> => {
  const {
    mfa: { policy, factors },
  } = ctx.signInExperience;
  const { event, bindMfa } = interaction;

  if (policy !== MfaPolicy.Mandatory) {
    return interaction;
  }

  const hasEnoughBindFactor = Boolean(bindMfa && factors.includes(bindMfa.type));

  if (event === InteractionEvent.Register) {
    assertThat(
      hasEnoughBindFactor,
      new RequestError({
        code: 'user.missing_mfa',
        status: 422,
      })
    );
  }

  if (event === InteractionEvent.SignIn) {
    const { accountId } = interaction;
    const { mfaVerifications } = await tenant.queries.users.findUserById(accountId);
    assertThat(
      hasEnoughBindFactor ||
        factors.some((factor) => mfaVerifications.some(({ type }) => type === factor)),
      new RequestError({
        code: 'user.missing_mfa',
        status: 422,
      })
    );
  }

  return interaction;
};
