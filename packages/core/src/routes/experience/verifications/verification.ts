export enum VerificationType {
  Password = 'Password',
  VerificationCode = 'VerificationCode',
  Social = 'Social',
  TOTP = 'Totp',
  WebAuthn = 'WebAuthn',
  BackupCode = 'BackupCode',
}

/**
 * Parent class for all verification records
 */
export abstract class Verification {
  abstract readonly id: string;
  abstract readonly type: VerificationType;

  abstract get isVerified(): boolean;
  abstract get verifiedUserId(): string | undefined;

  abstract toJson(): {
    id: string;
    type: VerificationType;
  } & Record<string, unknown>;
}
