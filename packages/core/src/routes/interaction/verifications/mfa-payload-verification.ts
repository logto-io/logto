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
  type BindWebAuthn,
  type BindWebAuthnPayload,
} from '@logto/schemas';
import { isoBase64URL } from '@simplewebauthn/server/helpers';

import type { WithLogContext } from '#src/middleware/koa-audit-log.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import type { AnonymousInteractionResult } from '../types/index.js';
import { validateTotpToken } from '../utils/totp-validation.js';
import { verifyWebAuthnRegistration } from '../utils/webauthn.js';

const verifyBindTotp = async (
  interactionStorage: AnonymousInteractionResult,
  payload: BindTotpPayload,
  ctx: WithLogContext
): Promise<BindTotp> => {
  const { event, pendingMfa } = interactionStorage;
  ctx.createLog(`Interaction.${event}.BindMfa.Totp.Submit`);

  assertThat(pendingMfa, 'session.mfa.pending_info_not_found');
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

const verifyBindWebAuthn = async (
  interactionStorage: AnonymousInteractionResult,
  payload: BindWebAuthnPayload,
  ctx: WithLogContext,
  {
    rpId,
    userAgent,
    origin,
  }: {
    rpId: string;
    userAgent: string;
    origin: string;
  }
): Promise<BindWebAuthn> => {
  const { event, pendingMfa } = interactionStorage;
  ctx.createLog(`Interaction.${event}.BindMfa.Totp.Submit`);

  assertThat(pendingMfa, 'session.mfa.pending_info_not_found');
  assertThat(pendingMfa.type === MfaFactor.WebAuthn, 'session.mfa.pending_info_not_found');

  const { type, ...rest } = payload;
  const { challenge } = pendingMfa;
  const { verified, registrationInfo } = await verifyWebAuthnRegistration(
    rest,
    challenge,
    rpId,
    origin
  );

  assertThat(verified, 'session.mfa.webauthn_verification_failed');
  assertThat(registrationInfo, 'session.mfa.webauthn_verification_failed');

  const { credentialID, credentialPublicKey, counter } = registrationInfo;

  return {
    type,
    credentialId: isoBase64URL.fromBuffer(credentialID),
    publicKey: isoBase64URL.fromBuffer(credentialPublicKey),
    counter,
    agent: userAgent,
    transports: payload.response.transports ?? [],
  };
};

export async function bindMfaPayloadVerification(
  ctx: WithLogContext,
  bindMfaPayload: BindMfaPayload,
  interactionStorage: AnonymousInteractionResult,
  {
    rpId,
    userAgent,
    origin,
  }: {
    rpId: string;
    userAgent: string;
    origin: string;
  }
): Promise<BindMfa> {
  if (bindMfaPayload.type === MfaFactor.TOTP) {
    return verifyBindTotp(interactionStorage, bindMfaPayload, ctx);
  }

  return verifyBindWebAuthn(interactionStorage, bindMfaPayload, ctx, { rpId, userAgent, origin });
}

export async function verifyMfaPayloadVerification(
  tenant: TenantContext,
  accountId: string,
  verifyMfaPayload: VerifyMfaPayload
): Promise<VerifyMfaResult> {
  const user = await tenant.queries.users.findUserById(accountId);

  return verifyTotp(user.mfaVerifications, verifyMfaPayload);
}
