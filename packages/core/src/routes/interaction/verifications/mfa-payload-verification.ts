import {
  MfaFactor,
  type BindTotp,
  type BindTotpPayload,
  type BindMfaPayload,
  type BindMfa,
} from '@logto/schemas';

import type { WithLogContext } from '#src/middleware/koa-audit-log.js';
import assertThat from '#src/utils/assert-that.js';

import type { AnonymousInteractionResult } from '../types/index.js';
import { validateTotpToken } from '../utils/totp-validation.js';

const verifyBindTotp = async (
  interactionStorage: AnonymousInteractionResult,
  payload: BindTotpPayload,
  ctx: WithLogContext
): Promise<BindTotp> => {
  const { event, pendingMfa } = interactionStorage;
  ctx.createLog(`Interaction.${event}.BindMfa.Totp.Submit`);

  assertThat(pendingMfa, 'session.mfa.pending_info_not_found');
  // Will add more type, disable the rule for now, this can be a reminder when adding new type
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  assertThat(pendingMfa.type === MfaFactor.TOTP, 'session.mfa.pending_info_not_found');

  const { code, type } = payload;
  const { secret } = pendingMfa;

  assertThat(validateTotpToken(secret, code), 'session.mfa.invalid_totp_code');

  return { type, secret };
};

export async function bindMfaPayloadVerification(
  ctx: WithLogContext,
  bindMfaPayload: BindMfaPayload,
  interactionStorage: AnonymousInteractionResult
): Promise<BindMfa> {
  return verifyBindTotp(interactionStorage, bindMfaPayload, ctx);
}
