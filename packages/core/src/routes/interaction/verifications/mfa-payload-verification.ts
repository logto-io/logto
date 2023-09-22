import {
  MfaFactor,
  type BindTotp,
  type BindTotpPayload,
  type BindMfaPayload,
  type BindMfa,
  type TotpVerificationPayload,
  type User,
  type MfaVerificationTotp,
  type VerifyMfaPayload,
  type VerifyMfaResult,
} from '@logto/schemas';

import type { WithLogContext } from '#src/middleware/koa-audit-log.js';
import type TenantContext from '#src/tenants/TenantContext.js';
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

const findUserTotp = (
  mfaVerifications: User['mfaVerifications']
): MfaVerificationTotp | undefined =>
  mfaVerifications.find((mfa): mfa is MfaVerificationTotp => mfa.type === MfaFactor.TOTP);

const verifyTotp = async (
  mfaVerifications: User['mfaVerifications'],
  payload: TotpVerificationPayload
): Promise<VerifyMfaResult> => {
  const totp = findUserTotp(mfaVerifications);

  // Can not found totp verification, this is an invalid request, throw invalid code error anyway for security reason
  assertThat(totp, 'session.mfa.invalid_totp_code');

  const { code } = payload;
  const { key, id, type } = totp;

  assertThat(validateTotpToken(key, code), 'session.mfa.invalid_totp_code');

  return { type, id };
};

export async function bindMfaPayloadVerification(
  ctx: WithLogContext,
  bindMfaPayload: BindMfaPayload,
  interactionStorage: AnonymousInteractionResult
): Promise<BindMfa> {
  return verifyBindTotp(interactionStorage, bindMfaPayload, ctx);
}

export async function verifyMfaPayloadVerification(
  tenant: TenantContext,
  accountId: string,
  verifyMfaPayload: VerifyMfaPayload
): Promise<VerifyMfaResult> {
  const user = await tenant.queries.users.findUserById(accountId);

  return verifyTotp(user.mfaVerifications, verifyMfaPayload);
}
