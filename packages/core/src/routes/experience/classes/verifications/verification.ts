import type { VerificationType } from '@logto/schemas';

/**
 * Parent class for all verification records
 */
export abstract class Verification {
  abstract readonly id: string;
  abstract readonly type: VerificationType;

  abstract get isVerified(): boolean;
  /**
   * @deprecated
   * TODO: Remove this @simeng-li, should get the userId asynchronously in real-time
   */
  abstract get verifiedUserId(): string | undefined;

  abstract toJson(): {
    id: string;
    type: VerificationType;
  } & Record<string, unknown>;
}
