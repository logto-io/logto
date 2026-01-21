import { z } from 'zod';

/** The action target type of a sentinel activity. */
export enum SentinelActivityTargetType {
  User = 'User',
  App = 'App',
}
export const sentinelActivityTargetTypeGuard = z.nativeEnum(SentinelActivityTargetType);

/** The action type of a sentinel activity. */
export enum SentinelActivityAction {
  /**
   * The subject tries to pass a verification by inputting a password.
   *
   * For example, a user (subject) who inputted a password (action) to authenticate themselves
   * (target).
   */
  Password = 'Password',
  /**
   * The subject tries to pass a verification by inputting a verification code.
   *
   * For example, a user (subject) who inputted a verification code (action) to authenticate
   * themselves (target).
   */
  VerificationCode = 'VerificationCode',
  /**
   * The subject tries to pass a verification by inputting a one-time token.
   *
   * For example, a user (subject) who inputted a one-time token (action) to authenticate
   * themselves (target), e.g. Magic Link.
   */
  OneTimeToken = 'OneTimeToken',
  /**
   * The subject tries to pass a TOTP MFA verification.
   */
  MfaTotp = 'MfaTotp',
  /**
   * The subject tries to pass a WebAuthn MFA verification.
   */
  MfaWebAuthn = 'MfaWebAuthn',
  /**
   * The subject tries to pass a backup code MFA verification.
   */
  MfaBackupCode = 'MfaBackupCode',
}
export const sentinelActivityActionGuard = z.nativeEnum(SentinelActivityAction);

export type SentinelActivityPayload = Record<string, unknown>;
export const sentinelActivityPayloadGuard = z.record(
  z.unknown()
) satisfies z.ZodType<SentinelActivityPayload>;
