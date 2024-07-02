import type { VerificationType } from '@logto/schemas';

type Data<T> = {
  id: string;
  type: T;
};

/** The abstract class for all verification records. */
export abstract class VerificationRecord<
  T extends VerificationType = VerificationType,
  Json extends Data<T> = Data<T>,
> {
  abstract readonly id: string;
  abstract readonly type: T;

  abstract get isVerified(): boolean;
  /** @deprecated will be removed in the coming PR */
  abstract get verifiedUserId(): string | undefined;

  abstract toJson(): Json;
}
